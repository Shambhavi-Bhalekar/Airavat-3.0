# ⚖️ JusticeGrid — AI-Powered Undertrial Case Management System

> **Airavat 3.0 Hackathon Project** — Empowering paralegals and legal aid systems to identify, prioritize, and act on undertrial bail eligibility using local AI, immutable ledgers, and multi-agent intelligence.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Tech Stack](#tech-stack)
4. [Project Structure](#project-structure)
5. [Pillar Progress](#pillar-progress)
6. [Getting Started](#getting-started)
7. [Running the Full System](#running-the-full-system)
8. [API Reference](#api-reference)
9. [Database Schema](#database-schema)
10. [Multi-Agent Verdict Engine](#multi-agent-verdict-engine)
11. [Blockchain Accountability Ledger](#blockchain-accountability-ledger)
12. [Frontend Pages & Routes](#frontend-pages--routes)
13. [Environment Variables](#environment-variables)
14. [Troubleshooting](#troubleshooting)
15. [Dependencies](#dependencies)

---

## Overview

**JusticeGrid** is a full-stack legal intelligence platform addressing the undertrial detention crisis in India. It identifies prisoners eligible for bail under **Section 479 BNSS**, prioritizes cases using a local **Gemma-4 LLM**, conducts multi-agent AI debates for verdict generation, logs paralegal decisions immutably on a **Ganache blockchain**, and notifies families in their native language via **WhatsApp/SMS**.

### Core Capabilities

| Capability | Technology |
|---|---|
| Local AI Scoring & Reasoning | Google Gemma-4-E4B (via `llama.cpp`) |
| Multi-Agent Case Debate | Groq Llama-3.1 (3 personas + Judge Moderator) |
| Immutable Audit Logging | Solidity Smart Contract on Ganache |
| Multi-Language Notifications | Groq + Twilio WhatsApp/SMS |
| Systemic Pattern Intelligence | FastAPI analytics over Supabase |
| Financial Bail Analysis | `financial_intelligence.py` (city-level poverty mapping) |

---

## Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                   Next.js 16 Frontend (Port 3000)                │
│  ┌──────────────┐  ┌──────────────────┐  ┌────────────────────┐  │
│  │  Paralegal   │  │  Case Detail     │  │  Coordinator       │  │
│  │  Dashboard   │  │  + AI Verdicts   │  │  Dashboard         │  │
│  └──────┬───────┘  └────────┬─────────┘  └──────────┬─────────┘  │
│         └───────────────────┴────────────────────────┘           │
│                          lib/api.ts                              │
└───────────────────────────────┬──────────────────────────────────┘
                                │ HTTP (CORS)
                                ▼
┌──────────────────────────────────────────────────────────────────┐
│                  FastAPI Backend (Port 8000)                     │
│       main.py · ml_models.py · financial_intelligence.py         │
│       systemic_insights.py · debate.py · moderate.py             │
└──────┬────────────────────────────────────────────┬─────────────┘
       │                                            │
       ▼                                            ▼
Supabase PostgreSQL                     Gemma-4 llama.cpp Server (Port 8001)
       │
       ▼
Supabase Webhook
       ├──► Groq LLM  (Translate to native language)
       └──► Twilio    (WhatsApp / SMS to family)

Blockchain Layer (Ganache Port 7545)
       └──► MetaMask → EligibilityLogger.sol (Immutable audit records)
```

---

## Tech Stack

### Backend
- **FastAPI** — REST API framework with Pydantic validation
- **Supabase** — Cloud PostgreSQL with webhook triggers
- **Google Gemma-4-E4B** — Local LLM via `llama.cpp` (privacy-preserving, zero inference cost)
- **Groq Llama-3.1** — Fast cloud LLM for multi-agent debates & translation
- **Twilio** — WhatsApp / SMS outbound notifications
- **joblib** — ML model for adjournment probability prediction

### Frontend
- **Next.js 16** (App Router) + **TypeScript**
- **TailwindCSS** + **shadcn/ui** — Component system
- **ethers.js** — MetaMask / Ganache Web3 integration
- **react-chartjs-2** — Coordinator dashboard analytics charts

### Blockchain
- **Solidity** — Smart contract (`EligibilityLogger.sol`)
- **Ganache** — Local Ethereum testnet
- **MetaMask** — In-browser cryptographic signing

---

## Project Structure

```
/
├── backend/
│   ├── main.py                    # FastAPI routes & orchestration
│   ├── db.py                      # Supabase client initialization
│   ├── ml_models.py               # Gemma-4 integration (OpenAI SDK wrapper)
│   ├── ml_delay.py                # Adjournment probability ML model
│   ├── financial_intelligence.py  # Poverty-threshold surety analysis
│   ├── systemic_insights.py       # Pillar 04/08: Pattern analytics & UTRC alerts
│   ├── models.py                  # Pydantic schemas (ClientCreate, CaseCreate)
│   ├── utils.py                   # Detention calc, prompt formatter, translator, notifier
│   └── datasets/
│       ├── CLEANED_BNS_DATASET.csv
│       └── FIR_DATASET.csv
│
├── frontend_final/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (viewport, fonts, metadata)
│   │   ├── page.tsx               # Landing page / role selector
│   │   ├── login/                 # Login page
│   │   ├── paralegal/
│   │   │   ├── page.tsx           # Paralegal dashboard (live stats + case grid)
│   │   │   ├── case-queue/        # Full case queue (search, filter, sort)
│   │   │   ├── case-entry/        # Multi-step new case registration form
│   │   │   └── alerts/            # System alerts view
│   │   ├── case/[id]/             # Case detail (eligibility, AI verdicts, blockchain)
│   │   └── coordinator/           # UTRC coordinator dashboard
│   ├── components/
│   │   ├── agentic-verdict-card.tsx   # ⭐ Multi-Agent AI Debate Panel
│   │   ├── blockchain-log-card.tsx    # ⭐ Immutable Blockchain Audit Trail
│   │   ├── systemic-insights-card.tsx # Pillar 04 pattern analytics display
│   │   ├── pattern-alert-card.tsx     # Pillar 08 UTRC adjournment alerts
│   │   ├── uncertainty-display.tsx    # Confidence % with disclaimer UI
│   │   ├── eligibility-card.tsx
│   │   ├── reasoning-chain.tsx
│   │   ├── hearing-card.tsx
│   │   └── surety-card.tsx
│   └── lib/
│       ├── api.ts                 # ⭐ API client + backend adapter
│       ├── blockchain.ts          # ⭐ ethers.js blockchain integration
│       ├── types.ts               # TypeScript types (Case, EligibilityAssessment, etc.)
│       └── utils.ts               # cn() and helpers
│
├── Multi-Agent/
│   └── Project/
│       ├── orchestrator.py        # Agent pipeline coordinator
│       ├── debate.py              # ⭐ 3-Persona debate agents (Groq Llama-3.1)
│       ├── moderate.py            # ⭐ Judge Moderator agent (consensus verdict)
│       ├── fir_extracter.py       # FIR extraction & normalization
│       ├── eligibility_engine.py  # Eligibility reasoning agent
│       └── pattern_detector.py   # Systemic pattern detection agent
│
├── blockchain/
│   ├── EligibilityLogger.sol      # ⭐ Solidity smart contract
│   ├── deploy.js                  # Contract deployment to Ganache
│   ├── logger.js                  # Node.js test logger
│   └── .gitignore                 # Excludes .env and node_modules
│
├── llama.cpp/                     # Compiled local inference engine
├── unsloth/                       # Gemma-4-E4B model weights (GGUF quantized)
├── setup_gemma.sh                 # Automation script (Mac/Linux)
├── requirements.txt               # Python dependencies
├── .env                           # Environment variables (NOT in repo)
├── PILLARS_PROGRESS.md            # Detailed Airavat 3.0 pillar status
└── README.md
```

---

## Pillar Progress

| # | Pillar | Status |
|---|--------|--------|
| 01 | Multi-Source Legal Data Fusion & Eligibility Intelligence | 🟡 Mostly Complete |
| 02 | Case Complexity Classification & Legal Aid Prioritisation | 🟢 Complete |
| 03 | Paralegal & Family-Facing Interface Under Real Conditions | 🟡 Mostly Complete |
| 04 | Systemic Pattern Intelligence Across the Case Corpus | 🟢 Complete |
| 05 | Ethical Architecture, Failure Modes & Accountability Design | 🟢 Complete |
| 06 | Multilingual NLP & Language Justice Engine | 🟡 Partially Complete |
| 07 | Bail Surety & Financial Access Intelligence | 🟢 Complete |
| 08 | UTRC Pattern Alerts & Uncertainty Display | 🟢 Complete |
| 09 | Federated Intelligence Across DLSAs | 🔴 Not Started |
| 10 | Voice-First Access for Zero-Literacy Users | 🟡 Mostly Complete |

> See [PILLARS_PROGRESS.md](./PILLARS_PROGRESS.md) for a full breakdown of every pillar.

---

## Getting Started

### Prerequisites

- **Python** 3.10+
- **Node.js** 18+ and **npm**
- **Git**
- **Ganache** (for blockchain demo) — [download here](https://trufflesuite.com/ganache/)
- **MetaMask** browser extension
- macOS / Linux recommended (Windows via WSL2)

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-repo/JusticeGrid.git
cd JusticeGrid
```

### Step 2 — Setup Backend

```bash
# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate       # Windows: .\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# Build llama.cpp and download the Gemma-4 model (~6 GB)
sh setup_gemma.sh
```

### Step 3 — Setup Frontend

```bash
cd frontend_final
npm install
```

### Step 4 — Setup Blockchain (Optional Demo)

```bash
cd blockchain
npm install

# Start Ganache on port 7545, then deploy the smart contract
node deploy.js
```

> Import a Ganache private key into MetaMask and switch to the Localhost 7545 network.

### Step 5 — Configure Environment Variables

Create a `.env` file in the **project root**:

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-api-key

# Groq (Multi-Agent Debates + Translation)
GROQ_API_KEY=your-groq-api-key

# Twilio (WhatsApp / SMS)
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155552671
TWILIO_SMS_FROM=+1234567890
```

Optionally create `frontend_final/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## Running the Full System

The system requires **three terminal sessions** running simultaneously.

### Terminal 1 — Local AI Reasoning Server (Gemma-4)

```bash
./llama.cpp/llama-server \
    --model unsloth/gemma-4-E4B-it-GGUF/gemma-4-E4B-it-Q8_0.gguf \
    --port 8001 \
    --reasoning on \
    -n 2048
```

✅ Runs at `http://localhost:8001`

---

### Terminal 2 — FastAPI Backend

```bash
cd backend
source ../venv/bin/activate
uvicorn main:app --reload --port 8000
```

✅ Runs at `http://localhost:8000`  
📖 Swagger UI: `http://localhost:8000/docs`

---

### Terminal 3 — Next.js Frontend

```bash
cd frontend_final
npm run dev
```

✅ Runs at `http://localhost:3000`

---

## API Reference

### Clients

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/client` | Register a new client (prisoner/family) |
| `GET` | `/client/{client_id}` | Fetch a specific client |

### Cases

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/case` | Create a case & trigger Gemma-4 AI scoring |
| `GET` | `/cases` | Fetch all cases sorted by priority |
| `PUT` | `/case/{id}` | Update case fields |
| `DELETE` | `/case/{id}` | Delete a case |
| `POST` | `/case/{id}/orchestrate` | ⭐ Run multi-agent AI debate & write verdict to DB |

### Admin / Batch

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/predict-all` | Re-score all cases with Gemma-4 |

### Systemic Pattern Intelligence (Pillar 04)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/systemic-insights/charge-sections` | IPC sections driving the longest detention |
| `GET` | `/systemic-insights/courts` | Courts with the worst bail-decision intervals |
| `GET` | `/systemic-insights/prisons` | Prisons with highest eligible-but-detained density |
| `GET` | `/systemic-insights/surety-analysis` | Surety amounts blocking bail vs poverty threshold |

### UTRC Pattern Alerts (Pillar 08)

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/alerts/pattern-adjournments` | Courts with 20+ eligible cases adjourned in quarter |

### Webhooks

| Method | Endpoint | Triggered By |
|--------|----------|--------------|
| `POST` | `/supabase-webhook` | Supabase INSERT/UPDATE → translates & notifies family |

---

## Database Schema

JusticeGrid uses **Supabase PostgreSQL**. All systemic intelligence is derived from the `cases` table without additional tables.

### Tables

```
app_users    →  Authentication & role management (paralegal, coordinator, supervisor)
clients      →  Prisoner/family demographics & contact info
cases        →  All case records, AI scores, bail status, detention tracking
```

### `cases` Table — Key Columns

| Column | Type | Purpose |
|--------|------|---------|
| `id` | `uuid` | Primary key |
| `client_id` | `text` | FK to `clients` |
| `assigned_ipc` / `assigned_bns` | `text` | Legal charge sections |
| `detention_days` | `int4` | Days in custody (auto-calculated) |
| `eligible` | `bool` | Section 479 BNSS eligibility |
| `eligible_but_detained` | `bool` | Eligible but still detained (action needed) |
| `priority_score` | `int4` | Composite AI score (0–200) |
| `priority_level` | `text` | `HIGH` / `MEDIUM` / `LOW` |
| `adjournment_prob` | `int4` | Probability of adjournment (0–100%) |
| `confidence` | `float8` | LLM confidence (0.0–1.0) |
| `reason` | `text` | LLM reasoning / multi-agent verdict |
| `bail_status` | `text` | `PENDING` / `GRANTED` / `REJECTED` |
| `bail_delay_days` | `int4` | Days of unjustified bail delay |
| `surety_amount` | `int4` | Bail surety in INR |
| `surety_blocked` | `bool` | Surety exceeds 90-day poverty threshold |
| `court_name` | `text` | Court handling the case |
| `prison_name` | `text` | Current detention facility |

### Priority Score Thresholds

| Level | Score | Action |
|-------|-------|--------|
| 🔴 **HIGH** | > 180 | Immediate paralegal assignment |
| 🟡 **MEDIUM** | 121–180 | Standard legal processing |
| 🟢 **LOW** | ≤ 120 | Monitoring queue |

---

## Multi-Agent Verdict Engine

Located in `Multi-Agent/Project/`. When a paralegal clicks **"Launch AI Agents Verdict"** on a case detail page:

1. **Endpoint** `POST /case/{id}/orchestrate` reads the live case from Supabase.
2. **Debate Round** (`debate.py`) — Three Groq Llama-3.1 personas are summoned **concurrently**:
   - 🛡️ **Defense Counsel AI** — argues for immediate release (BNSS rights, detention length)
   - ⚖️ **Public Prosecutor AI** — argues against bail (flight risk, offense severity)
   - 🤝 **Social Worker AI** — focuses on socio-economic barriers and surety constraints
3. **Moderator Judge** (`moderate.py`) — Reads the 3-way transcript and outputs a final structured JSON verdict:
   ```json
   { "verdict": "RELEASE", "reasoning": "...", "confidence": 82 }
   ```
4. **Database Persistence** — The `reason` and `confidence` columns in Supabase are updated with the agentic verdict.
5. **UI Refresh** — The frontend re-fetches updated case data and the **Assessment Details → Reasoning Chain** card reflects the new AI verdict automatically.

The full debate transcript and the Moderator's verdict are both displayed directly in the **Multi-Agent AI Debate Panel** on the Case Detail page.

---

## Blockchain Accountability Ledger

Located in `blockchain/`. Provides Pillar 05 immutable accountability for every paralegal decision.

### How It Works

1. Paralegal reviews the AI assessment on the Case Detail page.
2. They click **Agree**, **Override AI**, or **Flag Case**.
3. MetaMask prompts a cryptographic signature (the paralegal's wallet address becomes irrevocably tied to their decision).
4. The signed payload is written to `EligibilityLogger.sol` on the local Ganache blockchain — **forever immutable**.
5. The **Immutable Audit Trail** section below the action buttons renders every historical block for that case, showing:
   - Paralegal decision string
   - Signing wallet address
   - Block timestamp
   - Data sources cryptographically hashed
   - AI reasoning anchored to the block

### Smart Contract Structure

```solidity
// EligibilityLogger.sol
function logAssessment(
    string _caseId,
    string _dataSources,
    string _reasoningChain,
    uint8  _confidenceLevel,
    string _paralegalResponse
) public

function getLogCount(string _caseId) view returns (uint256)
function getLog(string _caseId, uint256 index) view returns (...)
```

### Quick Deploy Steps

```bash
# 1. Start Ganache on port 7545
# 2. Deploy the contract
cd blockchain && node deploy.js

# 3. Test a manual log entry
node logger.js
```

> ⚠️ Use only Ganache test private keys. Never commit real keys to source control.

---

## Frontend Pages & Routes

| Route | Role | Description |
|-------|------|-------------|
| `/` | Both | Landing page — role selector |
| `/login` | Both | Login screen |
| `/paralegal` | Paralegal | Dashboard — live stats, top priority cases |
| `/paralegal/case-queue` | Paralegal | Full case list — search, filter, sort |
| `/paralegal/case-entry` | Paralegal | Multi-step new case registration form |
| `/paralegal/alerts` | Paralegal | System alerts & notifications |
| `/case/[id]` | Paralegal | Case detail — AI verdict, eligibility, blockchain audit |
| `/coordinator` | Coordinator | District stats, systemic insights, re-score all |

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `SUPABASE_URL` | ✅ | Supabase project URL |
| `SUPABASE_KEY` | ✅ | Supabase service role API key |
| `GROQ_API_KEY` | ✅ | Powers multi-agent debates & translations |
| `TWILIO_ACCOUNT_SID` | ⚡ Optional | Required for WhatsApp/SMS notifications |
| `TWILIO_AUTH_TOKEN` | ⚡ Optional | Required for WhatsApp/SMS notifications |
| `TWILIO_WHATSAPP_FROM` | ⚡ Optional | Twilio sandbox number |
| `TWILIO_SMS_FROM` | ⚡ Optional | Twilio phone number |
| `NEXT_PUBLIC_API_URL` | ⚡ Optional | Frontend API base URL (default: `http://localhost:8000`) |

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Connection refused on port 8001` | Start the Gemma-4 llama-server (Terminal 1) |
| `SUPABASE_URL is missing` | Check root `.env` file exists and has correct variables |
| `Groq API Error` | Check `GROQ_API_KEY` and account credits |
| `Twilio Auth Error` | Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` |
| `Port 8000 in use` | `lsof -i :8000` → `kill -9 <PID>` |
| `Port 3000 in use` | `lsof -i :3000` → `kill -9 <PID>` |
| Frontend shows "Backend unavailable" | Ensure backend runs on port 8000 with CORS allowed |
| MetaMask shows wrong network | Switch MetaMask to **Localhost 7545** (Chain ID: 1337) |
| Blockchain tx fails | Switch MetaMask to your Imported Ganache account (pre-funded with test ETH) |
| `model_decommissioned` error from Groq | Model `llama3-8b-8192` is retired — project already uses `llama-3.1-8b-instant` |
| AI reasoning shows "pending" after verdict | Verdict is being saved to DB — page auto-refreshes after 1.5 seconds |

---

## Dependencies

### Backend (`requirements.txt`)

```
fastapi          # Web framework
uvicorn          # ASGI server
pydantic         # Data validation
supabase         # Supabase PostgreSQL client
openai           # OpenAI-compatible SDK for llama.cpp
groq             # Groq API (multi-agent debates + translation)
twilio           # WhatsApp / SMS
python-dotenv    # .env loading
scikit-learn     # ML model for adjournment prediction
joblib           # ML model serialization
```

### Frontend (`package.json`)

```
next@16           # React framework (App Router)
react@19          # UI library
typescript        # Type safety
tailwindcss       # Utility-first CSS
shadcn/ui         # Component library
lucide-react      # Icon set
ethers            # Blockchain / MetaMask integration
react-chartjs-2   # Coordinator dashboard charts
chart.js          # Charting engine
```

### Blockchain (`blockchain/package.json`)

```
ethers            # Web3 provider & signer
solc              # Solidity compiler
```

---

## Team

- **Lead Developer & Architect:** Mayank Chauhan
- **Project:** JusticeGrid — Airavat 3.0 Hackathon

---

## License

MIT License
