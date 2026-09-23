from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Any
from app.services.ai_auditor import run_compliance_audit

router = APIRouter()


class AuditRequest(BaseModel):
    logs: List[Any]

@router.post("/audit")
async def trigger_audit(request: AuditRequest):
    try:
        
        audit_results = run_compliance_audit(request.logs)
        return audit_results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))