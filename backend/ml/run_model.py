# ...existing code...
import sys
import json
import time
from pathlib import Path

import numpy as np
import pandas as pd
from joblib import dump, load
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.neighbors import KNeighborsClassifier
from sklearn.naive_bayes import GaussianNB
from sklearn.neural_network import MLPClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.svm import SVC
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

MODELS_DIR = Path(__file__).parent / "models"
MODELS_DIR.mkdir(exist_ok=True)

def load_dataset(path=None):
    if path:
        p = Path(path)
        if not p.exists():
            raise FileNotFoundError(f"Dataset not found: {path}")
        df = pd.read_csv(p)
        if df.shape[1] < 2:
            raise ValueError("Dataset must contain features + label (label as last column)")
        X = df.iloc[:, :-1].values
        y = df.iloc[:, -1].values
        return X, y
    # fallback: iris sample dataset
    from sklearn.datasets import load_iris
    iris = load_iris()
    return iris.data, iris.target

def train_and_save(dataset_path=None, test_size=0.2, random_state=42):
    X, y = load_dataset(dataset_path)
    strat = y if len(np.unique(y)) > 1 else None
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=test_size, random_state=random_state, stratify=strat)

    results = {}

    # KNN (with scaling)
    knn_pipe = Pipeline([("scaler", StandardScaler()), ("knn", KNeighborsClassifier(n_neighbors=5))])
    knn_pipe.fit(X_train, y_train)
    preds = knn_pipe.predict(X_test)
    results['knn'] = {
        "accuracy": float(accuracy_score(y_test, preds)),
        "classification_report": classification_report(y_test, preds, output_dict=True),
        "confusion_matrix": classification_matrix_to_list(confusion_matrix(y_test, preds))
    }
    dump(knn_pipe, MODELS_DIR / "knn.joblib")

    # Naive Bayes (Gaussian)
    nb_pipe = Pipeline([("scaler", StandardScaler()), ("nb", GaussianNB())])
    nb_pipe.fit(X_train, y_train)
    preds = nb_pipe.predict(X_test)
    results['naive_bayes'] = {
        "accuracy": float(accuracy_score(y_test, preds)),
        "classification_report": classification_report(y_test, preds, output_dict=True),
        "confusion_matrix": classification_matrix_to_list(confusion_matrix(y_test, preds))
    }
    dump(nb_pipe, MODELS_DIR / "naive_bayes.joblib")

    # Decision Tree
    dt_model = DecisionTreeClassifier(random_state=random_state, max_depth=10)
    dt_model.fit(X_train, y_train)
    preds = dt_model.predict(X_test)
    results['decision_tree'] = {
        "accuracy": float(accuracy_score(y_test, preds)),
        "classification_report": classification_report(y_test, preds, output_dict=True),
        "confusion_matrix": classification_matrix_to_list(confusion_matrix(y_test, preds))
    }
    dump(dt_model, MODELS_DIR / "decision_tree.joblib")

    # SVM
    svm_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("svm", SVC(kernel="rbf", probability=True, random_state=random_state))
    ])
    svm_pipe.fit(X_train, y_train)
    preds = svm_pipe.predict(X_test)
    results['svm'] = {
        "accuracy": float(accuracy_score(y_test, preds)),
        "classification_report": classification_report(y_test, preds, output_dict=True),
        "confusion_matrix": classification_matrix_to_list(confusion_matrix(y_test, preds))
    }
    dump(svm_pipe, MODELS_DIR / "svm.joblib")

    # Neural Network (MLP)
    mlp_pipe = Pipeline([
        ("scaler", StandardScaler()),
        ("mlp", MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=500, random_state=random_state))
    ])
    mlp_pipe.fit(X_train, y_train)
    preds = mlp_pipe.predict(X_test)
    results['neural_network'] = {
        "accuracy": float(accuracy_score(y_test, preds)),
        "classification_report": classification_report(y_test, preds, output_dict=True),
        "confusion_matrix": classification_matrix_to_list(confusion_matrix(y_test, preds))
    }
    dump(mlp_pipe, MODELS_DIR / "neural_network.joblib")

    return results

def classification_matrix_to_list(cm):
    try:
        return cm.tolist()
    except Exception:
        return []

def ensure_models_exist():
    if not any(MODELS_DIR.glob("*.joblib")):
        return train_and_save()
    return {"status": "models_exist"}

def load_model(name):
    path = MODELS_DIR / f"{name}.joblib"
    if not path.exists():
        raise FileNotFoundError(f"Model file not found: {path}")
    return load(path)

def predict_with_model(model_name, features):
    model = load_model(model_name)
    X = np.array(features)
    if X.ndim == 1:
        X = X.reshape(1, -1)
    preds = model.predict(X).tolist()
    proba = None
    if hasattr(model, "predict_proba"):
        try:
            proba = model.predict_proba(X).tolist()
        except Exception:
            proba = None
    return {"predictions": preds, "probabilities": proba}

def main():
    # accept JSON from stdin or simple argv commands
    try:
        payload = json.load(sys.stdin) if not sys.stdin.isatty() else {}
    except Exception:
        payload = {}

    # allow argv fallback: e.g. python run_model.py train
    if not payload and len(sys.argv) > 1:
        payload = {"action": sys.argv[1]}
        # optionally dataset path: python run_model.py train /full/path/data.csv
        if len(sys.argv) > 2:
            payload["dataset_path"] = sys.argv[2]

    action = (payload.get("action") or "status").lower()

    try:
        if action == "train":
            dataset = payload.get("dataset_path")
            res = train_and_save(dataset)
            print(json.dumps({"success": True, "trained": True, "results": res}, default=str))
            return

        ensure_models_exist()

        if action == "predict":
            model = payload.get("model")
            features = payload.get("features")
            if not model or features is None:
                raise ValueError("Provide 'model' (knn|naive_bayes|decision_tree|svm|neural_network) and 'features'")
            out = predict_with_model(model, features)
            print(json.dumps({"success": True, "model": model, "result": out}, default=str))
            return

        if action == "predict_all":
            features = payload.get("features")
            if features is None:
                raise ValueError("Provide 'features' as list")
            models = ["knn", "naive_bayes", "decision_tree", "svm", "neural_network"]
            all_results = {}
            for m in models:
                try:
                    all_results[m] = predict_with_model(m, features)
                except Exception as e:
                    all_results[m] = {"error": str(e)}
            print(json.dumps({"success": True, "results": all_results}, default=str))
            return

        if action == "status":
            files = [p.name for p in MODELS_DIR.glob("*.joblib")]
            print(json.dumps({"success": True, "models": files}))
            return

        raise ValueError(f"Unknown action: {action}")

    except Exception as e:
        print(json.dumps({"success": False, "error": str(e)}))
        return

if __name__ == "__main__":
    main()
# ...existing code...