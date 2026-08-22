import os
import sys
import pytest

# Ensure project root in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.rag_retrieval import get_chroma_collection, retrieve, build_query_from_factors

def test_knowledge_base_embedding_non_empty():
    """
    Test that knowledge base embeds without error and ChromaDB collection contains >= 8 SOPs.
    """
    collection = get_chroma_collection()
    assert collection is not None
    assert collection.count() >= 8, f"Expected at least 8 SOP documents, got {collection.count()}"

def test_overdue_maintenance_relevance_retrieval():
    """
    Test key correctness requirement:
    A query about 'overdue maintenance pump' must retrieve SOP-101 (overdue maintenance),
    not an unrelated document, with similarity_score above 0.30 threshold.
    """
    query = "overdue maintenance pump bearing lubrication protocol"
    results = retrieve(query, top_k=2)

    assert len(results) >= 1
    top_match = results[0]
    
    assert "SOP-101" in top_match["source_title"] or "Centrifugal Pump" in top_match["source_title"]
    assert top_match["similarity_score"] > 0.30
    assert "maintenance" in top_match["text"].lower() or "pump" in top_match["text"].lower()

def test_retrieve_top_k_format():
    """
    Test retrieve(query, top_k=2) returns exactly 2 items with expected keys.
    """
    query = "vibration monitoring threshold"
    results = retrieve(query, top_k=2)

    assert len(results) == 2

    for res in results:
        assert "text" in res
        assert "source_title" in res
        assert "similarity_score" in res
        assert isinstance(res["similarity_score"], float)
        assert 0.0 <= res["similarity_score"] <= 1.0

def test_console_print_sample_queries_quality():
    """
    Console print check displaying retrieved SOP snippets for 3 distinct industrial sample queries.
    """
    sample_queries = [
        "overdue maintenance centrifugal pump bearing lubrication",
        "pressure vessel wall thickness ultrasonic inspection protocol",
        "vibration telemetry out of range ISO 10816 class III threshold"
    ]

    print("\n==========================================================================================================")
    print("                    RISK RADAR RAG RETRIEVAL AGENT - KNOWLEDGE BASE QUERY QUALITY CHECK                  ")
    print("==========================================================================================================")
    for q_idx, q in enumerate(sample_queries, 1):
        print(f"\nQUERY #{q_idx}: \"{q}\"")
        print("-" * 110)
        retrieved = retrieve(q, top_k=2)
        for r_idx, item in enumerate(retrieved, 1):
            snippet_preview = item['text'].replace('\n', ' ')[:130] + "..."
            print(f"  Result #{r_idx} | Title: {item['source_title']:<45} | Similarity: {item['similarity_score']:.4f}")
            print(f"             Snippet: {snippet_preview}")
    print("==========================================================================================================\n")
