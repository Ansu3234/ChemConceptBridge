# AI-Generated Learning Path Module

## Overview

The **AI-Generated Learning Path** module provides personalized weekly topic roadmaps based on a student's quiz history and mastery levels. It uses intelligent analysis of quiz performance to identify weak areas, track progress, and recommend the most valuable topics to study next.

## Features

### 1. **Intelligent Mastery Calculation**
- Analyzes all quiz attempts by topic
- Calculates mastery as a weighted combination of:
  - Recent performance (weighted more heavily)
  - Student confidence levels
  - Number of attempts
- Provides mastery score from 0-100%

### 2. **Performance Trend Analysis**
- Tracks whether student performance is improving, stable, or declining
- Compares recent attempts against earlier attempts
- Identifies topics where student needs intervention

### 3. **Personalized Recommendations**
- **High Priority (Red)**: Topics where mastery < 60% or performance is declining
- **Medium Priority (Orange)**: Emerging topics with 1-2 attempts and moderate progress
- **Low Priority (Green)**: Advanced topics for students with strong fundamentals

### 4. **Weekly Roadmap**
- Generates a ranked list of 7 topics optimized for the week
- Includes specific reasons for each recommendation
- Suggests specific actions (review, practice, challenge)

### 5. **Detailed Insights**
- Overall mastery statistics
- Progress by topic with attempt counts
- Identification of strongest and weakest areas
- Next steps and actionable recommendations

## Architecture

### Backend Components

#### 1. **Learning Path Generator** (`backend/utils/learningPathGenerator.js`)

**Key Functions:**

```javascript
calculateTopicMastery(attempts)
// Calculates mastery level for a topic based on quiz attempts
// Returns: { mastery, attemptCount, averageScore, recentTrend, confidence }

identifyAreasOfFocus(topicStats)
// Identifies weak, strong, and emerging areas
// Returns: { weakAreas, strongAreas, emergingAreas }

generateLearningPath(userId)
// Main function to generate personalized weekly roadmap
// Returns: Comprehensive learning path object with recommendations
```

**Mastery Formula:**
```
Mastery = (Weighted Recent Scores × 0.6) + (Average Confidence × 0.4)
```

#### 2. **API Endpoint** (`backend/routes/learningPath.js`)

**Endpoints:**

```
GET /api/learning-path
  - Authenticated: Yes (Student)
  - Returns: Personalized learning path for current user

GET /api/learning-path/:userId
  - Authenticated: Yes (Teacher/Admin can view student paths)
  - Returns: Learning path for specified student
```

### Frontend Components

#### 1. **Learning Path UI** (`frontend/src/components/Progress/LearningPath.js`)

**Features:**
- Statistics dashboard showing quiz count, average mastery, topics studied, improving topics
- Overall recommendation/insight display
- Weekly roadmap with expandable topic cards
- Mastery progress bars with color-coded difficulty
- Detailed topic performance table
- Next steps and actionable recommendations

**Props:** None (uses authenticated API)

#### 2. **Styling** (`frontend/src/components/Progress/LearningPath.css`)

- Responsive grid layout
- Color-coded priority levels (red, orange, green)
- Animated mastery bars and expandable cards
- Mobile-friendly design

## Data Flow

```
User Takes Quiz → QuizAttempt Saved → Learning Path Generated
         ↓
    Backend fetches all quiz attempts grouped by topic
         ↓
    Calculates mastery for each topic
         ↓
    Identifies weak/strong/emerging areas
         ↓
    Generates personalized recommendations
         ↓
    Frontend displays interactive roadmap
```

## Example Output

### For New Student (No Quiz History):
```json
{
  "type": "beginner_path",
  "message": "Welcome! Start with these foundational concepts...",
  "weeklyTopics": [
    {
      "title": "Atomic Structure",
      "topic": "Periodic Table",
      "difficulty": "Beginner",
      "priority": "high",
      "masteryLevel": 0
    }
    // ... more topics
  ]
}
```

