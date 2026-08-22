import os
import sys
import glob
import logging
from typing import List, Dict, Any, Optional
import chromadb
from chromadb.config import Settings
from sentence_transformers import SentenceTransformer

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

logger = logging.getLogger(__name__)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)
    logger.setLevel(logging.INFO)

# Directory paths
KNOWLEDGE_BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "knowledge_base", "sops"))
CHROMA_DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "chroma_db"))

MODEL_NAME = "all-MiniLM-L6-v2"
COLLECTION_NAME = "risk_radar_sops"

_GLOBAL_EMBEDDER: Optional[SentenceTransformer] = None
_GLOBAL_CHROMA_CLIENT: Optional[chromadb.PersistentClient] = None
_GLOBAL_COLLECTION = None

def get_embedder() -> SentenceTransformer:
    """Load or return cached sentence-transformers embedding model"""
    global _GLOBAL_EMBEDDER
    if _GLOBAL_EMBEDDER is None:
        logger.info(f"Loading sentence-transformers model '{MODEL_NAME}'...")
        _GLOBAL_EMBEDDER = SentenceTransformer(MODEL_NAME)
    return _GLOBAL_EMBEDDER

def get_chroma_collection(force_reindex: bool = False):
    """
    Initialize persistent ChromaDB client and populate SOP documents if empty.
    
    Why:
    Persists document vectors locally under chroma_db/ to avoid re-embedding on every restart.
    """
    global _GLOBAL_CHROMA_CLIENT, _GLOBAL_COLLECTION

    if _GLOBAL_COLLECTION is not None and not force_reindex:
        return _GLOBAL_COLLECTION

    os.makedirs(CHROMA_DB_DIR, exist_ok=True)
    _GLOBAL_CHROMA_CLIENT = chromadb.PersistentClient(path=CHROMA_DB_DIR)

    embedder = get_embedder()

    # Define custom embedding wrapper function for ChromaDB compatibility
    class SentenceTransformerEmbeddingFunction:
        def __call__(self, input: List[str]) -> List[List[float]]:
            embeddings = embedder.encode(input, convert_to_numpy=True)
            return embeddings.tolist()

    emb_fn = SentenceTransformerEmbeddingFunction()

    collection = _GLOBAL_CHROMA_CLIENT.get_or_create_collection(
        name=COLLECTION_NAME,
        metadata={"hnsw:space": "cosine"}
    )

    # Check if collection is empty or force reindex
    if collection.count() == 0 or force_reindex:
        logger.info(f"Indexing SOP documents from '{KNOWLEDGE_BASE_DIR}' into ChromaDB...")

        sop_files = glob.glob(os.path.join(KNOWLEDGE_BASE_DIR, "*.md")) + glob.glob(os.path.join(KNOWLEDGE_BASE_DIR, "*.txt"))
        
        documents = []
        metadatas = []
        ids = []

        for idx, file_path in enumerate(sop_files):
            filename = os.path.basename(file_path)
            with open(file_path, "r", encoding="utf-8") as f:
                content = f.read()

            title = filename.replace(".md", "").replace(".txt", "").replace("_", " ").title()
            first_line = content.strip().split("\n")[0]
            if first_line.startswith("# "):
                title = first_line.replace("# ", "").strip()

            documents.append(content)
            metadatas.append({"source_title": title, "filename": filename})
            ids.append(f"doc_{idx}_{filename}")

        if documents:
            embeddings = emb_fn(documents)
            collection.add(
                documents=documents,
                embeddings=embeddings,
                metadatas=metadatas,
                ids=ids
            )
            logger.info(f"Successfully embedded and indexed {len(documents)} SOP documents in ChromaDB.")

    _GLOBAL_COLLECTION = collection
    return collection

def retrieve(query: str, top_k: int = 2) -> List[Dict[str, Any]]:
    """
    Query ChromaDB vector index for top-k matching SOP snippets.
    
    Why:
    Performs semantic vector search using all-MiniLM-L6-v2 cosine similarity embeddings.
    Returns structured list of matches with document text, source title, and similarity score.
    """
    collection = get_chroma_collection()
    embedder = get_embedder()

    query_vector = embedder.encode([query], convert_to_numpy=True).tolist()

    results = collection.query(
        query_embeddings=query_vector,
        n_results=top_k
    )

    retrieved_items = []
    if results and results.get("documents") and results["documents"][0]:
        docs = results["documents"][0]
        meta = results["metadatas"][0] if results.get("metadatas") else [{}] * len(docs)
        distances = results["distances"][0] if results.get("distances") else [0.0] * len(docs)

        for i in range(len(docs)):
            # Cosine similarity = 1 - cosine distance
            dist = float(distances[i])
            similarity = round(max(0.0, 1.0 - dist), 4)

            retrieved_items.append({
                "text": docs[i],
                "source_title": meta[i].get("source_title", "Industrial SOP"),
                "filename": meta[i].get("filename", ""),
                "similarity_score": similarity
            })

    return retrieved_items

def build_query_from_factors(factor_breakdown: Dict[str, Any], asset_name: str = "Industrial Asset") -> str:
    """
    Construct a focused vector search query string based on an asset's dominant risk factors.
    
    Why:
    Inspects rule engine factor contributions or SHAP values to identify what primary issue
    (e.g., overdue maintenance, vibration deviation, pressure vessel inspection) is driving risk.
    """
    query_parts = [asset_name]

    factors = factor_breakdown.get("factors", {})
    top_factor_name = None
    max_contrib = -1.0

    for factor_key, details in factors.items():
        contrib = float(details.get("weighted_contribution", 0.0))
        if contrib > max_contrib:
            max_contrib = contrib
            top_factor_name = factor_key

    if top_factor_name == "maintenance_recency":
        query_parts.append("overdue maintenance pump bearing lubrication service schedule")
    elif top_factor_name == "sensor_deviation":
        query_parts.append("vibration telemetry sensor out of range threshold exceedance")
    elif top_factor_name == "inspection_severity":
        query_parts.append("pressure vessel wall thickness inspection severe finding protocol")
    elif top_factor_name == "failure_history":
        query_parts.append("emergency failure repair compressor rotor dynamic balancing")
    else:
        query_parts.append("general plant safety hazard escalation isolation protocol")

    return " ".join(query_parts)
