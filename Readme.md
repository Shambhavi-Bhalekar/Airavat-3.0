# ⚖️ JusticeGrid

## 🚀 Overview

JusticeGrid is a legal intelligence platform designed to assist paralegals and legal aid systems in managing undertrial cases efficiently. It integrates multi-source legal data, computes bail eligibility, and prioritizes cases using a **local Gemma-4 LLM** for intelligent scoring and reasoning.

The system focuses on data fusion, case prioritization, legal accessibility, and ethical local-first AI.

---

## 🧠 Architecture

```text
Frontend (Paralegal Dashboard)
        ↓
FastAPI Backend (Pydantic Validation)
        ↓
    ┌───┴────────────────┐
    ↓                    ↓
Supabase (Cloud DB)   Local Gemma-4 (LLM Engine)
                      (via llama.cpp / Port 8001)
```

---

## 📂 Project Structure

```text
/
├── backend/
│   ├── main.py          # FastAPI routes & API logic
│   ├── db.py            # Supabase connection (dotenv)
│   ├── ml_models.py     # Local LLM integration (OpenAI SDK)
│   ├── models.py        # Pydantic data schemas
│   ├── utils.py         # Helper functions & Prompts
│   └── datasets/        # Legal datasets (IPC/BNS)
├── llama.cpp/           # Compiled local inference engine
├── unsloth/             # Local Model weights (Gemma-4-E4B)
├── setup_gemma.sh       # Automation for local AI setup
├── requirements.txt     # Python dependencies
└── .env                 # Environment variables (Private)
```

---

## 🧩 Features

* ✅ **Client & Case Management**: Robust CRUD APIs with validation.
* ✅ **Local AI Scoring**: Powered by Google's Gemma-4-E4B for privacy and zero cost.
* ✅ **Bail Eligibility**: Automated detection based on IPC/BNS mapping.
* ✅ **Priority Scoring**: Intelligent ranking based on detention, severity, and LLM reasoning.
* ✅ **Secure Database**: Cloud-hosted Supabase integration with environment security.
* ✅ **Explainable AI**: Every score comes with an LLM-generated reason and confidence score.

---

## 🛠️ Getting Started

### Prerequisites

* macOS (recommended for Metal GPU acceleration)
* Python 3.10+
* [Git](https://git-scm.com/)

### Setup

Clone the repository and initialize the environment:

```bash
# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run Local AI Setup (Builds llama.cpp & downloads 6GB model)
sh setup_gemma.sh
```

### Environment Configuration

Create a `.env` file in the root directory:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-secret-key
```

---

## 🚀 Running the System

You need **two terminal tabs** running simultaneously:

### Tab 1: AI Reasoner (Local Server)

Starts the Gemma-4 model on your local GPU/CPU.

```bash
./llama.cpp/llama-server \
    --model unsloth/gemma-4-E4B-it-GGUF/gemma-4-E4B-it-Q8_0.gguf \
    --port 8001 \
    --reasoning on
```

### Tab 2: JusticeGrid Backend

Starts the FastAPI application.

```bash
cd backend
source ../venv/bin/activate
uvicorn main:app --reload
```

API Documentation will be available at: `http://127.0.0.1:8000/docs`

---

## ⚖️ Priority Scoring Logic

Every case is analyzed by the **Gemma-4** model using the following parameters:

1. **Eligibility Status**: Is the offence bailable?
2. **Time Sensitivity**: How many days has the client been in detention?
3. **Severity**: Is the `max_sentence` >= 20 years (Serious Offence)?
4. **LLM Reasoning**: Dynamic analysis of the case report details.

---

## 👨‍💻 Team

* **Backend & AI Architecture**: Managed by JusticeGrid AI Team
* **Lead Developer**: Mayank Chauhan

---

## 📜 License

MIT License
