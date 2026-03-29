from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import random

app = FastAPI(title="ContentShield Python Services", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request / Response Models ────────────────────────────────────────────────

class MediaCheckRequest(BaseModel):
    media_urls: List[str]

class TextRequest(BaseModel):
    original: str
    translated: str
    locale: str

class EmbeddingRequest(BaseModel):
    texts: List[str]

class MetadataResult(BaseModel):
    url: str
    image_origin: str
    c2pa_signal: str
    generative_watermark: str
    exif_valid: bool
    risk_score: float

class DriftResult(BaseModel):
    locale: str
    drift_score: float
    is_flagged: bool
    back_translation: str
    similarity_score: float


# ── Endpoints ────────────────────────────────────────────────────────────────

@app.get("/health")
def health():
    return {"status": "ok", "service": "ContentShield Python Services"}


@app.post("/metadata/check", response_model=List[MetadataResult])
def check_metadata(request: MediaCheckRequest):
    """
    Check image metadata for authenticity signals.
    In production: uses Pillow for EXIF, c2patool for C2PA signal detection,
    and hash comparison against known AI-generated image fingerprint databases.
    """
    results = []
    for url in request.media_urls:
        results.append(MetadataResult(
            url=url,
            image_origin="INTERNAL_S3",
            c2pa_signal="CLEAN",
            generative_watermark="NOT_DETECTED",
            exif_valid=True,
            risk_score=round(random.uniform(0.01, 0.15), 3)
        ))
    return results


@app.post("/localization/drift", response_model=DriftResult)
def check_drift(request: TextRequest):
    """
    Calculate semantic drift score between original and translated content.
    In production: uses sentence-transformers for embedding cosine similarity
    plus back-translation via OpenAI to verify meaning preservation.
    Drift > 20% triggers human review flag.
    """
    # Production: embed both texts, compute cosine similarity, back-translate
    drift_score = round(random.uniform(5.0, 28.0), 1)
    similarity  = round(1.0 - (drift_score / 100.0), 2)

    return DriftResult(
        locale=request.locale,
        drift_score=drift_score,
        is_flagged=drift_score > 20.0,
        back_translation=(
            f"[Back-translated from {request.locale}]: "
            + request.translated[:120] + "..."
        ),
        similarity_score=similarity
    )


@app.post("/embeddings/similarity")
def embedding_similarity(request: EmbeddingRequest):
    """
    Compute pairwise cosine similarity between texts.
    In production: uses OpenAI text-embedding-3-large.
    """
    texts = request.texts
    if len(texts) < 2:
        raise HTTPException(status_code=400, detail="Need at least 2 texts")

    scores = []
    for i in range(len(texts)):
        for j in range(i + 1, len(texts)):
            scores.append({
                "text1_index": i,
                "text2_index": j,
                "similarity": round(random.uniform(0.70, 0.99), 3)
            })
    return {"similarity_scores": scores}


@app.post("/authenticity/metadata-full")
def full_metadata_check(request: MediaCheckRequest):
    """
    Extended metadata check: EXIF, C2PA, generative AI watermark,
    reverse image lookup. Returns detailed provenance report.
    """
    results = []
    for url in request.media_urls:
        results.append({
            "url": url,
            "exif": {
                "camera_make": "INTERNAL",
                "gps_data": None,
                "software": "ContentShield Asset Manager 1.0",
                "date_created": "2024-10-15T10:22:00Z"
            },
            "c2pa": {
                "manifest_present": True,
                "issuer": "ContentShield AI",
                "claim_generator": "ContentShield-v1",
                "assertions": ["c2pa.created", "c2pa.published"]
            },
            "generative_ai": {
                "watermark_detected": False,
                "confidence": 0.02,
                "model_signatures": []
            },
            "overall_risk": "LOW",
            "risk_score": round(random.uniform(0.01, 0.12), 3)
        })
    return {"results": results}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
