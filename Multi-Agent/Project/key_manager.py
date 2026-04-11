import os
import itertools
import google.generativeai as genai
import logging
from dotenv import load_dotenv

load_dotenv()

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(levelname)s — %(message)s")
logger = logging.getLogger("JusticeGrid.KeyManager")

class GeminiKeyManager:
    """
    Manages a pool of Gemini API keys and assigns them in a round-robin fashion.
    Keys should be named GEMINI_API_KEY_1, GEMINI_API_KEY_2, ... up to 10 in the environment.
    """
    def __init__(self):
        self.keys = []
        for i in range(1, 11):
            key = os.environ.get(f"GEMINI_API_KEY_{i}")
            if key and key.strip():
                self.keys.append(key.strip())
        
        # Fallback to single standard key if numbered format is not found
        if not self.keys:
            key = os.environ.get("GEMINI_API_KEY")
            if key and key.strip():
                self.keys.append(key.strip())
                
        if not self.keys:
            logger.warning("No Gemini API keys found in environment. Ensure GEMINI_API_KEY_1...10 are set.")
            self.key_cycle = itertools.cycle(["dummy_key_if_none_found"])
        else:
            logger.info(f"Initialized KeyManager with {len(self.keys)} API key(s).")
            self.key_cycle = itertools.cycle(self.keys)
            
    def configure_next_key(self):
        """
        Retrieves the next API key in the cycle and configures the global genai module.
        Must be called before any model generates content in the agents.
        """
        next_key = next(self.key_cycle)
        genai.configure(api_key=next_key)
        logger.info(f"Rotated to next API key: {next_key[:8]}...{next_key[-4:] if len(next_key) > 5 else ''}")
        return next_key

# Global singleton
key_manager = GeminiKeyManager()
