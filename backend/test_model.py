import sys
import os

from ml_delay import predict_delay
try:
    print(predict_delay({"city": "Mumbai", "date_of_occurrence": "2024-05-01", "assigned_ipc": "302"}))
    sys.exit(0)
except Exception as e:
    print(e)
    sys.exit(1)
