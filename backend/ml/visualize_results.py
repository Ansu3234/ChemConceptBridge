import os
import matplotlib.pyplot as plt
import pandas as pd
import json
import numpy as np

print("=" * 80)
print("MODEL PERFORMANCE VISUALIZATION")
print("=" * 80)

# Load results
with open("model_results.json", "r") as f:
    results = json.load(f)

df = pd.DataFrame(results)

# Set up the plotting style
plt.style.use('seaborn-v0_8-darkgrid')
fig = plt.figure(figsize=(16, 10))

# 1. Accuracy Comparison Bar Chart
ax1 = plt.subplot(2, 3, 1)
bars = ax1.bar(df['model'], df['accuracy'], color=['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'])
ax1.set_title('Model Accuracy Comparison', fontsize=14, fontweight='bold')
ax1.set_ylabel('Accuracy (%)', fontsize=12)
ax1.set_ylim(0, 100)
ax1.grid(axis='y', alpha=0.3)

# Add value labels on bars
for bar in bars:
    height = bar.get_height()
    ax1.text(bar.get_x() + bar.get_width()/2., height,
             f'{height}%',
             ha='center', va='bottom', fontsize=10, fontweight='bold')

plt.setp(ax1.xaxis.get_majorticklabels(), rotation=45, ha='right')

# 2. Precision Comparison
ax2 = plt.subplot(2, 3, 2)
bars = ax2.bar(df['model'], df['precision'], color=['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'])
ax2.set_title('Model Precision Comparison', fontsize=14, fontweight='bold')
ax2.set_ylabel('Precision (%)', fontsize=12)
ax2.set_ylim(0, 100)
ax2.grid(axis='y', alpha=0.3)

for bar in bars:
    height = bar.get_height()
    ax2.text(bar.get_x() + bar.get_width()/2., height,
             f'{height}%',
             ha='center', va='bottom', fontsize=10, fontweight='bold')

plt.setp(ax2.xaxis.get_majorticklabels(), rotation=45, ha='right')

# 3. Recall Comparison
ax3 = plt.subplot(2, 3, 3)
bars = ax3.bar(df['model'], df['recall'], color=['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'])
ax3.set_title('Model Recall Comparison', fontsize=14, fontweight='bold')
ax3.set_ylabel('Recall (%)', fontsize=12)
ax3.set_ylim(0, 100)
ax3.grid(axis='y', alpha=0.3)

for bar in bars:
    height = bar.get_height()
    ax3.text(bar.get_x() + bar.get_width()/2., height,
             f'{height}%',
             ha='center', va='bottom', fontsize=10, fontweight='bold')

plt.setp(ax3.xaxis.get_majorticklabels(), rotation=45, ha='right')

# 4. F1-Score Comparison
ax4 = plt.subplot(2, 3, 4)
bars = ax4.bar(df['model'], df['f1_score'], color=['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6'])
ax4.set_title('Model F1-Score Comparison', fontsize=14, fontweight='bold')
ax4.set_ylabel('F1-Score (%)', fontsize=12)
ax4.set_ylim(0, 100)
ax4.grid(axis='y', alpha=0.3)

for bar in bars:
    height = bar.get_height()
    ax4.text(bar.get_x() + bar.get_width()/2., height,
             f'{height}%',
             ha='center', va='bottom', fontsize=10, fontweight='bold')

plt.setp(ax4.xaxis.get_majorticklabels(), rotation=45, ha='right')

# 5. Comprehensive Metrics Comparison (Grouped Bar Chart)
ax5 = plt.subplot(2, 3, 5)
x = np.arange(len(df['model']))
width = 0.2

ax5.bar(x - 1.5*width, df['accuracy'], width, label='Accuracy', color='#3498db')
ax5.bar(x - 0.5*width, df['precision'], width, label='Precision', color='#2ecc71')
ax5.bar(x + 0.5*width, df['recall'], width, label='Recall', color='#e74c3c')
ax5.bar(x + 1.5*width, df['f1_score'], width, label='F1-Score', color='#f39c12')

ax5.set_title('All Metrics Comparison', fontsize=14, fontweight='bold')
ax5.set_ylabel('Score (%)', fontsize=12)
ax5.set_xlabel('Models', fontsize=12)
ax5.set_xticks(x)
ax5.set_xticklabels(df['model'], rotation=45, ha='right')
ax5.legend(loc='upper left')
ax5.set_ylim(0, 100)
ax5.grid(axis='y', alpha=0.3)

# 6. Model Performance Radar Chart
ax6 = plt.subplot(2, 3, 6, projection='polar')

categories = ['Accuracy', 'Precision', 'Recall', 'F1-Score']
N = len(categories)

# Calculate angles for each metric
angles = [n / float(N) * 2 * np.pi for n in range(N)]
angles += angles[:1]  # Complete the circle

# Create subplot for each model
colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6']
for idx, row in df.iterrows():
    values = [
        row['accuracy'],
        row['precision'],
        row['recall'],
        row['f1_score']
    ]
    values += values[:1]  # Complete the circle
    
    ax6.plot(angles, values, 'o-', linewidth=2, label=row['model'], color=colors[idx])
    ax6.fill(angles, values, alpha=0.1, color=colors[idx])

ax6.set_xticks(angles[:-1])
ax6.set_xticklabels(categories)
ax6.set_ylim(0, 100)
ax6.set_title('Performance Radar Chart', fontsize=14, fontweight='bold', pad=20)
ax6.legend(loc='upper right', bbox_to_anchor=(1.3, 1.1))

# Add overall title
fig.suptitle('Machine Learning Model Performance Comparison\nStudent Performance Prediction', 
             fontsize=16, fontweight='bold', y=0.995)

# Adjust layout
plt.tight_layout()

# Save the figure
output_file = 'model_comparison_charts.png'
plt.savefig(output_file, dpi=300, bbox_inches='tight')
print(f"\n[OK] Visualization saved to: {output_file}")

if os.environ.get("DISPLAY") or os.environ.get("MATPLOTLIB_SHOW") == "1":
    plt.show()

print("\n" + "=" * 80)
print("VISUALIZATION COMPLETE")
print("=" * 80)
