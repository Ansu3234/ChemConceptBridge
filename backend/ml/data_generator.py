import pandas as pd
import numpy as np

# Generate synthetic student performance data
np.random.seed(42)

# Create 500 student records with quiz scores and performance labels
n_samples = 500

# Features: quiz scores (0-100), time spent (seconds), confidence level (1-5)
quiz1_scores = np.random.normal(75, 15, n_samples).clip(0, 100)
quiz2_scores = np.random.normal(72, 18, n_samples).clip(0, 100)
quiz3_scores = np.random.normal(70, 16, n_samples).clip(0, 100)
time_spent = np.random.normal(1200, 300, n_samples).clip(300, 2400)  # 5-40 minutes
confidence = np.random.randint(1, 6, n_samples)

# Calculate average score
avg_score = (quiz1_scores + quiz2_scores + quiz3_scores) / 3

# Categorize performance: weak (0-60), average (60-80), strong (80-100)
performance_labels = []
for score in avg_score:
    if score < 60:
        performance_labels.append('weak')
    elif score < 80:
        performance_labels.append('average')
    else:
        performance_labels.append('strong')

# Create DataFrame
data = pd.DataFrame({
    'quiz1': quiz1_scores.round(2),
    'quiz2': quiz2_scores.round(2),
    'quiz3': quiz3_scores.round(2),
    'time_spent': time_spent.round(0),
    'confidence': confidence,
    'performance': performance_labels
})

# Save to CSV
data.to_csv('student_scores.csv', index=False)
print("SUCCESS: Generated student_scores.csv with", len(data), "samples")
print("\nData distribution:")
print(data['performance'].value_counts())
print("\nSample data:")
print(data.head(10))
