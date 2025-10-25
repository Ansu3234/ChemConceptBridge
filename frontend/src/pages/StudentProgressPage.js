// frontend/src/pages/StudentProgressPage.js
// Teacher-only: shows one student's progress across the teacher's quizzes by aggregating quiz stats
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../apiClient';
import './StudentProgressPage.css';

const Row = ({ left, right }) => (
  <div className="sp-row"><span className="sp-left">{left}</span><span className="sp-right">{right}</span></div>
);

const StudentProgressPage = () => {
  const { studentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizzes, setQuizzes] = useState([]);
  const [statsByQuiz, setStatsByQuiz] = useState([]); // [{ quizId, quizTitle, stats }]

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        setLoading(true);
        setError('');
        // 1) Fetch all quizzes (public) then filter to teacher-owned on client
        const quizzesRes = await api.get('/quiz');
        const allQuizzes = quizzesRes.data || [];
        // Determine current teacher id from JWT
        const token = localStorage.getItem('token');
        const payload = token ? JSON.parse(atob(token.split('.')[1])) : null;
        const teacherId = payload?.id;
        const myQuizzes = allQuizzes.filter(q => (q.createdBy?._id || q.createdBy) === teacherId);
        // 2) Fetch stats for my quizzes
        const statsResponses = await Promise.all(
          myQuizzes.map(q => api.get(`/quiz/${q._id}/stats`).then(r => ({ quiz: q, stats: r.data })).catch(() => ({ quiz: q, stats: null })))
        );
        if (!mounted) return;
        setQuizzes(myQuizzes);
        setStatsByQuiz(statsResponses);
      } catch (e) {
        setError(e?.response?.data?.message || 'Failed to load student progress');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [studentId]);

  const aggregated = useMemo(() => {
    const attempts = [];
    let studentInfo = null;
    statsByQuiz.forEach(({ quiz, stats }) => {
      if (!stats) return;
      const perf = (stats.studentPerformance || []).filter(sp => (sp.student?._id || sp.student) === studentId);
      perf.forEach(sp => {
        attempts.push({
          quizId: quiz._id,
          quizTitle: quiz.title,
          score: sp.score,
          completedAt: sp.completedAt,
        });
        if (!studentInfo && sp.student) {
          studentInfo = { name: sp.student.name, email: sp.student.email };
        }
      });
    });
    const totalAttempts = attempts.length;
    const avgScore = totalAttempts ? (attempts.reduce((s, a) => s + a.score, 0) / totalAttempts) : 0;
    const lastAttempt = attempts.reduce((latest, a) => (!latest || new Date(a.completedAt) > new Date(latest)) ? a.completedAt : latest, null);
    attempts.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt));
    return { studentInfo, attempts, totalAttempts, avgScore, lastAttempt };
  }, [statsByQuiz, studentId]);

  if (loading) return <div className="sp-container"><div className="sp-loading">Loading student progress…</div></div>;
  if (error) return (
    <div className="sp-container">
      <div className="sp-error">{error}</div>
      <button className="sp-button" onClick={() => navigate(-1)}>Go Back</button>
    </div>
  );

  const { studentInfo, attempts, totalAttempts, avgScore, lastAttempt } = aggregated;

  return (
    <div className="sp-container">
      <div className="sp-header">
        <div>
          <h2 className="sp-title">Student Progress</h2>
          <div className="sp-subtitle">
            <span>{studentInfo?.name || 'Student'}</span>
            {studentInfo?.email && <span className="sp-muted"> • {studentInfo.email}</span>}
          </div>
        </div>
        <div className="sp-actions">
          <Link to="/teacher-dashboard" className="sp-button sp-button-secondary">Back to Dashboard</Link>
        </div>
      </div>

      <div className="sp-grid">
        <div className="sp-card">
          <Row left="Total Attempts" right={totalAttempts} />
          <Row left="Average Score" right={`${avgScore.toFixed(1)}%`} />
          <Row left="Last Attempt" right={lastAttempt ? new Date(lastAttempt).toLocaleString() : '—'} />
        </div>
      </div>

      <div className="sp-section">
        <h3 className="sp-section-title">Attempts</h3>
        {attempts.length ? (
          <div className="sp-card">
            <table className="sp-table">
              <thead>
                <tr>
                  <th>Quiz</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {attempts.map((a, i) => (
                  <tr key={i}>
                    <td>{a.quizTitle}</td>
                    <td>{a.score}%</td>
                    <td>{a.completedAt ? new Date(a.completedAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="sp-empty">No attempts found for this student on your quizzes.</div>
        )}
      </div>
    </div>
  );
};

export default StudentProgressPage;