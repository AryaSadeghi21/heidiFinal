import os
import json
from pathlib import Path
from anthropic import Anthropic

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

API_KEY = os.getenv("ARYA_API_KEY")
if not API_KEY:
    raise RuntimeError("ARYA_API_KEY not set")

client = Anthropic(api_key=API_KEY)




# ---------------------------------------
# Initialization
# ---------------------------------------




# ---------------------------------------
# LLM Caller
# ---------------------------------------

def call_llm(prompt: str):
    response = client.messages.create(
        model="claude-3-5-haiku-latest",
        max_tokens=1000,
        temperature=0,
        messages=[
            {
                "role": "user",
                "content": [{"type": "text", "text": prompt}]
            }
        ]
    )
    return response.content[0].text


# ---------------------------------------
# Agent 0 Prompt
# ---------------------------------------

AGENT0_PROMPT = """
You are Agent 0.

Your job is to take ANY unstructured clinical text about a patient 
and convert it into STRICT JSON with the following EXACT keys:

{
  "name": "",
  "dob": "",
  "age": null,
  "sex": "",
  "pregnant": false,
  "allergies": [],
  "conditions": [],
  "diagnosis": ""
}

RULES:
1. Only extract information explicitly stated in the text.
2. Normalize:
   - sex → "male", "female", or "other"
   - allergies → lowercase list, no duplicates
   - diagnosis → short, clean clinical phrase
   - dob must be in YYYY-MM-DD format if present
3. Pregnancy:
   - if pregnant → pregnant=true
4. If DOB is missing but age is provided, fill age and leave dob=""
5. If both DOB and age missing → age=null
6. No hallucinating missing details.
7. Output STRICT JSON ONLY. No comments, no explanations.
"""


# ---------------------------------------
# Agent 0 Main Function
# ---------------------------------------

def agent0(text: str):
    """
    Input:
        text (str) — raw patient description

    Output:
        dict — normalized patient JSON
    """

    prompt = f"{AGENT0_PROMPT}\n\nPatient text:\n{text}\n\nOutput JSON:"
    raw = call_llm(prompt)

    # Try to load JSON
    try:
        return json.loads(raw)
    except:
        # Repair attempt if model adds stray text
        repair_prompt = f"""
Fix the following into valid JSON ONLY, matching EXACTLY this schema:

{{
  "name": "",
  "dob": "",
  "age": null,
  "sex": "",
  "pregnant": false,
  "allergies": [],
  "conditions": [],
  "diagnosis": ""
}}

No explanation. JSON only.

Broken JSON:
{raw}
"""
        repaired = call_llm(repair_prompt)

        try:
            return json.loads(repaired)
        except:
            # Worst-case fallback
            return {
                "name": "",
                "dob": "",
                "age": None,
                "sex": "",
                "pregnant": False,
                "allergies": [],
                "conditions": [],
                "diagnosis": ""
            }

