# ⚖️ JusticeGrid - AI-Powered Undertrial Case Management System

## 🚀 Overview

**JusticeGrid** is an intelligent legal platform designed to empower paralegals and legal aid systems in managing undertrial cases efficiently. It integrates multi-source legal data, computes bail eligibility, prioritizes cases using **local Gemma-4 LLM**, translates updates in native languages via **Groq**, and sends real-time notifications via **Twilio WhatsApp/SMS**.

The system combines:
- **Data fusion** from IPC/BNS datasets
- **Local-first AI** (privacy-preserving reasoning via Gemma-4)
- **Intelligent prioritization** with explainable scoring (0-200)
- **Multi-language support** for family notifications
- **Real-time WhatsApp/SMS notifications** via webhooks
- **Secure cloud database** (Supabase)

---

## 🧠 Architecture

```text
Frontend (Paralegal Dashboard)
        ↓
FastAPI Backend (Pydantic Validation)
        ↓
    ┌───┴───────────────────────────────────┐
    ↓                                       ↓
Supabase (Cloud DB)              Local Gemma-4 (Port 8001)
    ↓                                      
Webhook Listener                           
    ↓                                       
┌─────┴─────────────────────────┐         
↓                               ↓           
Groq LLM (Translate)    Twilio (WhatsApp/SMS)
(Multi-language)        (Notifications)
```

---

## 📂 Project Structure

```text
/
├── backend/
│   ├── main.py              # FastAPI routes & core endpoints
│   ├── db.py                # Supabase client initialization
│   ├── ml_models.py         # Local Gemma-4 integration (OpenAI SDK)
│   ├── models.py            # Pydantic data schemas (Client, Case)
│   ├── utils.py             # Helper functions (detention, prompts, translations, notifications)
│   └── datasets/
│       ├── CLEANED_BNS_DATASET.csv   # BNS legal reference data
│       └── FIR_DATASET.csv           # FIR case data
├── llama.cpp/               # Compiled local inference engine
├── unsloth/                 # Gemma-4-E4B model weights (quantized)
├── setup_gemma.sh           # Automation script (Linux/Mac)
├── requirements.txt         # Python dependencies
├── .env                     # Environment variables (NOT in repo)
└── Readme.md               # This file
```

---

## 🧩 Features

* ✅ **Client & Case Management**: Robust CRUD APIs with Pydantic validation.
* ✅ **Local AI Scoring**: Powered by **Google's Gemma-4-E4B** for privacy and zero inference cost.
* ✅ **Bail Eligibility Detection**: Automatic classification based on `bailable` status in case data.
* ✅ **Intelligent Priority Scoring**: Ranking system (0-200) based on:
  - Bail eligibility
  - Detention duration
  - Offense severity (max_sentence)
  - LLM contextual reasoning
* ✅ **Multi-Language Support**: Real-time translation to family's native tongue using **Groq LLM**.
* ✅ **Real-Time Notifications**:
  - WhatsApp messages via **Twilio**
  - SMS fallback support
  - Triggered on case creation and updates via Supabase webhooks
* ✅ **Secure Database**: Cloud-hosted **Supabase** with environment-based authentication.
* ✅ **Explainable AI**: Every score includes LLM-generated reasoning and confidence metrics.
* ✅ **Retroactive Analysis**: `/predict-all` endpoint to re-score all cases with updated LLM configuration.
* ✅ **Webhook Integration**: Supabase event-driven notifications pipeline.

---

## 📊 Scoring Thresholds

Priority scores range from 0 to 200:

| Level | Score Range | Meaning | Action |
|-------|------------|---------|--------|
| 🔴 **HIGH** | > 180 | Urgent case requiring immediate paralegal attention | Paralegal assigned immediately |
| 🟡 **MEDIUM** | 121-180 | Moderate urgency with active legal review | Standard case processing |
| 🟢 **LOW** | ≤ 120 | Lower urgency cases in queue | Monitoring for developments |

---

## 🔐 Environment Variables Required

Create a `.env` file in the project root with:

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

---

## 🛠️ Getting Started

### Prerequisites

