import os
import sys
import pickle
import asyncio
import logging
from datetime import datetime

# Setup paths
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
if SCRIPT_DIR not in sys.path:
    sys.path.append(SCRIPT_DIR)

from key_manager import key_manager

logging.basicConfig(level=logging.INFO, format="[%(asctime)s] %(name)s %(levelname)s — %(message)s")
logger = logging.getLogger("JusticeGrid.Orchestrator")

DATA_DIR = os.path.join(SCRIPT_DIR, "data", "cases")
os.makedirs(DATA_DIR, exist_ok=True)

def get_cache_path(case_id: str, agent_name: str) -> str:
    case_dir = os.path.join(DATA_DIR, case_id.replace("/", "_").replace("\\", "_"))
    os.makedirs(case_dir, exist_ok=True)
    return os.path.join(case_dir, f"{agent_name}.pkl")

def load_cached_data(case_id: str, agent_name: str):
    path = get_cache_path(case_id, agent_name)
    if os.path.exists(path):
        try:
            with open(path, "rb") as f:
                data = pickle.load(f)
            logger.info(f"Loaded cached state for {agent_name} from {path}")
            return data
        except Exception as e:
            logger.warning(f"Failed to load cache for {agent_name}: {e}")
    return None

def save_cache_data(case_id: str, agent_name: str, data):
    path = get_cache_path(case_id, agent_name)
    try:
        with open(path, "wb") as f:
            pickle.dump(data, f)
        logger.info(f"Saved state for {agent_name} to {path}")
    except Exception as e:
        logger.warning(f"Failed to save cache for {agent_name}: {e}")

