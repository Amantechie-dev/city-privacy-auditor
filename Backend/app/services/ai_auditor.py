import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import JsonOutputParser

load_dotenv()

def run_compliance_audit(city_logs):
    
    llm = ChatGoogleGenerativeAI(
        model="gemini-3.5-flash",
        temperature=0,
        google_api_key=os.getenv("GOOGLE_API_KEY")
    )

    system_prompt = """
    You are an AI auditor for a municipal corporation enforcing digital rights laws.
    
    LEGAL RULE: "Facial recognition and biometric data (PII) cannot be stored for more than 30 days under any circumstances."
    
    Analyze the provided surveillance logs. Return a strict JSON object with a single key "violations". 
    The value should be a list of objects containing 'event_id', 'violation_reason', and 'severity_level' (High/Medium/Low).
    If there are no violations, return an empty list for "violations".
    """

    prompt = ChatPromptTemplate.from_messages([
        ("system", system_prompt),
        ("human", "Audit these logs: {logs}")
    ])

    parser = JsonOutputParser()
    chain = prompt | llm | parser

    return chain.invoke({"logs": city_logs})