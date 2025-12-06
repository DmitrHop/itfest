#!/usr/bin/env python3
"""Test queries for RAG system."""

import sys
import time
import requests
from pathlib import Path

# Test queries
TEST_QUERIES = [
    {
        "question": "Какой университет выбрать для IT с баллом ЕНТ 75?",
        "filters": None
    },
    {
        "question": "Где можно учиться на врача в Алматы?",
        "filters": {"city": "Алматы", "category": "Медицина"}
    },
    {
        "question": "Технические ВУЗы в Астане",
        "filters": {"city": "Астана"}
    },
    {
        "question": "Сравни КазНУ и КБТУ для программиста",
        "filters": None
    },
    {
        "question": "У меня 90 баллов ЕНТ, люблю биологию, что посоветуешь?",
        "filters": None
    },
    {
        "question": "Университеты с экономическими специальностями",
        "filters": {"category": "Бизнес и экономика"}
    },
    {
        "question": "Педагогические университеты Казахстана",
        "filters": {"category": "Педагогика"}
    },
]

BASE_URL = "http://localhost:8000"


def test_health():
    """Test health endpoint."""
    print("🏥 Testing health endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=10)
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Status: {data['status']}")
            print(f"   📊 Documents: {data['vector_db_count']}")
            print(f"   🤖 Gemini: {data['gemini_status']}")
            return True
        else:
            print(f"   ❌ Failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ❌ Error: {e}")
        return False


def test_query(query_data: dict, index: int):
    """Test a single query."""
    print(f"\n{'='*60}")
    print(f"📌 Test {index}: {query_data['question'][:50]}...")
    print(f"{'='*60}")
    
    try:
        start_time = time.time()
        
        response = requests.post(
            f"{BASE_URL}/query",
            json=query_data,
            timeout=60
        )
        
        elapsed = time.time() - start_time
        
        if response.status_code == 200:
            data = response.json()
            
            print(f"\n⏱️ Response time: {elapsed:.2f}s (cached: {data.get('cached', False)})")
            print(f"📚 Sources: {len(data['sources'])} universities")
            
            if data['sources']:
                print("\n🏛️ Top sources:")
                for src in data['sources'][:3]:
                    print(f"   - {src['name']} ({src['city']}) - score: {src['relevance_score']:.3f}")
            
            print(f"\n💬 Answer preview:")
            answer_preview = data['answer'][:500] + "..." if len(data['answer']) > 500 else data['answer']
            print(answer_preview)
            
            return True
        else:
            print(f"❌ Failed: {response.status_code}")
            print(response.text)
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False


def run_tests():
    """Run all tests."""
    print("\n" + "="*60)
    print("🧪 University RAG System - Test Suite")
    print("="*60)
    
    # Check if server is running
    if not test_health():
        print("\n❌ Server is not running. Start with: python run.py")
        return
    
    # Run query tests
    passed = 0
    failed = 0
    
    for i, query in enumerate(TEST_QUERIES, 1):
        if test_query(query, i):
            passed += 1
        else:
            failed += 1
    
    # Summary
    print("\n" + "="*60)
    print("📊 Test Summary")
    print("="*60)
    print(f"   ✅ Passed: {passed}")
    print(f"   ❌ Failed: {failed}")
    print(f"   📈 Total:  {len(TEST_QUERIES)}")
    print("="*60)


if __name__ == "__main__":
    run_tests()