* **Python** 3.10+ ([Download](https://www.python.org/downloads/))
* **Git** ([Download](https://git-scm.com/))
* **macOS/Linux or Windows** (with PowerShell for Windows)
* **GPU-accelerated inference recommended** (optional, CPU-only works too)

---

### Installation

#### **Step 1: Clone & Setup Virtual Environment**

##### **macOS / Linux**
```bash
git clone https://github.com/your-repo/JusticeGrid.git
cd JusticeGrid

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Local AI Setup (builds llama.cpp and downloads ~6GB model)
sh setup_gemma.sh
```

##### **Windows (PowerShell)**
```powershell
git clone https://github.com/your-repo/JusticeGrid.git
cd JusticeGrid

# Create virtual environment
python -m venv venv
.\venv\Scripts\Activate.ps1

# Install dependencies
pip install -r requirements.txt

# Download and setup Gemma-4 model manually (or adapt setup_gemma.sh to PowerShell)
# For Windows, use WSL2 with the bash script, or manually download:
# 1. Download llama.cpp pre-built binaries from https://github.com/ggerganov/llama.cpp/releases
# 2. Download Gemma-4-E4B-it-Q8_0.gguf from Hugging Face https://huggingface.co/unsloth/Gemma-4-E4B-it-GGUF
# 3. Place binaries in ./llama.cpp/ and model in ./unsloth/
```

---

#### **Step 2: Configure Environment**

Create a `.env` file in the project root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-secret-key

# Twilio Configuration
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_WHATSAPP_FROM=whatsapp:+14155552671
TWILIO_SMS_FROM=+1234567890

# Groq Configuration
GROQ_API_KEY=your-groq-api-key
```

**Note:** Keep `.env` out of version control. Add it to `.gitignore`.

---

## 🚀 Running the System

The system requires **two terminal sessions** running simultaneously:

### **Terminal 1: Local AI Reasoner (Gemma-4 LLM Server)**

Starts the Gemma-4 model inference engine on your local machine.

#### **macOS**
```bash
./llama.cpp/llama-server \
    --model unsloth/gemma-4-E4B-it-GGUF/gemma-4-E4B-it-Q8_0.gguf \
    --port 8001 \
    --reasoning on \
    -n 2048
```

#### **Linux**
```bash
./llama.cpp/llama-server \
    --model unsloth/gemma-4-E4B-it-GGUF/gemma-4-E4B-it-Q8_0.gguf \
    --port 8001 \
    --reasoning on \
    -n 2048
```

#### **Windows (PowerShell)**
```powershell
cd ./llama.cpp
.\llama-server.exe `
    --model ..\unsloth\gemma-4-E4B-it-GGUF\gemma-4-E4B-it-Q8_0.gguf `
    --port 8001 `
    --reasoning on `
    -n 2048
```

**Verification:** The server should be running on `http://localhost:8001`

---

### **Terminal 2: FastAPI Backend**

Starts the JusticeGrid API server.

#### **macOS / Linux**
```bash
cd backend
source ../venv/bin/activate
uvicorn main:app --reload --port 8000
```

#### **Windows (PowerShell)**
```powershell
cd backend
.\../venv/Scripts/Activate.ps1
uvicorn main:app --reload --port 8000
```

**API Documentation:** Available at `http://127.0.0.1:8000/docs` (Swagger UI)

---

## � API Endpoints

### **Clients**

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/client` | Create a new client | `{client_id, mother_tongue, family_contact_number}` |
| GET | `/client/{client_id}` | Get client by ID | - |

### **Cases** (Core Functionality)

| Method | Endpoint | Description | Request Body |
|--------|----------|-------------|--------------|
| POST | `/case` | Create case & trigger AI scoring | `{client_id, report_details, city, ipc_section, bailable, cognizable, max_sentence, date_of_occurrence}` |
| GET | `/cases` | Get all cases (sorted by priority) | - |
| PUT | `/case/{id}` | Update case details | `{field_name: value}` |
| DELETE | `/case/{id}` | Delete case | - |

### **Admin/Batch Operations**

| Method | Endpoint | Description | Purpose |
|--------|----------|-------------|---------|
| POST | `/predict-all` | Retroactively score all cases | Re-runs Gemma-4 on entire database (useful after LLM updates) |

### **Webhooks**

| Method | Endpoint | Description | Triggered By |
|--------|----------|-------------|--------------|
| POST | `/supabase-webhook` | Handles case updates & sends notifications | Supabase INSERT/UPDATE events |

---

## 🧠 Case Analysis Pipeline

When you create a case via `POST /case`, JusticeGrid automatically:

1. **Calculates Detention Days**: From `date_of_occurrence` to today
2. **Formats LLM Prompt**: Structures case data for Gemma-4
3. **Calls Local Gemma-4**: Gets AI-powered scoring and reasoning
4. **Stores in Supabase**: Persists case with computed scores
5. **Triggers Webhook** (if configured): Sends translated notification to family

### Example Response:
```json
{
  "case": {
    "id": "uuid-1234",
    "client_id": "CL-001",
    "priority_score": 165,
    "priority_level": "MEDIUM",
    "detention_days": 45,
    "eligible": true,
    "confidence": 0.89,
    "reasoning": "Bailable offense with moderate detention duration and serious IPC section warrant medium-high priority."
  },
  "computed": {
    "priority_score": 165,
    "priority_level": "MEDIUM",
    "adjournment_prob": 65,
    "conflict_flag": "SERIOUS_OFFENCE",
    "confidence": 0.89,
    "reasoning": "..."
  }
}
```

---

## 🌍 Multi-Language Notification System

When a case is created/updated, the system:
1. **Retrieves client's native language** (`mother_tongue`)
2. **Generates English baseline** message
3. **Calls Groq LLM** to translate to native language
4. **Sends via Twilio WhatsApp** (primary) or SMS (fallback)

**Supported Languages:** Any language Groq supports (Hindi, Tamil, Telugu, Marathi, Gujarati, Kannada, etc.)

---

## 🔧 Backend Components Deep Dive

### **main.py** - FastAPI Routes
- Core CRUD endpoints for clients and cases
- Webhook listener for Supabase events
- Integrated ML scoring on case creation
- `/predict-all` for batch re-scoring

### **db.py** - Database Connection
- Supabase client initialization
- Environment-based configuration
- Graceful handling of missing credentials

### **ml_models.py** - Local LLM Integration
- OpenAI SDK wrapper pointing to local llama.cpp server
- JSON parsing of Gemma-4 responses
- Fallback mock scoring if LLM unavailable

### **models.py** - Data Validation
- Pydantic schemas for ClientCreate and CaseCreate
- Enforces data types and validation rules
- Supports optional fields for ML outputs

### **utils.py** - Helper Functions
- **Detention Calculator**: Days since occurrence date
- **Prompt Formatter**: Structures case data for Gemma-4
- **Translator**: Groq-powered multi-language translation
- **Notification Sender**: Twilio WhatsApp/SMS integration

---

## 🔍 Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| `Connection refused on port 8001` | Ensure Gemma-4 server is running in Terminal 1 |
| `SUPABASE_URL is missing` | Check `.env` file exists and `SUPABASE_URL` is set |
| `Twilio Auth Error` | Verify `TWILIO_ACCOUNT_SID` and `TWILIO_AUTH_TOKEN` in `.env` |
| `Groq API Error` | Check `GROQ_API_KEY` and verify account credits |
| `Port 8000 already in use` | Change with `--port 9000` or kill the process: `lsof -i :8000` (Mac/Linux) or `netstat -ano \| findstr :8000` (Windows) |

---

## 📦 Dependencies

Key Python packages installed via `requirements.txt`:

```
fastapi==0.109.0          # Web framework
uvicorn==0.27.0           # ASGI server
pydantic==2.5.3           # Data validation
supabase==2.4.1           # Database client
openai==1.3.5             # LLM SDK (for llama.cpp compatibility)
groq==0.4.2               # Groq API for translations
twilio==9.0.0             # WhatsApp/SMS notifications
python-dotenv==1.0.0      # Environment variable management
```

Install with:
```bash
pip install -r requirements.txt
```

---

## 👨‍💻 Team

* **Backend & AI Architecture**: Managed by JusticeGrid AI Team
* **Lead Developer**: Mayank Chauhan

---

## 📜 License

MIT License
