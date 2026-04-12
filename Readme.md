# ⚖️ JusticeGrid - AI-Powered Undertrial Case Management System

## 🚀 Overview

**JusticeGrid** is an intelligent full-stack legal platform designed to empower paralegals and legal aid systems in managing undertrial cases efficiently. It integrates multi-source legal data, computes bail eligibility, prioritizes cases using a **local Gemma-4 LLM**, translates updates in native languages via **Groq**, and sends real-time notifications via **Twilio WhatsApp/SMS**.

The system combines:
- **Next.js 16 Frontend** — role-based paralegal & coordinator dashboards with live API data
- **Data fusion** from IPC/BNS datasets
- **Local-first AI** (privacy-preserving reasoning via Gemma-4)
- **Intelligent prioritization** with explainable scoring (0–200)
- **Multi-language support** for family notifications
- **Real-time WhatsApp/SMS notifications** via webhooks
- **Secure cloud database** (Supabase)

---

## 🧠 Architecture

```text
┌─────────────────────────────────────────────────────────┐
│            Next.js 16 Frontend (Port 3000)              │
│  ┌─────────────┐  ┌──────────────┐  ┌───────────────┐  │
│  │  Paralegal  │  │  Case Queue  │  │  Coordinator  │  │
│  │  Dashboard  │  │  & Detail    │  │  Dashboard    │  │
│  └──────┬──────┘  └──────┬───────┘  └───────┬───────┘  │
│         └────────────────┴──────────────────┘           │
│                     lib/api.ts                          │
└─────────────────────────┬───────────────────────────────┘
                          │ HTTP (CORS enabled)
                          ▼
┌─────────────────────────────────────────────────────────┐
│           FastAPI Backend (Port 8000)                   │
│         [Pydantic Validation + CORS Middleware]         │
└─────┬──────────────────────────────────────────┬────────┘
      │                                          │
      ▼                                          ▼
Supabase (Cloud DB)                  Local Gemma-4 (Port 8001)
      │                              [llama.cpp inference server]
      ▼
Supabase Webhook
      │
      ├──► Groq LLM (Translate → native language)
      └──► Twilio (WhatsApp / SMS Notifications)
```

---

## 📂 Project Structure

```text
/
├── backend/
│   ├── main.py              # FastAPI routes & CORS middleware
│   ├── db.py                # Supabase client initialization
│   ├── ml_models.py         # Local Gemma-4 integration (OpenAI SDK)
│   ├── models.py            # Pydantic schemas (ClientCreate, CaseCreate)
│   ├── utils.py             # Detention calculator, prompt formatter, translator, notifier
│   └── datasets/
│       ├── CLEANED_BNS_DATASET.csv
│       └── FIR_DATASET.csv
│
├── frontend_final/          # Next.js 16 frontend
│   ├── app/
│   │   ├── layout.tsx            # Root layout (fonts, metadata, hydration fix)
│   │   ├── page.tsx              # Landing page / role selector
│   │   ├── login/                # Login page
│   │   ├── paralegal/
│   │   │   ├── page.tsx          # Paralegal dashboard (live stats + case grid)
│   │   │   ├── case-queue/       # Full case queue (search, filter, sort, list/grid toggle)
│   │   │   ├── case-entry/       # Multi-step new case registration form
│   │   │   └── alerts/           # System alerts view
│   │   ├── case/[id]/            # Case detail page (eligibility, charges, notes)
│   │   └── coordinator/          # UTRC Coordinator dashboard
│   ├── components/               # Reusable UI components
│   │   ├── case-card.tsx
│   │   ├── eligibility-card.tsx
│   │   ├── stats-card.tsx
│   │   ├── status-badge.tsx
│   │   ├── confidence-badge.tsx
│   │   ├── reasoning-chain.tsx
│   │   ├── hearing-card.tsx
│   │   ├── surety-card.tsx
│   │   └── app-header.tsx / app-sidebar.tsx
│   ├── lib/
│   │   ├── api.ts           # ⭐ API client + backend↔frontend adapter
│   │   ├── types.ts         # TypeScript types (Case, EligibilityAssessment, etc.)
│   │   ├── mock-data.ts     # Offline fallback data
│   │   └── utils.ts         # cn() and helpers
│   └── public/              # Static assets & icons
│
├── llama.cpp/               # Compiled local inference engine
├── unsloth/                 # Gemma-4-E4B model weights (quantized)
├── setup_gemma.sh           # Automation script (Linux/Mac)
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables (NOT in repo)
└── Readme.md                # This file
```

