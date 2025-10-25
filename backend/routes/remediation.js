const express = require('express');
const QuizAttempt = require('../models/QuizAttempt');
const Concept = require('../models/Concept');
const auth = require('../middleware/authMiddleware');

const router = express.Router();

// Enhanced rules mapping for common chemistry misconceptions to remediation content
const RULES = [
  // Acid-Base Misconceptions
  {
    category: 'acid-base',
    patterns: [
      /naoh\s*is\s*an\s*acid|naoh.*acid|sodium\s*hydroxide.*acid/i,
      /koh\s*is\s*an\s*acid|potassium\s*hydroxide.*acid/i,
      /ca\(oh\)2\s*is\s*an\s*acid|calcium\s*hydroxide.*acid/i
    ],
    misconception: 'Confusing strong bases with acids',
    severity: 'high',
    resources: [
      { type: 'video', title: 'Acids vs Bases Basics', url: 'https://www.youtube.com/watch?v=KZ8qf4m5YwI' },
      { type: 'article', title: 'Strong Bases: Why NaOH is Basic', url: 'https://chem.libretexts.org/Bookshelves/General_Chemistry' },
      { type: 'interactive', title: 'Acid-Base Classification Game', url: 'https://phet.colorado.edu/sims/html/acid-base-solutions/latest/acid-base-solutions_en.html' }
    ]
  },
  {
    category: 'acid-base',
    patterns: [
      /ph\s*scale.*confusion|ph.*basic.*acidic|ph.*neutral/i,
      /ph\s*below\s*7.*base|ph\s*above\s*7.*acid/i
    ],
    misconception: 'Misunderstanding pH scale direction',
    severity: 'medium',
    resources: [
      { type: 'animation', title: 'pH Scale Interactive', url: 'https://phet.colorado.edu/sims/html/ph-scale/latest/ph-scale_en.html' },
      { type: 'video', title: 'Understanding pH Scale', url: 'https://www.youtube.com/watch?v=2S6e11NBwiw' }
    ]
  },
  // Periodic Table Misconceptions
  {
    category: 'periodic-table',
    patterns: [
      /all\s*metals.*conduct|metals.*always.*conduct/i,
      /noble\s*gases.*reactive|helium.*reactive/i,
      /group\s*1.*alkaline\s*earth|alkali\s*metals.*group\s*2/i
    ],
    misconception: 'Confusing metal properties and periodic groups',
    severity: 'medium',
    resources: [
      { type: 'interactive', title: 'Periodic Table Explorer', url: 'https://phet.colorado.edu/sims/html/build-an-atom/latest/build-an-atom_en.html' },
      { type: 'video', title: 'Understanding Metal Properties', url: 'https://www.youtube.com/watch?v=0RRVV4Diomg' }
    ]
  },
  // Chemical Bonding Misconceptions
  {
    category: 'bonding',
    patterns: [
      /ionic\s*bonds.*share|covalent\s*bonds.*transfer/i,
      /single\s*bond.*stronger.*double|double\s*bond.*weaker/i,
      /metallic\s*bonding.*covalent/i
    ],
    misconception: 'Confusing different types of chemical bonds',
    severity: 'high',
    resources: [
      { type: 'animation', title: 'Chemical Bonding Types', url: 'https://phet.colorado.edu/sims/html/molecule-polarity/latest/molecule-polarity_en.html' },
      { type: 'video', title: 'Types of Chemical Bonds', url: 'https://www.youtube.com/watch?v=QXT4OVM4vXI' }
    ]
  },
  // Stoichiometry Misconceptions
  {
    category: 'stoichiometry',
    patterns: [
      /moles.*mass.*same|molar\s*mass.*moles/i,
      /limiting\s*reagent.*excess|excess.*limiting/i,
      /mole\s*ratio.*mass\s*ratio/i
    ],
    misconception: 'Confusing moles, mass, and ratios in stoichiometry',
    severity: 'high',
    resources: [
      { type: 'calculator', title: 'Stoichiometry Calculator', url: '/chemistry-calculator' },
      { type: 'video', title: 'Mole Calculations Made Easy', url: 'https://www.youtube.com/watch?v=9T7Ugct6VsY' }
    ]
  },
  // Thermodynamics Misconceptions
  {
    category: 'thermodynamics',
    patterns: [
      /exothermic.*heat.*absorbed|endothermic.*heat.*released/i,
      /entropy.*disorder.*decrease|entropy.*order.*increase/i,
      /gibbs\s*free\s*energy.*spontaneous.*positive/i
    ],
    misconception: 'Confusing thermodynamic concepts and energy changes',
    severity: 'medium',
    resources: [
      { type: 'simulation', title: 'Thermodynamics Simulator', url: 'https://phet.colorado.edu/sims/html/energy-forms-and-changes/latest/energy-forms-and-changes_en.html' },
      { type: 'video', title: 'Understanding Energy Changes', url: 'https://www.youtube.com/watch?v=5Y2X1jRAon0' }
    ]
  }
];

