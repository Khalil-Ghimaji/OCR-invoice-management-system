from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from pathlib import Path
from typing import Dict, Any
import os, tempfile
import uvicorn
from starlette.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
load_dotenv()

from groq_client import InvoiceOCR
from fastapi import Header, HTTPException, status, Depends

def verify_token(authorization: str = Header(...)):
    if authorization != f"Bearer {os.getenv('BACKEND_ACCESS_TOKEN')}":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing token",
        )
# -------------------------
# FastAPI app
# -------------------------
app = FastAPI(
    title="Invoice OCR API",
    description="API OCR pour factures et PDF multi-pages",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_headers=["*"],
)

# Initialise OCR client
ocr = InvoiceOCR(api_key=os.getenv("GROQ_API_KEY", None), seed=1234)

# -------------------------
# Pydantic models
# -------------------------
class FilePathRequest(BaseModel):
    file_path: str

# -------------------------
# Routes
# -------------------------
@app.get("/")
async def root():
    return {"message": "Invoice OCR API", "version": "1.0.0", "status": "active"}

@app.post("/extract-invoice", response_model=Dict[str, Any], dependencies=[Depends(verify_token)])
async def extract_invoice_endpoint(request: FilePathRequest):
    if not Path(request.file_path).exists():
        raise HTTPException(status_code=404, detail=f"Fichier {request.file_path} introuvable")
    try:
        result = ocr.extract_invoice(request.file_path)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/extract-invoice-simple", response_model=Dict[str, Any], dependencies=[Depends(verify_token)])
async def extract_invoice_simple_endpoint(request: FilePathRequest):
    if not Path(request.file_path).exists():
        raise HTTPException(status_code=404, detail=f"Fichier {request.file_path} introuvable")
    try:
        result = ocr.extract_invoice_simple(request.file_path)
        return JSONResponse(content=result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------
# Upload endpoints
# -------------------------
@app.post("/upload-invoice",dependencies=[Depends(verify_token)])
async def upload_and_extract_invoice(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
        try:
            result = ocr.extract_invoice(tmp_path)
            return JSONResponse(content=result)
        finally:
            os.unlink(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload-invoice-simple",dependencies=[Depends(verify_token)])
async def upload_and_extract_invoice_simple(file: UploadFile = File(...)):
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=Path(file.filename).suffix) as tmp:
            tmp.write(await file.read())
            tmp_path = tmp.name
        try:
            result = ocr.extract_invoice_simple(tmp_path)
            return JSONResponse(content=result)
        finally:
            os.unlink(tmp_path)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/test")
async def test_all():
    test_files = [
        "test_files/invoice1.pdf",
        "test_files/invoice2.pdf"
    ]
    results = {}
    for file_path in test_files:
        if Path(file_path).exists():
            try:
                result = ocr.extract_invoice(file_path)
                results[file_path] = result
            except Exception as e:
                results[file_path] = {"error": str(e)}
        else:
            results[file_path] = {"error": "File not found"}
    return JSONResponse(content=results)

# -------------------------
# Main
# -------------------------
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