---

## 🧩 Features

### Backend
* ✅ **Client & Case Management**: Robust CRUD APIs with Pydantic validation
* ✅ **Local AI Scoring**: Powered by **Google's Gemma-4-E4B** for privacy and zero inference cost
* ✅ **Bail Eligibility Detection**: Automatic classification based on `bailable` status
* ✅ **Intelligent Priority Scoring**: 0–200 ranking based on detention duration, offense severity, and LLM reasoning
* ✅ **Multi-Language Support**: Real-time translation to family's native tongue via **Groq LLM**
* ✅ **Real-Time Notifications**: WhatsApp + SMS via **Twilio**, triggered by Supabase webhooks
* ✅ **Explainable AI**: Every score includes LLM-generated reasoning and confidence metrics
* ✅ **Retroactive Re-scoring**: `/predict-all` endpoint re-scores all cases with updated LLM config
* ✅ **CORS Enabled**: Frontend on port 3000 can communicate freely with the backend on port 8000

### Frontend
* ✅ **Live Data Integration**: All pages fetch real data from the FastAPI backend via `lib/api.ts`
* ✅ **Graceful Offline Fallback**: Every page falls back to mock data if the backend is unreachable
* ✅ **Paralegal Dashboard**: Live stats (eligible cases, window closing, lawyer review count) derived from real data
* ✅ **Case Queue**: Full-featured list with search, multi-status filter tabs, sort-by (priority / detention / date / name), and grid/list view toggle
* ✅ **Case Detail Page**: Full eligibility assessment, charge breakdown, AI reasoning chain, and paralegal notes (saved to backend via `PUT /case/{id}`)
* ✅ **Multi-Step Case Entry Form**: Submits to `POST /client` + `POST /case`, maps form fields to backend schema, and shows the real Supabase case ID on success
* ✅ **Coordinator Dashboard**: Top-4 stat cards derived from live cases; **Re-score All Cases** button triggers `POST /predict-all` against Gemma-4
* ✅ **Quick Analytics & Visualizations**: Small dashboard visuals (bar, line, pie) added to the Coordinator dashboard to surface system-level trends and pattern alerts. Implemented with `react-chartjs-2` + `chart.js` (see `components/analytics`).
* ✅ **Loading States**: Spinner on every data-fetching page
* ✅ **Error Banners**: Offline warning banner shown when backend is unreachable

---

## 📊 Scoring Thresholds

Priority scores range from 0 to 200:

| Level | Score Range | Meaning | Action |
|-------|------------|---------|--------|
| 🔴 **HIGH** | > 180 | Urgent case requiring immediate paralegal attention | Paralegal assigned immediately |
| 🟡 **MEDIUM** | 121–180 | Moderate urgency with active legal review | Standard case processing |
| 🟢 **LOW** | ≤ 120 | Lower urgency cases in queue | Monitoring for developments |

---

## 🔐 Environment Variables

Create a `.env` file in the **project root** with:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-secret-key

# Twilio Configuration (for WhatsApp/SMS)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155552671  # Twilio Sandbox Number
TWILIO_SMS_FROM=+1234567890                 # Your Twilio Phone Number

