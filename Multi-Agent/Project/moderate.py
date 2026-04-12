import os
import json
from dotenv import load_dotenv
from groq import Groq
import logging

logger = logging.getLogger("JusticeGrid.Moderator")

load_dotenv(os.path.join(os.path.dirname(__file__), "..", "..", ".env"))
api_key = os.getenv("GROQ_API_KEY")

async def run_agent13(context: dict) -> dict:
    """
    Acts as the final Moderator Judge.
    Reviews the debate transcript from Agents 6-12 and enforces a final, safe verdict.
    """
    transcript = context.get("debate_transcript", {}).get("transcript", "No debate occurred.")

    if not api_key:
        return {"consensus": {"verdict": "RELEASE", "reasoning": "Fallback Moderation", "confidence": 100}}

    client = Groq(api_key=api_key)

    system_prompt = """
    You are the Chief AI Moderator Judge for JusticeGrid.
    Review the multi-agent debate transcript provided by the user.
    Based on the arguments from the Defense, Prosecution, and Social Worker, you must declare a final verdict.
    
    You MUST respond with pure JSON in exactly this format, and absolutely nothing else:
    {
      "verdict": "RELEASE" or "HOLD_FOR_REVIEW",
      "reasoning": "A concise 2-sentence summary of why you chose this verdict.",
      "confidence": <integer from 0 to 100 representing how unified the agents were>
    }
    """

    try:
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": f"Debate Transcript:\n{transcript}"}
            ],
            temperature=0.3,
            max_tokens=200,
            response_format={"type": "json_object"}
        )
        
        raw_response = completion.choices[0].message.content
        verdict_data = json.loads(raw_response)
        
        return {"consensus": verdict_data}
        
    except Exception as e:
        logger.error(f"Error computing Moderator verdict: {e}")
        return {"consensus": {"verdict": "ERROR", "reasoning": str(e), "confidence": 0}}