// Enhanced misconception detection function
function detectMisconceptions(userInput, questionContext = '') {
  const detectedMisconceptions = [];
  const inputText = (userInput + ' ' + questionContext).toLowerCase();
  
  RULES.forEach(rule => {
    rule.patterns.forEach(pattern => {
      if (pattern.test(inputText)) {
        detectedMisconceptions.push({
          category: rule.category,
          misconception: rule.misconception,
          severity: rule.severity,
          confidence: calculateConfidence(inputText, pattern),
          timestamp: new Date()
        });
      }
    });
  });
  
  return detectedMisconceptions;
}

// Calculate confidence score based on pattern match strength
function calculateConfidence(text, pattern) {
  const matches = text.match(pattern);
  if (!matches) return 0;
  
  // Higher confidence for exact matches and multiple keyword matches
  let confidence = 0.5;
  if (matches[0].length > 10) confidence += 0.2;
  if (text.split(' ').length > 5) confidence += 0.1;
  if (matches.length > 1) confidence += 0.2;
  
  return Math.min(confidence, 1.0);
}

router.post('/recommend', auth, async (req, res) => {
  try {
    const { attemptId } = req.body || {};
    if (!attemptId) return res.status(400).json({ message: 'attemptId is required' });

    const attempt = await QuizAttempt.findById(attemptId).populate('quiz', 'topic');
    if (!attempt || attempt.student.toString() !== req.user.id) {
      return res.status(404).json({ message: 'Attempt not found' });
    }

    const misconceptions = Array.isArray(attempt.misconceptions) ? attempt.misconceptions : [];
    const detectedMisconceptions = [];

    // Enhanced misconception detection from user answers
    attempt.answers.forEach(answer => {
      // Combine answer text with question context for better detection
      const answerText = String(answer.selectedOption || '');
      const context = attempt.quiz?.topic || '';
      const detected = detectMisconceptions(answerText, context);
      detectedMisconceptions.push(...detected);
    });

    // Combine with existing misconceptions
    const allMisconceptions = [...misconceptions, ...detectedMisconceptions];

    // Rule-based recommendations with enhanced categorization
    const recs = [];
    allMisconceptions.forEach(m => {
      const misconceptionText = typeof m === 'string' ? m : m.misconception;
      RULES.forEach(rule => {
        rule.patterns.forEach(pattern => {
          if (pattern.test(misconceptionText)) {
            rule.resources.forEach(r => recs.push({ 
              reason: misconceptionText,
              category: rule.category,
              severity: rule.severity,
              confidence: typeof m === 'object' ? m.confidence : 0.8,
              ...r 
            }));
          }
        });
      });
    });

    // Concept-based fallback: find concepts by topic
    if (attempt.quiz?.topic) {
      const concepts = await Concept.find({ topic: attempt.quiz.topic, status: 'approved', isActive: true })
        .select('title content.visualizations content.interactiveElements');
      concepts.slice(0, 3).forEach(c => {
        (c.content?.visualizations || []).forEach(u => recs.push({ 
          type: 'visualization', 
          title: c.title, 
          url: u,
          category: 'general',
          severity: 'low'
        }));
        (c.content?.interactiveElements || []).forEach(u => recs.push({ 
          type: 'interactive', 
          title: c.title, 
          url: u,
          category: 'general',
          severity: 'low'
        }));
      });
    }

    // De-duplicate by url and sort by severity
    const seen = new Set();
    const unique = recs.filter(r => (r.url ? (seen.has(r.url) ? false : (seen.add(r.url), true)) : true));
    
    // Sort by severity (high -> medium -> low) and confidence
    const sorted = unique.sort((a, b) => {
      const severityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
      const severityDiff = severityOrder[b.severity] - severityOrder[a.severity];
      if (severityDiff !== 0) return severityDiff;
      return (b.confidence || 0) - (a.confidence || 0);
    });

    // Update quiz attempt with detected misconceptions
    if (detectedMisconceptions.length > 0) {
      attempt.misconceptions = [...misconceptions, ...detectedMisconceptions.map(m => m.misconception)];
      await attempt.save();
    }

    res.json({ 
      recommendations: sorted.slice(0, 10),
      detectedMisconceptions: detectedMisconceptions.length,
      categories: [...new Set(sorted.map(r => r.category))],
      summary: {
        total: sorted.length,
        highSeverity: sorted.filter(r => r.severity === 'high').length,
        mediumSeverity: sorted.filter(r => r.severity === 'medium').length,
        lowSeverity: sorted.filter(r => r.severity === 'low').length
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Real-time misconception detection endpoint
router.post('/detect-misconceptions', auth, async (req, res) => {
  try {
    const { userInput, context = '', questionId = null } = req.body;
    
    if (!userInput) {
      return res.status(400).json({ message: 'userInput is required' });
    }

    const detected = detectMisconceptions(userInput, context);
    
    // Store detection for analytics (optional)
    if (detected.length > 0 && questionId) {
      // Could store in a separate misconceptions collection for analytics
      console.log(`Misconception detected for user ${req.user.id}:`, detected);
    }

    res.json({
      misconceptions: detected,
      count: detected.length,
      categories: [...new Set(detected.map(m => m.category))],
      severity: detected.reduce((acc, m) => {
        acc[m.severity] = (acc[m.severity] || 0) + 1;
        return acc;
      }, {})
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Analytics endpoint for misconception tracking
router.get('/analytics', auth, async (req, res) => {
  try {
    // Only admins and teachers can access analytics
    if (!['admin', 'teacher'].includes(req.user.role)) {
      return res.status(403).json({ message: 'Access denied' });
    }

    const { timeRange = '30d', category = 'all' } = req.query;
    
    // Get misconception data from quiz attempts
    const attempts = await QuizAttempt.find({
      completedAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      misconceptions: { $exists: true, $ne: [] }
    }).populate('quiz', 'topic');

    const analytics = {
      totalMisconceptions: 0,
      byCategory: {},
      bySeverity: {},
      byTopic: {},
      trends: [],
      topMisconceptions: []
    };

    // Process misconception data
    attempts.forEach(attempt => {
      const misconceptions = Array.isArray(attempt.misconceptions) ? attempt.misconceptions : [];
      misconceptions.forEach(misconception => {
        analytics.totalMisconceptions++;
        
        // Categorize misconceptions
        const detected = detectMisconceptions(misconception, attempt.quiz?.topic || '');
        detected.forEach(d => {
          analytics.byCategory[d.category] = (analytics.byCategory[d.category] || 0) + 1;
          analytics.bySeverity[d.severity] = (analytics.bySeverity[d.severity] || 0) + 1;
        });
        
        // Track by topic
        if (attempt.quiz?.topic) {
          analytics.byTopic[attempt.quiz.topic] = (analytics.byTopic[attempt.quiz.topic] || 0) + 1;
        }
      });
    });

    // Get top misconceptions
    const misconceptionCounts = {};
    attempts.forEach(attempt => {
      (attempt.misconceptions || []).forEach(m => {
        misconceptionCounts[m] = (misconceptionCounts[m] || 0) + 1;
      });
    });
    
    analytics.topMisconceptions = Object.entries(misconceptionCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([misconception, count]) => ({ misconception, count }));

    res.json(analytics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;


