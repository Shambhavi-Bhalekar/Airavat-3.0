import datetime
from financial_intelligence import evaluate_surety

# Create a mock case that should trigger the section 440 flag
# A case in Mumbai where bail was granted 20 days ago, but the surety required is Rs 50,000.
# Mumbai median wage is 450. 450 * 90 = 40,500. So 50k > 40.5k -> Should Flag!

case_mock = {
    "client_id": "TEST-001",
    "city": "Mumbai",
    "court_name": "Sessions Court Mumbai",
    "assigned_ipc": "Section 379 IPC",
    "bail_status": "GRANTED",
    "bail_decision_date": (datetime.datetime.now() - datetime.timedelta(days=20)).isoformat(),
    "surety_amount": 50000,
}

result = evaluate_surety(case_mock)

print("--- FINANCIAL INTELLIGENCE EVALUATION ---")
print(f"Delay Days: {result.get('bail_delay_days')}")
print(f"Surety Blocked: {result.get('surety_blocked')}")
print(f"Section 440 Flag Triggered: {result.get('section_440_flag')}")

if result.get("section_440_flag"):
    print("\n[GENERATED BRIEF PREVIEW:]\n")
    print(result.get("section_440_brief"))
else:
    print("\nFail: Did not generate brief as expected.")

# Test a non-triggering case (Rs 10,000 surety in Mumbai -> False)
case_mock_2 = dict(case_mock)
case_mock_2["surety_amount"] = 10000
result2 = evaluate_surety(case_mock_2)
print(f"\nTest 2 (Low Amount) Section 440 Flag: {result2.get('section_440_flag')}")
