import sys
import json
import joblib
import numpy as np

knn = joblib.load("knn_model.pkl")

raw_input = sys.argv[1] if len(sys.argv) > 1 else "{}"
input_data = json.loads(raw_input)

features = [
    float(input_data.get("quiz1", 0)),
    float(input_data.get("quiz2", 0)),
    float(input_data.get("quiz3", 0)),
    float(input_data.get("time_spent", 1200)),
    float(input_data.get("confidence", 3))
]

features_array = np.array([features])

prediction = knn.predict(features_array)[0]

probabilities = {}
if hasattr(knn, "predict_proba"):
    classes = knn.classes_
    probs = knn.predict_proba(features_array)[0]
    probabilities = {
        str(label): round(float(prob), 4)
        for label, prob in zip(classes, probs)
    }

result = {
    "model": "KNN",
    "prediction": str(prediction),
    "input": {
        "quiz1": features[0],
        "quiz2": features[1],
        "quiz3": features[2],
        "time_spent": features[3],
        "confidence": features[4]
    }
}

if probabilities:
    result["probabilities"] = probabilities

print(json.dumps(result))
