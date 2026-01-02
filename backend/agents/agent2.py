import os
import json
from pathlib import Path
try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from anthropic import Anthropic

# ---------------------------------------
# Initialization
# ---------------------------------------

API_KEY = os.getenv("ARYA_API_KEY")
if not API_KEY:
    raise RuntimeError("ARYA_API_KEY not set")

client = Anthropic(api_key=API_KEY)

STATIC_PATH = Path(__file__).resolve().parent.parent / "static"


# ---------------------------------------
# Static Rules (Optional)
# ---------------------------------------

def load_outdated():
    path = STATIC_PATH / "outdated_meds.json"
    if not path.exists():
        return {}
    with open(path, "r") as f:
        return json.load(f)


# ---------------------------------------
# LLM Caller (Correct Claude 3.5 Format)
# ---------------------------------------

def call_llm(prompt: str):
    response = client.messages.create(
        model="claude-3-5-haiku-latest",
        max_tokens=3000,
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
# Research Prompt — DRUGS ONLY
# ---------------------------------------

def llm_research_query(diagnosis: str, drug_list: list):

    drug_json = json.dumps(drug_list)

    prompt = f"""
You are a medical research assistant.

Your ONLY job is to evaluate MEDICATIONS related to the diagnosis: "{diagnosis}"
using CURRENT (2022–2025) high-quality evidence ONLY.

Allowed:
- CDC, WHO, NICE, IDSA
- Cochrane Reviews
- AAFP, AAP
- Specialty societies
- Large RCTs + meta-analyses

STRICT RULES:
- Drugs ONLY
- No supportive care
- No new meds not in list
- No dosages
- No speculation

Drugs to evaluate:
{drug_json}

For each drug:
1. Determine if research SUPPORTS its use for the diagnosis.
   - supported → "valid_drug"
   - not supported → "invalid_drug"

4. Provide links to other relevant links and resrouces to papers related to the diagnosis. This should consist of URLS and titles. these papers should be about management, treatment guidelines, and / or relevant research for the diagnosis.
These links should NOT be specific to any drug. ONLY general management of the diagnosis.

- For each citation, provide a **direct URL** to the source (e.g., DOI link, publisher page, or guideline document link).
- Ensure the URL is valid (starts with http:// or https://) and accessible.

GLOBAL CLINICAL SAFETY RULES (APPLY TO ALL DIAGNOSES):

1. Antibiotics must only be valid for BACTERIAL conditions.
   - Never valid for viral infections (e.g., acute bronchitis, flu, COVID, RSV).
   - If the diagnosis is viral or non-bacterial → ALL antibiotics are invalid.

2. Steroids (e.g., prednisone) require:
   - strong guideline evidence, OR
   - severe inflammatory conditions (e.g., asthma exacerbation),
   - NEVER for routine sinusitis, bronchitis, pharyngitis, viral illness.

3. Controlled substances (opioids, benzos) are ALWAYS INVALID unless explicitly
   supported by high-level guidelines. Default = "invalid_drug".

4. Herbal, alternative, or non-FDA-regulated compounds are ALWAYS INVALID.

5. Supportive care (rest, fluids, OTC meds) is NEVER a "valid_drug". 
   These are automatically "invalid_drug" because this system only evaluates medications.

6. ANY drug classification must be backed by at least ONE verifiable URL 
   (DOI, Cochrane, CDC, NICE, IDSA). If no verifiable URL → “invalid_drug”.

7. ANY drug contradicted by guidelines → ALWAYS invalid. 
   (e.g., macrolides for sinusitis, fluoroquinolones for uncomplicated UTIs.)

8. If guidelines conflict:
   hierarchy = CDC → IDSA → NICE → WHO → Cochrane → AAFP → AAP → meta-analyses.

9. If the LLM is uncertain or evidence is mixed → classify as "invalid_drug".
   Ambiguity defaults to safety.

   ABSOLUTE MEDICATION CLASSIFICATION RULES (CANNOT BE OVERRIDDEN):

1. Acute Bacterial Sinusitis (IDSA 2022 consensus):
   - First-line valid: amoxicillin, amoxicillin-clavulanate.
   - Alternative valid: doxycycline, cefdinir, cefuroxime.
   - ALWAYS invalid: macrolides (azithromycin, clarithromycin, erythromycin)
     due to >40% pneumococcal resistance.

2. NO supportive care may be labeled valid (e.g., rest, hydration, OTC remedies).

3. Steroids (e.g., prednisone) are ALWAYS invalid for sinusitis unless explicitly
   indicated by guideline-level evidence. They must be marked "invalid_drug".

4. ANY medication without clear guideline or systematic review evidence must be
   classified "invalid_drug".

5. If guideline consensus is conflicting:
   - follow the highest-level source in this order: IDSA > NICE > CDC > Cochrane.

6. If a URL is missing for a citation, the drug is invalid.

ABSOLUTE RULES FOR DIAGNOSIS-SPECIFIC DRUG ACCURACY:

1. Acute bacterial sinusitis:
   - First-line: amoxicillin or amoxicillin–clavulanate ONLY.
   - Valid alternatives: doxycycline, cefdinir, cefuroxime.
   - STRICTLY classify macrolides (azithromycin, clarithromycin) as "invalid"
     due to high pneumococcal resistance and guideline discouragement.

2. If a medication appears commonly in supportive-care contexts 
   (e.g., rest, hydration, OTC cough remedies), classify as “invalid drug”
   since this task evaluates medications ONLY.

3. When guideline consensus disfavors a drug due to resistance patterns,
   black box warnings, or lack of effectiveness:
   classify as "invalid_drug" even if occasionally used clinically.

4. NEVER infer validity from anecdotal or occasional use. 
   Base all classifications on guideline consensus ONLY.

5. If conflicting evidence is possible, default to the most recent and referenced high-level guideline 
   (IDSA → NICE → CDC → Cochrane).

   ---------------------------------------------------------
ADDITIONAL UNIVERSAL SAFETY INTENSIFIERS (APPLY TO ALL CASES)
---------------------------------------------------------

A. A drug must be considered INVALID if:

1. The mechanism of action is not clinically relevant to the diagnosis.
   Example: antivirals for bacterial infections, antibiotics for viral illnesses.

2. The drug is not mentioned in ANY reputable guideline for the diagnosis.

3. Evidence is out-of-date or based solely on:
   - case reports
   - small n<50 studies
   - non-peer-reviewed sources
   - outdated pre-2015 studies unless validated by newer guidelines

4. The model cannot confidently map the drug to:
   - a standard therapeutic class, OR
   - a mechanism compatible with the diagnosis.

5. A drug has major resistance concerns in the last 5 years 
   unless a guideline explicitly permits it.

6. The drug is only mentioned for *complicated* or *severe* versions
   of the disease, but the diagnosis is *uncomplicated*.

7. The guideline recommends the drug ONLY when:
   - cultures fail
   - first-line treatments are contraindicated
   - the setting is inpatient rather than outpatient

   → These should default to INVALID unless the specific scenario is described.

B. Diagnosis-Level Link Rules (Strengthened):

1. Only include URLs that:
   - match the exact diagnosis
   - exist as stable, public-facing guideline pages
   - are not root directories
   - do not redirect to general pages

2. If the correct diagnosis-specific URL cannot be determined:
   - output NO links rather than hallucinating one.

3. Cochrane DOI links must point to reviews DIRECTLY relevant to the diagnosis.

4. NICE links must match the correct code (e.g., CG69, NG84).



For the "links" section (diagnosis-level guideline links):

- Use only the following known VALID and stable URL patterns:
  - IDSA: https://www.idsociety.org/practice-guidelines/<slug>/
  - CDC: https://www.cdc.gov/<topic>/<page>.html
  - NICE: https://www.nice.org.uk/guidance/<code>
  - Cochrane: https://doi.org/<DOI>
  - WHO: https://www.who.int/publications/<id>/<slug>
  - AAFP: https://www.aafp.org/pubs/afp/issues/<year>/<month><day>/<slug>.html

STRICT RULES:
- You MUST NOT output directory pages (e.g., /practice-guidelines/, /guidance/, /publications/).
- Every link MUST point to the specific guideline or review document.
- If you are unsure about the EXACT valid URL for the diagnosis, do not output that link.


Output STRICT JSON ONLY:

{{
  "valid_drugs": [],
  "invalid_drugs": [],
  "Links": {{
      "<title>": "<URL>"
  }}
}}
"""

    # First attempt
    raw = call_llm(prompt)

    # Try JSON
    try:
        return json.loads(raw)
    except:
        pass

    # Repair prompt — SHORT, TOKEN-EFFICIENT
    repair_prompt = f"""
Fix this into VALID JSON ONLY using the schema provided earlier. 
No explanation. No extra text. Only JSON.




Broken:
{raw}
    """

    raw2 = call_llm(repair_prompt)

    try:
        return json.loads(raw2)
    except:
        return {
            "valid_drugs": [],
            "invalid_drugs": [],
            "links": {}
        }


# ---------------------------------------
# Main Agent 2 Logic
# ---------------------------------------

def agent2(payload: dict):
    """
    Expected payload:
    {
        "diagnosis": "...",
        "candidate_treatments": ["drug1", "drug2", ...]
    }
    """

    diagnosis = payload["diagnosis"].lower().strip()
    candidates = [c.lower().strip() for c in payload["candidate_treatments"]]

    # FILTER OUT NON-DRUGS
    candidates = [
        c for c in candidates
        if c.isalpha() or any(char.isdigit() for char in c)  # crude drug check
    ]

    # Outdated static rules
    outdated = load_outdated().get(diagnosis, [])

    # Query Research LLM
    llm_data = llm_research_query(diagnosis, candidates)

    # Apply outdated override
    for med in candidates:
        if med in outdated and med not in llm_data["invalid_drugs"]:
            llm_data["invalid_drugs"].append(med)

    return {
        "diagnosis": diagnosis,
        "valid_drugs": llm_data["valid_drugs"],
        "invalid_drugs": llm_data["invalid_drugs"],
        "links": llm_data.get("Links", {})
    }
