from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from agents.agent0 import agent0
from agents.agent1 import agent1
from agents.agent2 import agent2
from agents.agent3 import agent3
from agents.aiResearcher import agent4


app = FastAPI()


# ---------------------
#   CORS
# ---------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # OK for demo / no auth
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------
#   REQUEST MODELS
# ---------------------
class AnalyzeRequest(BaseModel):
    text: str


class Agent4Request(BaseModel):
    diagnosis: str


# ---------------------
#   HEALTH CHECK
# ---------------------
@app.get("/health")
def health():
    return {"status": "ok"}


# ---------------------
#   MAIN PIPELINE
# ---------------------
@app.post("/analyze")
async def analyze_patient(payload: AnalyzeRequest):
    patient_text = payload.text

    # Agent pipeline
    agent0_output = dict(agent0(patient_text))
    agent1_output = dict(agent1(agent0_output))
    agent2_output = dict(agent2(agent1_output))

    agent3_input = {
        "allergies": agent0_output.get("allergies", []),
        "conditions": agent0_output.get("conditions", []),
        "pregnant": agent0_output.get("pregnant", False),
        "age": agent0_output.get("age", None),
        "suggested_meds": agent2_output.get("valid_drugs", []),
    }

    agent3_output = dict(agent3(agent3_input))

    diagnosis_for_agent4 = agent2_output.get("diagnosis", "")
    agent4_output = dict(agent4(diagnosis_for_agent4))

    return {
        "agent0_output": agent0_output,
        "agent1_output": agent1_output,
        "agent2_output": agent2_output,
        "agent3_output": agent3_output,
        "agent4_output": agent4_output,
    }


# ---------------------
#   ISOLATED AGENT 4
# ---------------------
@app.post("/agent4")
async def run_agent4(payload: Agent4Request):
    return dict(agent4(payload.diagnosis))