async def run_pipeline(case_id: str):
    logger.info("=" * 60)
    logger.info(f"🚀 Starting Multi-Agent Pipeline for Case: {case_id}")
    logger.info("=" * 60)
    
    context = {}

    # ---------------------------------------------------------
    # AGENT 1: FIR Extractor
    # ---------------------------------------------------------
    agent1_data = load_cached_data(case_id, "agent1_fir")
    if agent1_data is None:
        try:
            key_manager.configure_next_key()
            from fir_extracter import run_agent1
            logger.info("[Execute] Running Agent 1 (FIR Extractor)...")
            agent1_data = await run_agent1(case_id)
            save_cache_data(case_id, "agent1_fir", agent1_data)
        except Exception as e:
            logger.error(f"Agent 1 skipped/failed: {e}")
            agent1_data = getattr(e, "mock_bundle", None)
            if not agent1_data:
                logger.error("Cannot proceed without FIR Data.")
                # We will mock it gracefully for demonstration if failed due to zero bytes.
                import types
                agent1_data = types.SimpleNamespace(case_id=case_id, firs=[])
    context["fir_bundle"] = agent1_data
    
    # ---------------------------------------------------------
    # AGENT 2: Case Scraper
    # ---------------------------------------------------------
    agent2_data = load_cached_data(case_id, "agent2_scraper")
    if agent2_data is None:
        try:
            key_manager.configure_next_key()
            from case_scraper import run_agent2
            logger.info("[Execute] Running Agent 2 (Case Scraper)...")
            agent2_data = await run_agent2(agent1_data)
            save_cache_data(case_id, "agent2_scraper", agent2_data)
        except Exception as e:
            logger.error(f"Agent 2 skipped/failed: {e}")
            agent2_data = {"related_cases": []}
    context["case_corpus"] = agent2_data

    # ---------------------------------------------------------
    # AGENT 3: Eligibility Engine
    # ---------------------------------------------------------
    agent3_data = load_cached_data(case_id, "agent3_eligibility")
    if agent3_data is None:
        try:
            key_manager.configure_next_key()
            from eligibility_engine import run_agent3
            logger.info("[Execute] Running Agent 3 (Eligibility Engine)...")
            agent3_data = await run_agent3(case_id)
            save_cache_data(case_id, "agent3_eligibility", agent3_data)
        except Exception as e:
            logger.warning(f"Agent 3 skipped/failed: {e}")
            agent3_data = {"eligible": True, "reason": "Mocked fallback"}
    context["eligibility"] = agent3_data

    # ---------------------------------------------------------
    # AGENT 4: Pattern Detector
    # ---------------------------------------------------------
    agent4_data = load_cached_data(case_id, "agent4_patterns")
    if agent4_data is None:
        try:
            key_manager.configure_next_key()
            from pattern_detector import run_agent4
            logger.info("[Execute] Running Agent 4 (Pattern Detector)...")
            agent4_data = await run_agent4(case_id)
            save_cache_data(case_id, "agent4_patterns", agent4_data)
        except Exception as e:
            logger.warning(f"Agent 4 skipped/failed: {e}")
            agent4_data = {"detected_patterns": []}
    context["patterns"] = agent4_data

    # ---------------------------------------------------------
    # AGENT 5: Graph Engine
    # ---------------------------------------------------------
    agent5_data = load_cached_data(case_id, "agent5_graph")
    if agent5_data is None:
        try:
            key_manager.configure_next_key()
            from graph_engine import run_agent5
            # Or graph-engine based on filename pattern
            import importlib
            graph_module = importlib.import_module("graph-engine")
            logger.info("[Execute] Running Agent 5 (Knowledge Graph)...")
            agent5_data = await graph_module.run_agent5(case_id)
            save_cache_data(case_id, "agent5_graph", agent5_data)
        except Exception as e:
            logger.warning(f"Agent 5 skipped/failed: {e}")
            agent5_data = {"nodes": [], "edges": []}
    context["graph"] = agent5_data

    # ---------------------------------------------------------
    # AGENTS 6-12: Debate Panel
    # ---------------------------------------------------------
    debate_data = load_cached_data(case_id, "agents_6_12_debate")
    if debate_data is None:
        try:
            key_manager.configure_next_key()
            from debate import run_debate_round
            logger.info("[Execute] Running Agents 6-12 (Concurrent Debate Panel)...")
            debate_data = await run_debate_round(context) # Assuming it takes context
            save_cache_data(case_id, "agents_6_12_debate", debate_data)
        except Exception as e:
            logger.warning(f"Debate Panel skipped/failed: {e}")
            debate_data = {"transcript": "Debate failed constraints."}
    context["debate_transcript"] = debate_data

    # ---------------------------------------------------------
    # AGENT 13: Moderator
    # ---------------------------------------------------------
    agent13_data = load_cached_data(case_id, "agent13_moderator")
    if agent13_data is None:
        try:
            key_manager.configure_next_key()
            from moderate import run_agent13
            logger.info("[Execute] Running Agent 13 (Debate Moderator)...")
            agent13_data = await run_agent13(context)
            save_cache_data(case_id, "agent13_moderator", agent13_data)
        except Exception as e:
            logger.warning(f"Agent 13 skipped/failed: {e}")
            agent13_data = {"consensus": "Pending"}
    context["moderation"] = agent13_data

    # ---------------------------------------------------------
    # AGENT 14: Sentiment / Veracity
    # ---------------------------------------------------------
    agent14_data = load_cached_data(case_id, "agent14_sentiment")
    if agent14_data is None:
        try:
            key_manager.configure_next_key()
            from sentiment import run_agent14
            logger.info("[Execute] Running Agent 14 (Sentiment & Veracity)...")
            agent14_data = await run_agent14(context)
            save_cache_data(case_id, "agent14_sentiment", agent14_data)
        except Exception as e:
            logger.warning(f"Agent 14 skipped/failed: {e}")
            agent14_data = {"score": 0.5}
    context["sentiment"] = agent14_data

    logger.info("=" * 60)
    logger.info(f"✅ Pipeline Completed for {case_id}")
    logger.info("=" * 60)
    
    print("\n\n" + "="*80)
    print("                *** TERMINAL DEBATE AND INSIGHT OUTPUT ***")
    print("="*80)
    print(f"CASE ID: {case_id}")
    print(f"FIR EXTRACTED: {bool(context.get('fir_bundle'))}")
    print(f"MODERATOR CONSENSUS: {agent13_data.get('consensus', 'N/A') if isinstance(agent13_data, dict) else str(agent13_data)[:200]}")
    print("="*80)

def main():
    if len(sys.argv) > 1:
        case_id = sys.argv[1]
    else:
        case_id = "MH/CR/2024/00847"
    
    asyncio.run(run_pipeline(case_id))

if __name__ == "__main__":
    main()