# Groq Configuration (for Translations)
GROQ_API_KEY=your-groq-api-key
```

The frontend reads one optional variable (defaults to `http://localhost:8000` if not set):
```env
# In frontend_final/.env.local (optional)
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🛠️ Getting Started

### Prerequisites

* **Python** 3.10+
* **Node.js** 18+ and **npm**
* **Git**
* **macOS/Linux** (Windows via WSL2 recommended)
* GPU-accelerated inference recommended (CPU-only works too)

---

### Installation

#### Step 1: Clone the Repository

```bash
git clone https://github.com/your-repo/JusticeGrid.git
cd JusticeGrid
```

#### Step 2: Setup Backend

```bash
# Create & activate virtual environment
python3 -m venv venv
source venv/bin/activate   # Windows: .\venv\Scripts\Activate.ps1

# Install Python dependencies
pip install -r requirements.txt

# Build llama.cpp and download Gemma-4 model (~6 GB)
sh setup_gemma.sh
```

#### Step 3: Setup Frontend

```bash
cd frontend_final
npm install
# Install charting packages used by the Coordinator dashboard visuals
npm install react-chartjs-2 chart.js
```

#### Step 4: Configure Environment

Create `.env` in the **project root** (see variables above).

Optionally create `frontend_final/.env.local` if your backend runs on a different port:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

## 🚀 Running the Full System

The full system requires **three terminal sessions** running simultaneously:

### Terminal 1 — Local AI Reasoner (Gemma-4 LLM Server)

```bash
# macOS / Linux
./llama.cpp/llama-server \
    --model unsloth/gemma-4-E4B-it-GGUF/gemma-4-E4B-it-Q8_0.gguf \
    --port 8001 \
    --reasoning on \
    -n 2048
```

```powershell
# Windows (PowerShell)
cd ./llama.cpp
.\llama-server.exe `
    --model ..\unsloth\gemma-4-E4B-it-GGUF\gemma-4-E4B-it-Q8_0.gguf `
    --port 8001 --reasoning on -n 2048
```

✅ Running at `http://localhost:8001`

---

### Terminal 2 — FastAPI Backend

```bash
# macOS / Linux
cd backend
source ../venv/bin/activate
uvicorn main:app --reload --port 8000
```

```powershell
# Windows
cd backend
..\venv\Scripts\Activate.ps1
uvicorn main:app --reload --port 8000
```

✅ Running at `http://localhost:8000`  
📖 Swagger UI: `http://localhost:8000/docs`

---

### Terminal 3 — Next.js Frontend

```bash
cd frontend_final
npm run dev
```

✅ Running at `http://localhost:3000`

---

## 🖥️ Frontend Pages & Routes

| Route | Role | Description |
|-------|------|-------------|
| `/` | Both | Landing page — role selector |
| `/login` | Both | Login screen |
| `/paralegal` | Paralegal | Dashboard with live stats and top case cards |
| `/paralegal/case-queue` | Paralegal | Full case list — search, filter, sort, list/grid toggle |
| `/paralegal/case-entry` | Paralegal | Multi-step form to register a new case |
| `/paralegal/alerts` | Paralegal | System alerts and notifications |
| `/case/[id]` | Paralegal | Case detail — eligibility, charges, reasoning, notes |
| `/coordinator` | Coordinator | District-wide stats + Re-score All (Gemma-4) |

---

## 🔌 Frontend API Layer (`lib/api.ts`)

All backend communication goes through `frontend_final/lib/api.ts`:

| Function | Method | Endpoint | Purpose |
|----------|--------|----------|---------|
| `fetchCases()` | GET | `/cases` | Fetch all cases, returns adapted `Case[]` |
| `createClient()` | POST | `/client` | Register a new client |
| `createCase()` | POST | `/case` | Submit a case (triggers AI scoring) |
| `updateCase(id, data)` | PUT | `/case/{id}` | Update case fields |
| `deleteCase(id)` | DELETE | `/case/{id}` | Delete a case |
| `predictAll()` | POST | `/predict-all` | Re-score all cases with Gemma-4 |
| `adaptBackendCase()` | — | — | Adapter: maps backend snake_case → frontend `Case` type |

