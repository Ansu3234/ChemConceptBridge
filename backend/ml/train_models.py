import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, classification_report, confusion_matrix
import joblib
import json
import warnings
warnings.filterwarnings('ignore')

print("=" * 80)
print("ML MODEL TRAINING AND COMPARISON")
print("=" * 80)

# Load dataset
print("\n[*] Loading dataset...")
data = pd.read_csv("student_scores.csv")
print(f"Dataset shape: {data.shape}")
print(f"\nPerformance distribution:")
print(data['performance'].value_counts())

# Prepare features and target
X = data.drop("performance", axis=1)
y = data["performance"]

# Split dataset
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
print(f"\nTraining samples: {len(X_train)}")
print(f"Test samples: {len(X_test)}")

# Store results for comparison
results = []

def evaluate_model(name, model, X_test, y_test):
    """Evaluate model and return metrics"""
    y_pred = model.predict(X_test)
    
    # Calculate metrics
    accuracy = accuracy_score(y_test, y_pred)
    precision, recall, f1, _ = precision_recall_fscore_support(y_test, y_pred, average='weighted', zero_division=0)
    
    return {
        'model': name,
        'accuracy': round(accuracy * 100, 2),
        'precision': round(precision * 100, 2),
        'recall': round(recall * 100, 2),
        'f1_score': round(f1 * 100, 2)
    }

print("\n" + "=" * 80)
print("1. K-NEAREST NEIGHBORS (KNN)")
print("=" * 80)

knn = KNeighborsClassifier(n_neighbors=5)
knn.fit(X_train, y_train)
joblib.dump(knn, "knn_model.pkl")
knn_result = evaluate_model("KNN", knn, X_test, y_test)
results.append(knn_result)
print(f"[OK] Accuracy: {knn_result['accuracy']}%")
print(f"[OK] F1-Score: {knn_result['f1_score']}%")

print("\n" + "=" * 80)
print("2. NAIVE BAYES CLASSIFIER")
print("=" * 80)

nb = GaussianNB()
nb.fit(X_train, y_train)
joblib.dump(nb, "naive_bayes_model.pkl")
nb_result = evaluate_model("Naive Bayes", nb, X_test, y_test)
results.append(nb_result)
print(f"[OK] Accuracy: {nb_result['accuracy']}%")
print(f"[OK] F1-Score: {nb_result['f1_score']}%")

print("\n" + "=" * 80)
print("3. DECISION TREE")
print("=" * 80)

dt = DecisionTreeClassifier(random_state=42, max_depth=10)
dt.fit(X_train, y_train)
joblib.dump(dt, "decision_tree_model.pkl")
dt_result = evaluate_model("Decision Tree", dt, X_test, y_test)
results.append(dt_result)
print(f"[OK] Accuracy: {dt_result['accuracy']}%")
print(f"[OK] F1-Score: {dt_result['f1_score']}%")

print("\n" + "=" * 80)
print("4. SUPPORT VECTOR MACHINE (SVM)")
print("=" * 80)

svm = SVC(kernel='rbf', random_state=42, probability=True)
svm.fit(X_train, y_train)
joblib.dump(svm, "svm_model.pkl")
svm_result = evaluate_model("SVM", svm, X_test, y_test)
results.append(svm_result)
print(f"[OK] Accuracy: {svm_result['accuracy']}%")
print(f"[OK] F1-Score: {svm_result['f1_score']}%")

print("\n" + "=" * 80)
print("5. BACKPROPAGATION NEURAL NETWORK")
print("=" * 80)

# MLPClassifier uses backpropagation
nn = MLPClassifier(hidden_layer_sizes=(100, 50), max_iter=1000, random_state=42)
nn.fit(X_train, y_train)
joblib.dump(nn, "neural_network_model.pkl")
nn_result = evaluate_model("Neural Network", nn, X_test, y_test)
results.append(nn_result)
print(f"[OK] Accuracy: {nn_result['accuracy']}%")
print(f"[OK] F1-Score: {nn_result['f1_score']}%")

print("\n" + "=" * 80)
print("MODEL COMPARISON SUMMARY")
print("=" * 80)

# Create comparison DataFrame
comparison_df = pd.DataFrame(results)
comparison_df = comparison_df.sort_values('accuracy', ascending=False)

print("\n" + comparison_df.to_string(index=False))

# Find best model
best_model = comparison_df.iloc[0]
print(f"\n[BEST MODEL] {best_model['model']}")
print(f"   Accuracy: {best_model['accuracy']}%")
print(f"   F1-Score: {best_model['f1_score']}%")

# Save results to JSON
with open("model_results.json", "w") as f:
    json.dump(results, f, indent=2)

print("\n[OK] All models trained and saved!")
print("[OK] Results saved to model_results.json")
