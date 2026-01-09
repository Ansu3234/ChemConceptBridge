# 🧪 Gamification System - Testing Guide

## Quick Start Testing

### Prerequisites
1. Backend server running on `http://localhost:10000`
2. Frontend server running on `http://localhost:3000`
3. MongoDB database connected
4. Test user account (student role)

---

## Test Scenario 1: First Quiz Completion & Badge Unlock

### Steps:
1. **Login** as a student
2. **Navigate** to Dashboard → Quizzes tab
3. **Complete** a quiz with 85% score
4. **Check Response** - should include:
   ```json
   {
     "score": 85,
     "xpAwarded": 92,
     "newBadges": [
       {
         "id": "first_quiz",
         "name": "First Step",
         "icon": "🎯"
       }
     ]
   }
   ```
5. **Navigate** to Achievements tab
6. **Verify**:
   - ✅ XP increases
   - ✅ Level shows (should be ~1)
   - ✅ "First Step" badge appears
   - ✅ Badge displays unlock date

---

## Test Scenario 2: Earning Performance Badge

### Steps:
1. **Complete** 5 quizzes with 90%+ accuracy
2. **Complete** another quiz with 92% score
3. **Check Response** - should unlock:
   ```json
   {
     "newBadges": [
       {
         "id": "accuracy_master",
         "name": "Accuracy Master",
         "icon": "🎯"
       }
     ]
   }
   ```
4. **Navigate** to Achievements → Filter: Performance
5. **Verify** "Accuracy Master" appears in list

---

## Test Scenario 3: Leaderboard Functionality

### Steps:
1. **Create** at least 3 test student accounts
2. **Each student** completes quizzes with different scores
3. **Navigate** to Achievements tab
4. **Check** leaderboard section:
   - ✅ Top 20 students ranked by XP
   - ✅ Correct rank numbers (1, 2, 3...)
   - ✅ XP values display correctly
   - ✅ Level calculated correctly
   - ✅ Preview badges shown
   - ✅ Current user highlighted with "(You)" label

---

## Test Scenario 4: Badge Filtering

### Steps:
1. **Navigate** to Achievements tab
2. **Test** each filter button:
   - ✅ "All" - shows all earned badges
   - ✅ "Milestone" - shows only milestone badges
   - ✅ "Performance" - shows only performance badges
   - ✅ "Streak" - shows only streak badges
   - ✅ "Achievement" - shows only achievement badges

---

## Test Scenario 5: All Badges Discovery

### Steps:
1. **Scroll down** in Achievements page
2. **Find** "All Available Badges" section
3. **Verify**:
   - ✅ All 13 badges displayed
   - ✅ Earned badges show with full color/opacity
   - ✅ Locked badges show with 🔒 overlay and 0.3 opacity
   - ✅ Badge descriptions visible
   - ✅ XP rewards shown for each

---

## Test Scenario 6: Level Progression

### Steps:
1. **Complete** multiple quizzes to reach 100+ XP
2. **Check** Achievements page
3. **Verify**:
   - ✅ Level shows 2 (100 XP = Level 2)
   - ✅ Progress bar shows progression
   - ✅ Progress text shows "X% to next level"
   - ✅ After more quizzes, level increments

---

## Test Scenario 7: Personal Stats