The **adapter function** (`adaptBackendCase`) handles the field-name differences between the backend (e.g., `priority_score`, `assigned_ipc`, `confidence`) and the frontend's rich `Case` TypeScript type, so all existing UI components continue to work without modification.

---

## 📡 API Endpoints

### Clients

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/client` | Create a new client | `{client_id, mother_tongue, family_contact_number}` |
| GET | `/client/{client_id}` | Get client by ID | — |

### Cases

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/case` | Create case & trigger AI scoring | `{client_id, city, crime_description, assigned_ipc, bailable, cognizable, max_sentence, date_of_occurrence, ...}` |
| GET | `/cases` | Get all cases sorted by priority | — |
| PUT | `/case/{id}` | Update case fields | `{field: value, ...}` |
| DELETE | `/case/{id}` | Delete case | — |

### Admin / Batch

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/predict-all` | Re-run Gemma-4 scoring on all cases in the database |

### Systemic Insights & Pattern Alerts (Pillar 04 & 08)

| Method | Endpoint | Description | Response |
|--------|----------|-------------|----------|
| GET | `/systemic-insights/charge-sections` | Which IPC sections drive longest undertrial detention | Array of sections with avg detention_days, eligible count, confidence |
| GET | `/systemic-insights/courts` | Which courts have worst bail-decision intervals | Array of courts with avg bail_delay_days, eligible cases delayed, confidence |
| GET | `/systemic-insights/prisons` | Which prisons have highest eligible-but-unserved density | Array of prisons with density %, avg detention, confidence |
| GET | `/systemic-insights/surety-analysis` | Which surety amounts block bail, correlated with local poverty | Array of cities with blocking_ratio %, avg surety vs 90-day wage cap, confidence |
| GET | `/alerts/pattern-adjournments` | Courts with 20+ eligible cases adjourned in quarter | CRITICAL/WARNING alerts by court, recommendations, confidence disclaimers |

### Webhooks

| Method | Endpoint | Triggered By |
|--------|----------|--------------|
| POST | `/supabase-webhook` | Supabase INSERT/UPDATE events → translates & notifies family |

---

## 🧠 Case Analysis Pipeline

When a case is created via `POST /case`, JusticeGrid automatically:

1. **Calculates Detention Days** — from `date_of_occurrence` to today
2. **Formats LLM Prompt** — structures case data for Gemma-4
3. **Calls Local Gemma-4** — gets AI-scored `priority_score`, `priority_level`, `adjournment_prob`, `confidence`, `reasoning`, and `conflict_flag`
4. **Stores in Supabase** — persists case with computed scores
5. **Triggers Webhook** (if configured) — sends translated notification to family via Twilio

### Example Response

```json
{
  "case": [{
    "id": "uuid-1234",
    "client_id": "CL-001",
    "priority_score": 165,
    "priority_level": "MEDIUM",
    "detention_days": 45,
    "eligible": true,
    "confidence": 0.89,
    "reason": "Bailable offense with moderate detention and serious IPC section warrant medium-high priority."
  }],
  "computed": {
    "priority_score": 165,
    "priority_level": "MEDIUM",
    "adjournment_prob": 65,
    "conflict_flag": null,
    "confidence": 0.89
  }
}
```

---

## 🌍 Multi-Language Notification System

When a case is created/updated, the system:
1. **Retrieves client's native language** (`mother_tongue`)
2. **Generates a safe English baseline** message (no legal jargon, no AI scores)
3. **Calls Groq LLM** to translate to native language at 5th-grade reading level
4. **Sends via Twilio WhatsApp** (primary) or SMS (fallback)

**Supported Languages:** Any language Groq supports — Hindi, Tamil, Telugu, Marathi, Gujarati, Kannada, Bengali, and more.

---

## � Database Schema & Structure

JusticeGrid uses **Supabase PostgreSQL** for all persistent data. This section documents the schema for future reference and modifications.

### 🔗 Tables Overview

```
┌─────────────────────┐
│  app_users          │ (Authentication & role management)
├─────────────────────┤
│  clients            │ (Family/prisoner demographics)
├─────────────────────┤
│  cases (Main)       │ (Undertrial case records & AI scores)
└─────────────────────┘
```

---

### 📊 Table: `cases` (Primary Case Record)

**Purpose:** Stores all undertrial case data, detention tracking, eligibility assessment, priority scores, bail information, and AI-computed metrics.

**Columns:**

| Column Name | Type | Default | Nullable | Purpose |
|---|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | ❌ | Primary key; unique case identifier |
| `report_number` | `int4` | — | ✅ | FIR report number for tracking |
| `client_id` | `text` | — | ✅ | Foreign key to `clients` table (prisoner ID) |
| `city` | `text` | — | ✅ | City where case was filed |
| `crime_description` | `text` | — | ✅ | Free-form description of the crime |
| `assigned_ipc` | `text` | — | ✅ | Indian Penal Code section(s) (e.g., "377, 506") |
| `assigned_bns` | `text` | — | ✅ | Bhratiya Nyaya Sanhita equivalent section (transitional mapping) |
| `date_reported` | `timestamp` | — | ✅ | When the FIR was filed |
| `date_of_occurrence` | `timestamp` | — | ✅ | When the alleged crime occurred |
| `victim_age` | `int4` | — | ✅ | Age of the victim |
| `victim_gender` | `text` | — | ✅ | Gender of the victim ("Male", "Female", "Other") |
| `max_sentence` | `int4` | — | ✅ | Maximum sentence in years for the offense |
| `bailable` | `text` | — | ✅ | Bail status ("Bailable" or "Non-Bailable") |
| `cognizable` | `text` | — | ✅ | Cognizable status ("Cognizable" or "Non-Cognizable") |
| **Detention & Eligibility** |
| `detention_days` | `int4` | — | ✅ | Days in custody since date_of_occurrence (auto-calculated) |
| `eligible` | `bool` | — | ✅ | Section 479 BNSS eligibility determination (true/false) |
| `eligible_but_detained` | `bool` | — | ✅ | Flag: eligible for bail but still detained (action required) |
| **AI Scores & Reasoning** |
| `priority_score` | `int4` | — | ✅ | Composite priority score (0–200) from Gemma-4 LLM |
| `priority_level` | `text` | — | ✅ | Priority level derived from score: "HIGH", "MEDIUM", "LOW" |
| `adjournment_prob` | `int4` | — | ✅ | Estimated probability (0–100) of case adjournment |
| `confidence` | `float8` | — | ✅ | LLM confidence in the assessment (0.0–1.0) |
| `conflict_flag` | `text` | — | ✅ | Serious offense indicator: "SERIOUS_OFFENCE" if max_sentence ≥ 20 |
| `reason` | `text` | — | ✅ | Plain-text reasoning for priority score (from LLM) |
| **Hearing & Adjournment** |
| `next_hearing_date` | `timestamp` | — | ✅ | Scheduled next hearing date |
| `last_hearing_date` | `timestamp` | — | ✅ | Most recent hearing date |
| `hearing_outcome` | `text` | — | ✅ | Result of last hearing ("Adjourned", "Remanded", "Bail Granted", etc.) |
| **Bail Status** |
| `bail_status` | `text` | — | ✅ | Current bail state ("PENDING", "GRANTED", "REJECTED", "APPEALED") |
| `bail_decision_date` | `timestamp` | — | ✅ | Date when bail decision was made by court |
| `bail_delay_days` | `int4` | — | ✅ | Number of days between eligibility and bail grant |
| `surety_amount` | `int4` | — | ✅ | Bail surety amount in INR (Rupees) |
| `surety_blocked` | `bool` | — | ✅ | Flag: surety amount exceeds 90-day poverty threshold (Section 440 relief needed) |
| **Location & Tracking** |
| `court_name` | `text` | — | ✅ | Name of court handling the case |
| `prison_name` | `text` | — | ✅ | Current place of detention (prison/jail name) |
| **Family Contact** |
| `family_contact_number` | `text` | — | ✅ | Family phone number for WhatsApp/SMS notifications |
| `mother_tongue` | `text` | — | ✅ | Family's preferred language for notifications |
| **Case Status** |
| `case_closed` | `bool` | `false` | ❌ | True if case is concluded or bail executed |
| **Audit Trail** |
| `created_at` | `timestamp` | `now()` | ❌ | When this report was created in JusticeGrid |
| `updated_at` | `timestamp` | `now()` | ❌ | Timestamp of last update |

---

### 👤 Table: `app_users` (User Authentication & Role Management)

**Purpose:** Tracks registered users (paralegals, UTRC coordinators) with role-based access control.

**Columns:**

| Column Name | Type | Default | Nullable | Purpose |
|---|---|---|---|---|
| `id` | `uuid` | `gen_random_uuid()` | ❌ | Primary key |
| `full_name` | `text` | — | ✅ | User's full name |
| `email` | `text` | — | ❌ | Email (also used for login) |
| `password_hash` | `text` | — | ✅ | Hashed password (bcrypt or similar) |
| `district` | `text` | — | ✅ | District where user operates |
| `role` | `text` | — | ✅ | Role: "paralegal", "utrc_coordinator", "supervisor" |
| `is_active` | `bool` | `true` | ✅ | Account activation flag |
| `created_at` | `timestamptz` | `now()` | ❌ | When account was created |

---

### 👨‍👩‍👧‍👦 Table: `clients` (Family / Prisoner Demographics)

**Purpose:** Stores demographic and contact info for families of undertrials.

**Columns:**

| Column Name | Type | Default | Nullable | Purpose |
|---|---|---|---|---|
| `client_id` | `text` | — | ✅ | Primary identifier (usually formatted like "CL-00001") |
| `mother_tongue` | `text` | — | ✅ | Prisoner/family's native language for translations |
| `family_contact_number` | `text` | — | ✅ | Phone number for WhatsApp/SMS (international format preferred: +91XXXXXXXXXX) |
| `created_at` | `timestamp` | `now()` | ❌ | When record was created |

---

### 🔑 Key Relationships

```
clients (client_id) ←─────→ cases (client_id)
  [One client]              [Many cases]
