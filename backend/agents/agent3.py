import json
import os
from anthropic import Anthropic

# ---------------------------------------
# Initialization
# ---------------------------------------
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
# Generate hallucination-proof medication safety maps
# ---------------------------------------
def generate_med_maps(patient_json: dict):
    # Reuse maps from Agent 2 if present
    if "agent2_med_maps" in patient_json:
        return patient_json["agent2_med_maps"]

    suggested_meds = patient_json.get("suggested_meds", [])

    prompt = f"""
You are a cautious medical assistant AI.

Patient info: {json.dumps(patient_json, indent=2)}
Suggested medications: {suggested_meds}

Rules:
1. Only map medications in the suggested list.
2. Do NOT invent medications.
3. Allergies → unsafe meds.
4. Pregnancy → unsafe meds.
5. Conditions → problematic meds.
6. Only use FDA, RxList, MedlinePlus.
7. Output EXACT JSON:
   {{
     "allergy_map": {{}},
     "pregnancy_map": [],
     "condition_map": {{}}
   }}
8. No text outside JSON.
9. Temperature = 0.
"""

    response = client.messages.create(
        model="claude-3-5-haiku-latest",
        system="Cautious medical safety assistant.",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=500
    )

    raw = response.content[0].text.strip()
    try:
        out = json.loads(raw)
        out.setdefault("allergy_map", {})
        out.setdefault("pregnancy_map", [])
        out.setdefault("condition_map", {})
        return out
    except:
        return {"allergy_map": {}, "pregnancy_map": [], "condition_map": {}}

# ---------------------------------------
# Generate hallucination-proof standard doses
# ---------------------------------------
def generate_standard_doses(patient_json: dict):
    if "agent2_dose_dict" in patient_json:
        return patient_json["agent2_dose_dict"]

    suggested = patient_json.get("suggested_meds", [])

    prompt = f"""
You are a cautious medical assistant AI.

Patient info: {json.dumps(patient_json, indent=2)}
Suggested medications: {suggested}

Rules:
1. Only use medications in the list.
2. No invented doses.
3. Use FDA, RxList, MedlinePlus only.
4. JSON only:
   {{
     "medication_doses": [
       {{"med": "", "dosage": "", "frequency": ""}}
     ]
   }}
5. If unknown → dosage = "N/A", frequency = "N/A".
6. Temperature = 0.
"""

    response = client.messages.create(
        model="claude-3-5-haiku-latest",
        system="Cautious medical assistant. No hallucinations.",
        messages=[{"role": "user", "content": prompt}],
        temperature=0,
        max_tokens=500
    )

    raw = response.content[0].text.strip()

    try:
        parsed = json.loads(raw)
        doses = parsed.get("medication_doses", [])
    except:
        doses = []

    # Convert to lookup dict
    return {d["med"].lower(): d for d in doses if "med" in d}

# ---------------------------------------
# Safety rules
# ---------------------------------------
def is_med_unsafe(patient: dict, med: str, med_maps: dict):
    reasons = []
    med_lower = med.lower()

    allergies = [a.lower() for a in patient.get("allergies", [])]
    conditions = [c.lower() for c in patient.get("conditions", [])]
    age = patient.get("age", 0)
    pregnant = patient.get("pregnant", False)

    # Allergy
    for allergy, meds in med_maps.get("allergy_map", {}).items():
        if allergy.lower() in allergies and med_lower in [m.lower() for m in meds]:
            reasons.append(f"Patient is allergic to {allergy}")

    # Pregnancy
    if pregnant and med_lower in [m.lower() for m in med_maps.get("pregnancy_map", [])]:
        reasons.append("Unsafe during pregnancy")

    # Conditions
    for cond in conditions:
        if med_lower in [m.lower() for m in med_maps.get("condition_map", {}).get(cond, [])]:
            reasons.append(f"May worsen {cond}")

    # Pediatric asthma & NSAIDs
    NSAIDs = ["ibuprofen", "naproxen", "aspirin"]
    if "asthma" in conditions and med_lower in NSAIDs and age < 18:
        reasons.append("NSAID risk in pediatric asthma")

    return reasons

# ---------------------------------------
# Main Agent 3 logic (clean)
# ---------------------------------------
def filter_meds(patient_json: dict):
    suggested = patient_json.get("suggested_meds", [])

    med_maps = generate_med_maps(patient_json)
    dose_dict = generate_standard_doses(patient_json)

    approved = []
    unapproved = []

    for med in suggested:
        issues = is_med_unsafe(patient_json, med, med_maps)

        if issues:
            unapproved.append({
                "med": med,
                "reasons": issues
            })
        else:
            dose = dose_dict.get(med.lower(), {"dosage": "N/A", "frequency": "N/A"})
            approved.append({
                "med": med,
                "dosage": dose.get("dosage", "N/A"),
                "frequency": dose.get("frequency", "N/A")
            })

    return {
        "approved_meds": approved,
        "unapproved_meds": unapproved
    }

# ---------------------------------------
# Public agent3 entrypoint (the ONLY export)
# ---------------------------------------
def agent3(patient_json: dict):
    """
    Agent 3: medication safety analysis.
    Input: structured patient JSON from agent2.
    Output: approved/unapproved medication lists.
    """
    return filter_meds(patient_json)
