# backend/ml/predict.py
import sys
import json
import numpy as np
from joblib import load

# Dummy prediction just to simulate
# Replace with your trained model if available
def predict_performance(data):
    quiz_scores = np.array(data).astype(float)
    avg = np.mean(quiz_scores)
    if avg > 7:
        return "High"
    elif avg > 4:
        return "Medium"
    else:
        return "Low"

if __name__ == "__main__":
    input_data = json.loads(sys.stdin.read())
    quiz_scores = [input_data.get("quiz1"), input_data.get("quiz2"), input_data.get("quiz3")]
    result = predict_performance(quiz_scores)
    print(json.dumps({"prediction": result}))
