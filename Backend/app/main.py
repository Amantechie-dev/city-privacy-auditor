from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import json
import sqlite3
from datetime import datetime
from langchain_google_genai import ChatGoogleGenerativeAI, GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_core.documents import Document
from dotenv import load_dotenv
load_dotenv()
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DB_PATH = "audit_records.db"

def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            event_id TEXT,
            severity_level TEXT,
            violation_reason TEXT
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS app_actions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            action_type TEXT,
            details TEXT
        )
    """)
    conn.commit()
    conn.close()

init_db()

def log_action(action_type: str, details: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO app_actions (timestamp, action_type, details)
        VALUES (?, ?, ?)
    """, (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), action_type, details))
    conn.commit()
    conn.close()

def save_audit_record(event_id: str, severity: str, reason: str):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO audit_logs (timestamp, event_id, severity_level, violation_reason)
        VALUES (?, ?, ?, ?)
    """, (datetime.now().strftime("%Y-%m-%d %H:%M:%S"), event_id, severity, reason))
    conn.commit()
    conn.close()

legal_texts = [
    Document(page_content="Section 101: Traffic and vehicle counting data without personal identifiable information (PII) is considered public infrastructure data and may be retained indefinitely."),
    Document(page_content="Section 102: Biometric data, including facial recognition scans, constitutes highly sensitive PII. Municipalities must not retain this data for more than 30 days without a specific criminal warrant."),
    Document(page_content="Section 103: Public Wi-Fi access points and municipal routers are strictly prohibited from logging, tracking, or retaining citizen MAC addresses and location history for a period exceeding 24 hours without explicit, documented opt-in consent.")
]

api_key = os.getenv("GEMINI_API_KEY")
embeddings = GoogleGenerativeAIEmbeddings(model="gemini-embedding-2-preview", google_api_key=api_key)
vector_store = FAISS.from_documents(legal_texts, embeddings)
llm = ChatGoogleGenerativeAI(model="gemini-3.6-flash", google_api_key=api_key, temperature=0)

class AuditRequest(BaseModel):
    logs: list

class ActionRequest(BaseModel):
    action_type: str
    details: str

@app.post("/api/audit")
async def run_audit(request: AuditRequest):
    logs_str = json.dumps(request.logs)
    retrieved_docs = vector_store.similarity_search(logs_str, k=2)
    legal_context = "\n".join([doc.page_content for doc in retrieved_docs])
    
    prompt = f"""
    You are an expert AI legal auditor for a municipal digital rights oversight committee.
    RELEVANT DIGITAL RIGHTS LAWS:
    {legal_context}
    INCOMING MUNICIPAL DATA LOGS:
    {logs_str}
    TASK:
    Audit the data logs against the provided laws. Return ONLY a valid JSON object with a single key "violations" containing a list of objects.
    If compliant: {{"violations": []}}
    If violation: event_id, severity_level ("HIGH", "MEDIUM", "LOW"), and violation_reason.
    JSON Output:
    """
    
    response = llm.invoke(prompt)
    raw_content = response.content
    if isinstance(raw_content, list):
        raw_content = raw_content[0].get("text", "") if isinstance(raw_content[0], dict) else str(raw_content[0])
        
    clean_json = raw_content.replace("```json", "").replace("```", "").strip()
    
    try:
        verdict = json.loads(clean_json)
        if verdict.get("violations"):
            for v in verdict["violations"]:
                save_audit_record(v.get("event_id", "UNKNOWN"), v.get("severity_level", "LOW"), v.get("violation_reason", ""))
        else:
            save_audit_record("COMPLIANT_STREAM", "NONE", "All sensors satisfied digital privacy constraints.")
        return verdict
    except Exception as e:
        return {"violations": [{"event_id": "SYSTEM_ERROR", "severity_level": "HIGH", "violation_reason": f"Failed to parse AI response: {str(e)}"}]}

@app.post("/api/action")
async def record_action(req: ActionRequest):
    log_action(req.action_type, req.details)
    return {"status": "success", "message": "Action recorded to database"}

@app.get("/api/history")
async def get_history():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT timestamp, event_id, severity_level, violation_reason FROM audit_logs ORDER BY id DESC LIMIT 20")
    rows = cursor.fetchall()
    conn.close()
    history = [{"timestamp": r[0], "event_id": r[1], "severity_level": r[2], "violation_reason": r[3]} for r in rows]
    return {"history": history}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)