```

### 📈 Systemic Insights Derivable from `cases` Table

All systemic intelligence (Pillar 04 & 08) is **queried directly** from the `cases` table without creating new tables:

| Insight | Query Pattern | Uses Columns |
|---|---|---|
| Charge sections driving longest detention | `GROUP BY assigned_ipc` → `AVG(detention_days)` | `assigned_ipc`, `detention_days`, `eligible` |
| Courts with worst bail intervals | `GROUP BY court_name` → `AVG(bail_delay_days)` | `court_name`, `bail_delay_days`, `bail_status` |
| Prisons with highest eligible-but-unserved density | `GROUP BY prison_name` → `COUNT(eligible_but_detained)` | `prison_name`, `eligible_but_detained`, `case_closed` |
| Surety amounts blocking bail vs poverty | `GROUP BY city` → `COUNT(surety_blocked)`, compare `surety_amount` vs local median wage | `city`, `surety_amount`, `surety_blocked`, `confidence` |
| Pattern alerts for high adjournments | `WHERE eligible=true AND adjournment_prob>=70` → `GROUP BY court_name` → `COUNT()` over last 90 days | `court_name`, `eligible`, `adjournment_prob`, `created_at` |

---

### 🔧 Database Configuration (Supabase)

**Project Setup Steps:**

1. Create Supabase project at [supabase.com](https://supabase.com)
2. Note your **Project URL** and **API Key**
3. In Supabase SQL Editor, run the schema initialization (creates tables with proper indexes and RLS policies)
4. Set environment variables:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-public-api-key
   ```

