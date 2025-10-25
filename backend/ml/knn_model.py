import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
import joblib

# Sample: student scores dataset
# Columns: [quiz1, quiz2, quiz3, performance]
data = pd.read_csv("student_scores.csv")

X = data.drop("performance", axis=1)  # quiz scores
y = data["performance"]  # labels (weak/average/strong)

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Train KNN model
knn = KNeighborsClassifier(n_neighbors=3)
knn.fit(X_train, y_train)

# Save model
joblib.dump(knn, "knn_model.pkl")
print("✅ KNN Model trained and saved!")