### Steps:
1. **Navigate** to Achievements
2. **Verify** all stats display:
   - ✅ Current Level
   - ✅ Total XP
   - ✅ Leaderboard Rank (#X of total)
   - ✅ Quizzes Completed (counter)
   - ✅ Day Streak (fire emoji with number)
   - ✅ Average Quiz Score (percentage)

---

## API Endpoint Testing (cURL)

### 1. Get Gamification Stats
```bash
# Get your gamification data
curl -X GET http://localhost:10000/api/user/gamification \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json"

# Expected Response:
{
  "personal": {
    "xp": 500,
    "level": 5,
    "progressToNextLevel": 45,
    "badges": [...],
    "rank": 3,
    "totalPlayers": 45
  },
  "leaderboard": [...]
}
```

### 2. Get Badge Definitions
```bash
curl -X GET http://localhost:10000/api/user/badges/details \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"

# Expected Response:
{
  "badges": [
    {
      "id": "first_quiz",
      "name": "First Step",
      "description": "Completed your first quiz",
      "icon": "🎯",
      "category": "milestone",
      "xpReward": 25
    },
    ...
  ]
}
```

### 3. Submit Quiz with Gamification
```bash
curl -X POST http://localhost:10000/api/quiz/QUIZ_ID/attempt \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "answers": [
      {
        "questionId": "Q1",
        "selectedOption": 0,
        "timeSpent": 15
      }
    ],
    "timeSpent": 120,
    "confidenceLevel": 4
  }'

# Expected Response includes:
{
  "score": 85,
  "correct": 17,
  "total": 20,
  "xpAwarded": 92,
  "newBadges": [...]
}
```

---

## Browser Console Testing

### Check localStorage
```javascript
// View auth token
localStorage.getItem('token');

// View user info
localStorage.getItem('userName');

// Check API responses in Network tab
// All gamification requests should be to /api/user/gamification
```

### Monitor API Calls
1. Open DevTools → Network tab
2. Filter: XHR/Fetch
3. Complete a quiz
4. Check for:
   - `POST /api/quiz/{id}/attempt` - Should include `xpAwarded`
   - `GET /api/user/gamification` - Should return full stats

---

## Error Handling Tests

### 1. Unauthorized Access
```bash
# Try without token
curl -X GET http://localhost:10000/api/user/gamification

# Expected: 401 Unauthorized
```

### 2. Invalid Quiz
```bash
# Try submitting answers to non-existent quiz
curl -X POST http://localhost:10000/api/quiz/INVALID_ID/attempt \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"answers": [], "timeSpent": 0}'

# Expected: 404 Quiz not found
```

### 3. Malformed Request
```bash
# Missing required fields
curl -X POST http://localhost:10000/api/quiz/QUIZ_ID/attempt \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"timeSpent": 0}'

# Expected: 400 answers array is required
```

---

## Performance Testing

### Load Test Leaderboard
```bash
# Get leaderboard with 100+ players
for i in {1..100}; do
  curl -s "http://localhost:10000/api/user/gamification" \
    -H "Authorization: Bearer TOKEN" > /dev/null
done

# Should complete quickly (< 5 seconds for 100 requests)
# Check response time in DevTools Network tab
```

---

## Database Verification

### Check Gamification Records
```javascript
// MongoDB query
db.gamifications.find({}).pretty()

// Check specific user
db.gamifications.findOne({ user: ObjectId("USER_ID") })

// Verify badges array
db.gamifications.findOne({ 
  user: ObjectId("USER_ID") 
}).badges

// Count total students with gamification
db.gamifications.countDocuments({})
```

---

## Known Issues & Workarounds

### Issue: XP not updating in real-time
**Workaround**: Refresh Achievements page
```javascript
// Or force refresh
window.location.reload();
```

### Issue: Badge not appearing after unlock
**Check**:
1. Browser console for errors
2. Network tab for failed API requests
3. MongoDB for gamification record

### Issue: Leaderboard shows wrong ranks
**Fix**: Clear browser cache and localStorage
```javascript
localStorage.clear();
location.reload();
```

---

## Checklist for Full Testing

### Backend
- [ ] XP calculation correct for different difficulties
- [ ] Badges unlock when criteria met
- [ ] Level calculation accurate
- [ ] Leaderboard shows top 20 correctly
- [ ] No database errors in server logs
- [ ] Auth middleware properly protecting routes

### Frontend
- [ ] Achievements page loads without errors
- [ ] Personal stats display correctly
- [ ] Badge filtering works
- [ ] Leaderboard displays with correct sorting
- [ ] All badges section shows all 13 badges
- [ ] Responsive design on mobile/tablet

### Integration
- [ ] Quiz completion triggers gamification
- [ ] New badges appear immediately
- [ ] XP updates in real-time
- [ ] Leaderboard rank reflects current standing
- [ ] No console errors

---

## Success Criteria

✅ **System is ready when**:
1. Student completes quiz → XP awarded immediately
2. New badges unlock and appear automatically
3. Level increments every 100 XP
4. Leaderboard shows accurate rankings
5. All 13 badges display correctly
6. No console errors or warnings
7. All API endpoints respond correctly
8. Mobile/tablet experience is smooth

---

## Performance Benchmarks

| Metric | Target | Status |
|--------|--------|--------|
| Achievements page load | < 2s | ⏳ Test |
| XP update after quiz | < 1s | ⏳ Test |
| Leaderboard load | < 1s | ⏳ Test |
| Badge unlock response | < 500ms | ⏳ Test |
| Database query (top 20) | < 100ms | ⏳ Test |

---

## Test Data Script (Optional)

To quickly generate test data:

```javascript
// MongoDB script to add test gamification records
const baseXp = [100, 250, 500, 750, 1200, 1500];
const userIds = ['ID1', 'ID2', 'ID3', 'ID4', 'ID5', 'ID6'];

userIds.forEach((userId, idx) => {
  db.gamifications.insertOne({
    user: ObjectId(userId),
    xp: baseXp[idx],
    level: Math.floor(baseXp[idx] / 100) + 1,
    badges: [],
    totalQuizzesCompleted: Math.floor(Math.random() * 50) + 1,
    createdAt: new Date(),
    updatedAt: new Date()
  });
});
```

---

**Happy Testing! 🚀**