---

## �🔧 Component Deep Dive

### Backend

| File | Purpose |
|------|---------|
| `main.py` | FastAPI routes, CORS middleware, case scoring pipeline |
| `db.py` | Supabase client init |
| `ml_models.py` | OpenAI SDK wrapper for local llama.cpp; fallback mock scoring |
| `models.py` | Pydantic `ClientCreate` and `CaseCreate` schemas |
| `utils.py` | Detention calculator, Gemma-4 prompt formatter, Groq translator, Twilio notifier |
| `ml_delay.py` | Adjournment probability predictor (joblib ML model) |
| `financial_intelligence.py` | Surety analysis engine; city → median wage mapping |
| `systemic_insights.py` | **[NEW]** Pillar 04 & 08: Advanced pattern analytics; charge/court/prison/surety insights; adjournment alerts |

### Frontend

| File | Purpose |
|------|---------|
| `lib/api.ts` | Central API client — all `fetch()` calls + `adaptBackendCase()` adapter |
| `lib/types.ts` | TypeScript types (`Case`, `EligibilityAssessment`, `ChargeSection`, etc.) |
| `lib/mock-data.ts` | Static fallback data used when backend is offline |
| `app/paralegal/page.tsx` | Dashboard — live stats, top alerts, case grid |
| `app/paralegal/case-queue/page.tsx` | Full queue with advanced search/filter/sort |
| `app/paralegal/case-entry/page.tsx` | Multi-step new case registration form |
| `app/case/[id]/page.tsx` | Case detail view + paralegal notes |
| `app/coordinator/page.tsx` | District-level overview + Re-score All trigger + **[NEW]** Systemic Insights & Pattern Alerts |
| `components/systemic-insights-card.tsx` | **[NEW]** Pillar 04: Displays charge/court/prison/surety insights with confidence badges |
| `components/pattern-alert-card.tsx` | **[NEW]** Pillar 08: Displays UTRC pattern alerts for high adjournments (color-coded severity) |
| `components/uncertainty-display.tsx` | **[NEW]** Pillar 08: Prominently displays model confidence (0-100%) + disclaimer that predictions are inputs to judgment |
| `components/` | Shared components: `CaseCard`, `EligibilityCard`, `StatusBadge`, etc. |