### For Experienced Student (Quiz History):
```json
{
  "type": "personalized_path",
  "statistics": {
    "totalQuizzesTaken": 15,
    "averageMastery": 72,
    "topicsStudied": 5,
    "improvingTopics": 3,
    "strongestArea": "Organic Chemistry (85%)",
    "weakestArea": "Thermodynamics (45%)"
  },
  "weeklyTopics": [
    {
      "rank": 1,
      "title": "Entropy and Gibbs Free Energy",
      "topic": "Thermodynamics",
      "difficulty": "Intermediate",
      "priority": "high",
      "masteryLevel": 45,
      "reason": "Strengthen weak area: Thermodynamics (45% mastery)",
      "recommendedAction": "Review and practice"
    }
    // ... ranked by priority and mastery
  ],
  "overallRecommendation": "Focus on strengthening weak areas...",
  "nextSteps": [
    "Focus on improving: Thermodynamics",
    "Maintain momentum by practicing regularly"
  ]
}
```

## Integration Points

### Dashboard
- Added "Learning Path" menu item in student sidebar
- Accessible via `activeTab="learning-path"`
- Renders in StudentDashboard's renderContent()

### Navigation
- **Sidebar Item**: 📚 Learning Path (for students only)
- **Position**: Between "Concept Map" and "Remediation"

## Algorithm Details

### Mastery Calculation
1. **Collection**: Group all quiz attempts by topic
2. **Scoring**: For each topic, calculate weighted average:
   - Recent attempts (last 3) weighted 100%
   - Earlier attempts weighted down
3. **Confidence Boost**: Add student's self-rated confidence (1-5 scale)
4. **Final Score**: Combine recency-weighted score (60%) + confidence (40%)

### Trend Detection
- **Improving**: Recent average > earlier average + 5%
- **Declining**: Recent average < earlier average - 5%
- **Stable**: Otherwise

### Priority Assignment
- **High**: Mastery < 60% OR declining trend
- **Medium**: New topics (1-2 attempts) with 50-75% mastery
- **Low**: Topics where mastery >= 80% (for advancement)

### Recommendations
1. First: Identify weakest topics (high priority)
2. Second: Add emerging topics (medium priority)
3. Third: Add advanced topics from strong areas (low priority)
4. Limit to 7 topics per week for focus

## Usage

### For Students
1. Navigate to sidebar → **Learning Path**
2. View personalized statistics and overall insight
3. Review the ranked weekly roadmap
4. Click on a topic to expand details
5. Click action button to start learning that topic

### For Teachers/Admins
```bash
# View specific student's learning path
GET /api/learning-path/{studentId}
Authorization: Bearer {teacherToken}
```

## Response Times
- **First Request**: ~1-2 seconds (generates from scratch)
- **Subsequent Requests**: Cached/memoized where possible

## Performance Optimization
- Queries grouped by topic (reduces DB calls)
- Lazy loads related concepts
- Limits recommendations to 7 per week
- Efficient mastery calculation using reduce/map

## Future Enhancements
1. **ML-Based Predictions**: Use existing ML models to predict struggle topics
2. **Custom Roadmaps**: Allow teachers to customize recommendations
3. **Time-Based Learning**: Adjust recommendations based on available study time
4. **Prerequisite Chains**: Recommend topics in dependency order
5. **Spaced Repetition**: Track when topics were last attempted
6. **Group Analytics**: Teacher view of class-wide struggling topics

## Dependencies
- **Backend**: Express, Mongoose, QuizAttempt, Concept, UserProgress models
- **Frontend**: React, CSS3 (flexbox/grid), apiClient utility

## Debugging
Enable debug logs:
```javascript
// In generateLearningPath()
console.debug('Topic mastery calculated:', topicStats);
console.debug('Weak areas identified:', weakAreas);
```

## Testing
```bash
# Test endpoint
curl -X GET http://localhost:10000/api/learning-path \
  -H "Authorization: Bearer {token}"
```

Expected response: Personalized roadmap with weekly topics and statistics.
