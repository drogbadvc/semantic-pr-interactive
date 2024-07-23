from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import requests
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_URL = "https://api-inference.huggingface.co/models/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2"
headers = {"Authorization": "Bearer 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"}


class QueryData(BaseModel):
    source_sentence: str
    target_sentences: list


@app.post("/similarity/")
def query_hf_api(data: QueryData):
    payload = {
        "inputs": {
            "source_sentence": data.source_sentence,
            "sentences": data.target_sentences
        },
        "options": {
            "wait_for_model": True
        }
    }

    try:
        response = requests.post(API_URL, headers=headers, json=payload)
        response.raise_for_status()
    except requests.RequestException as e:
        raise HTTPException(status_code=response.status_code, detail=str(e))

    return response.json()
