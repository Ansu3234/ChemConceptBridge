# Machine Learning Models for Student Performance Prediction

This directory contains machine learning models for predicting student performance in the ChemConcept Bridge platform.

## 📋 Models Implemented

1. **K-Nearest Neighbors (KNN)**
2. **Naive Bayes Classifier**
3. **Decision Tree**
4. **Support Vector Machine (SVM)**
5. **Backpropagation Neural Network**

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Generate Training Data

```bash
python data_generator.py
```

This generates `student_scores.csv` with 500 synthetic student records.

### 3. Train All Models

```bash
python train_models.py
```

This will:
- Load the training data
- Split into train/test sets (80/20)
- Train all 5 models
- Evaluate each model
- Save trained models as `.pkl` files
- Generate `model_results.json` with metrics

### 4. Visualize Results

```bash
python visualize_results.py
```

This generates `model_comparison_charts.png` with:
- Accuracy comparison
- Precision comparison
- Recall comparison
- F1-Score comparison
- Grouped metrics chart
- Performance radar chart

## 📊 Model Evaluation Metrics

Each model is evaluated using:
- **Accuracy**: Percentage of correct predictions
- **Precision**: True positives / (True positives + False positives)
- **Recall**: True positives / (True positives + False negatives)
- **F1-Score**: Harmonic mean of precision and recall

## 🎯 Dataset

The dataset includes the following features:
- `quiz1`, `quiz2`, `quiz3`: Quiz scores (0-100)
- `time_spent`: Time taken (seconds)
- `confidence`: Self-reported confidence (1-5)

Target variable:
- `performance`: Categories (weak, average, strong)

## 📈 Expected Results

Based on the synthetic data, typical performance metrics:
- **Best Model**: Neural Network or Decision Tree
- **Accuracy Range**: 85-95%
- **F1-Score Range**: 85-95%

## 🔧 Usage in Application

Models can be used through the API endpoint:

```javascript
// POST /api/ml/predict-performance
{
  "quiz1": 75,
  "quiz2": 82,
  "quiz3": 68
}
```

Response:
```json
{
  "prediction": "average",
  "confidence": 0.85,
  "features": { "quiz1": 75, "quiz2": 82, "quiz3": 68 }
}
```

## 📁 Files

- `data_generator.py`: Generate synthetic student performance data
- `train_models.py`: Train all ML models
- `visualize_results.py`: Create comparison visualizations
- `predict_knn.py`: KNN prediction script (used by API)
- `knn_model.py`: Original KNN training script
- `requirements.txt`: Python dependencies
- `student_scores.csv`: Generated training data
- `model_results.json`: Evaluation metrics for all models
- `*.pkl`: Serialized trained models

## 🎓 Model Selection Criteria

When choosing a model, consider:

1. **Accuracy**: Overall prediction correctness
2. **Interpretability**: How easy it is to understand decisions
3. **Training Time**: How long it takes to train
4. **Prediction Speed**: How fast predictions are made
5. **Memory Usage**: Model size and memory requirements

## 🔬 Model Details

### K-Nearest Neighbors (KNN)
- **Algorithm**: Instance-based learning
- **Hyperparameters**: n_neighbors=5
- **Pros**: Simple, no training needed, good for non-linear data
- **Cons**: Slow prediction, memory intensive

### Naive Bayes
- **Algorithm**: Probabilistic classifier
- **Hyperparameters**: Gaussian NB (default)
- **Pros**: Fast, good for small datasets
- **Cons**: Assumes feature independence

### Decision Tree
- **Algorithm**: Tree-based classification
- **Hyperparameters**: max_depth=10, random_state=42
- **Pros**: Interpretable, handles non-linear patterns
- **Cons**: Can overfit without pruning

### SVM
- **Algorithm**: Support Vector Machine with RBF kernel
- **Hyperparameters**: kernel='rbf', probability=True
- **Pros**: Good for high-dimensional data, robust
- **Cons**: Slow for large datasets, needs parameter tuning

### Neural Network
- **Algorithm**: Multi-layer Perceptron with backpropagation
- **Hyperparameters**: hidden_layers=(100,50), max_iter=1000
- **Pros**: Can model complex patterns, flexible
- **Cons**: Black box, requires more data

## 📝 Notes

- Models are trained on synthetic data - real-world performance may vary
- For production use, train on actual student data
- Consider feature engineering for better results
- Hyperparameter tuning can improve performance
- Cross-validation recommended for robust evaluation

## 🤝 Contributing

To add a new model:
1. Add model class to `train_models.py`
2. Train and evaluate following the same pattern
3. Add visualization if needed
4. Update this README

## 📞 Support

For questions or issues with the ML models, please contact the development team.