---

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| `Connection refused on port 8001` | Start the Gemma-4 llama-server in Terminal 1 |
| `SUPABASE_URL is missing` | Check `.env` file exists and variables are set correctly |
| `Twilio Auth Error` | Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` |
| `Groq API Error` | Check `GROQ_API_KEY` and account credits |
| `Port 8000 already in use` | `lsof -i :8000` then `kill -9 <PID>` (Mac/Linux) |
| `Port 3000 already in use` | `lsof -i :3000` then `kill -9 <PID>` (Mac/Linux) |
| Frontend shows "Backend unavailable" | Ensure backend is running on port 8000 and CORS is not blocked |
| Hydration mismatch warning | Already fixed — `suppressHydrationWarning` on the root `<html>` tag handles browser extension interference (e.g., Grammarly) |
| `404 on /paralegal/lawyer-review` | This route is not yet implemented; navigation will be added in a future update |

---

## 📦 Dependencies

### Backend (`requirements.txt`)

```
fastapi          # Web framework
uvicorn          # ASGI server
pydantic         # Data validation
supabase         # Database client
openai           # LLM SDK (for llama.cpp OpenAI-compatible server)
groq             # Groq API for multi-language translations
twilio           # WhatsApp / SMS notifications
python-dotenv    # Environment variable management
```

### Frontend (`frontend_final/package.json`)

```
next@16            # React framework (App Router)
react@19           # UI library
typescript         # Type safety
tailwindcss        # Utility-first CSS
shadcn/ui          # Component library (Button, Card, Tabs, etc.)
lucide-react       # Icon set
@vercel/analytics  # Production analytics
```

---

## 👨‍💻 Team

* **Backend & AI Architecture**: JusticeGrid AI Team
* **Frontend & Integration**: JusticeGrid AI Team
* **Lead Developer**: Mayank Chauhan

---

## 📜 License

MIT License
