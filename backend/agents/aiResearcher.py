import requests
import json
from anthropic import Anthropic
import os
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

API_KEY = os.getenv("ARYA_API_KEY")
if not API_KEY:
    raise RuntimeError("ARYA_API_KEY not set")

client = Anthropic(api_key=API_KEY)


# ----------------------------------------------------
# Step 1 — Fetch REAL research using PubMed API
# ----------------------------------------------------
def fetch_pubmed_results(diagnosis: str):
    query = diagnosis.replace(" ", "+")
    url = f"https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi"
    params = {
        "db": "pubmed",
        "term": query,
        "retmode": "json",
        "retmax": "10"     # only grab top 10 IDs
    }

    try:
        resp = requests.get(url, params=params, timeout=10).json()
    except:
        return []

    ids = resp.get("esearchresult", {}).get("idlist", [])
    if not ids:
        return []

    # Fetch paper details
    detail_url = "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi"
    detail_params = {
        "db": "pubmed",
        "id": ",".join(ids),
        "retmode": "json"
    }

    try:
        detail_resp = requests.get(detail_url, params=detail_params, timeout=10).json()
    except:
        return []

    papers = []
    for pid in ids:
        data = detail_resp.get("result", {}).get(pid)
        if not data:
            continue

        title = data.get("title", "")
        url = f"https://pubmed.ncbi.nlm.nih.gov/{pid}/"

        papers.append({"title": title, "url": url})

    return papers


# ----------------------------------------------------
# Step 2 — Claude summarizer (NO URL hallucinations)
# ----------------------------------------------------
def summarize_pubmed(diagnosis: str, papers: list):

    prompt = f"""
You are Agent 4: Research Summarizer.

You ONLY choose from the papers provided below.
You MUST NOT invent titles or URLs.

Diagnosis: {diagnosis}

Papers:
{json.dumps(papers, indent=2)}

Pick the 3–5 MOST relevant items.

Return STRICT JSON ONLY:

{{
  "diagnosis": "{diagnosis}",
  "research": [
    {{"title": "", "url": ""}}
  ]
}}
"""

    response = client.messages.create(
        model="claude-3-5-haiku-latest",
        temperature=0,
        max_tokens=700,
        messages=[{"role": "user", "content": prompt}]
    )

    return response.content[0].text


# ----------------------------------------------------
# Step 3 — Agent 4 main
# ----------------------------------------------------
def agent4(diagnosis: str):
    papers = fetch_pubmed_results(diagnosis)

    if not papers:
        return {"diagnosis": diagnosis, "research": []}

    summary = summarize_pubmed(diagnosis, papers)

    try:
        return json.loads(summary)
    except:
        return {
            "diagnosis": diagnosis,
            "research": papers[:5]
        }
