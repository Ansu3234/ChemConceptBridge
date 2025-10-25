import sys
import json
import joblib
import numpy as np

# Load trained model
knn = joblib.load("knn_model.pkl")

# Read input from Node.js
input_data = json.loads(sys.argv[1])
features = np.array([[input_data["quiz1"], input_data["quiz2"], input_data["quiz3"]]])

# Predict
prediction = knn.predict(features)
print(prediction[0])
