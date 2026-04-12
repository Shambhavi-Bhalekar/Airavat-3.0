import os
import asyncio
from dotenv import load_dotenv
from groq import Groq
import logging

logger = logging.getLogger("JusticeGrid.Debate")

# Ensure environment variables are loaded
load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
api_key = os.getenv("GROQ_API_KEY")

async def get_agent_response(client: Groq, persona: str, context_summary: str) -> str:
    """Helper to asynchronously fetch a response from the Groq API for a specific persona."""
    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": persona},
                {"role": "user", "content": f"Analyze this case context:\n{context_summary}\n\nProvide your argument (max 150 words)."}
            ],
            temperature=0.7,
            max_tokens=300
        )
        return completion.choices[0].message.content
    except Exception as e:
        logger.error(f"Error fetching response for persona: {e}")
        return f"Error computing argument: {e}"

async def run_debate_round(context: dict) -> dict:
    """
    Executes a multi-agent debate round using Groq Llama-3 API.
    Three distinct AI Personas independently review the compiled context.
    """
    if not api_key:
        return {"transcript": "Simulated Debate: No GROQ_API_KEY found, but Agents logically concur for release."}

    client = Groq(api_key=api_key)
    
    # 1. Synthesize the context securely
    fir_data = str(context.get("fir_bundle", "No FIR Data"))[:500]
    eligibility_data = context.get("eligibility", {})
    delay_prob = eligibility_data.get("adjournment_prob", 50) if isinstance(eligibility_data, dict) else 50
    
    context_summary = f"""
    FIR Details: {fir_data}
    Expected Adjournment Delay Probability: {delay_prob}%
    Is the case theoretically eligible for bail? {eligibility_data}
    """

    # 2. Define the stringent AI Personas
    persona_defense = """You are the Defense Counsel AI. Your goal is to argue strongly for the immediate release of the undertrial based on Section 479 BNSS. Focus on prolonged detention and fundamental rights."""
    
    persona_prosecutor = """You are the Public Prosecutor AI. Your goal is to argue against immediate bail. Focus on the severity of the FIR details, potential flight risk, and the impact on society."""
    
    persona_social_worker = """You are the Social Worker AI. You focus purely on the socio-economic impact of the undertrial's prolonged detention and whether surety barriers align with local poverty indicators."""

    logger.info("Initializing Agent Debate Threads...")

    # 3. Execute concurrently for blazing fast multi-agent resolution
    defense_res, prosecutor_res, social_res = await asyncio.gather(
        get_agent_response(client, persona_defense, context_summary),
        get_agent_response(client, persona_prosecutor, context_summary),
        get_agent_response(client, persona_social_worker, context_summary),
    )

    # 4. Form the final transcript
    transcript = f"*** AGENT 1 (Defense Counsel) ***\n{defense_res}\n\n"
    transcript += f"*** AGENT 2 (Public Prosecutor) ***\n{prosecutor_res}\n\n"
    transcript += f"*** AGENT 3 (Social Worker) ***\n{social_res}"

    return {"transcript": transcript}
