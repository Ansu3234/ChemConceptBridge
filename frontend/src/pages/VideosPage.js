import React, { useEffect, useState } from 'react';

const toYouTubeEmbed = (url) => {
  try {
    const u = new URL(url);
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v');
      if (v) return `https://www.youtube.com/embed/${v}`;
    }
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
  } catch (e) {
    return null;
  }
  return null;
};

export default function VideosPage() {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/experiments', {
          headers: { Authorization: token ? `Bearer ${token}` : '' }
        });
        if (!res.ok) throw new Error('Failed to fetch');
        const data = await res.json();
        if (!mounted) return;
        const agg = [];
        data.forEach(exp => {
          (exp.videos || []).forEach((v, i) => {
            agg.push({ experimentId: exp._id || exp.id, experimentTitle: exp.title || exp.name, video: v, index: i, embed: toYouTubeEmbed(v.url) });
          });
        });
        setVideos(agg);
      } catch (err) {
        console.error('Videos load failed', err);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  if (loading) return <div className="p-6">Loading videos…</div>;

  return (
    <div className="p-6">
      <h2>All Experiment Videos</h2>
      {videos.length === 0 && <p>No videos found.</p>}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 16 }}>
        <div>
          {videos.map((v, idx) => (
            <div key={idx} style={{ border: '1px solid #eee', padding: 12, marginBottom: 10, borderRadius: 6 }}>
              <div style={{ fontWeight: 700 }}>{v.video.title}</div>
              <div style={{ fontSize: 13, color: '#6b7280' }}>{v.experimentTitle}</div>
              <div style={{ marginTop: 8 }}>{v.video.description}</div>
              <div style={{ marginTop: 8 }}>
                {v.embed ? (
                  <iframe title={v.video.title} src={v.embed} width="100%" height="220" frameBorder="0" allowFullScreen />
                ) : (
                  <video controls style={{ width: '100%' }}>
                    <source src={v.video.url} />
                    Your browser does not support HTML5 video.
                  </video>
                )}
              </div>
            </div>
          ))}
        </div>
        <aside style={{ border: '1px solid #f1f5f9', padding: 12, borderRadius: 6 }}>
          <h4>Tips</h4>
          <ul>
            <li>Use the embedded player to watch YouTube videos.</li>
            <li>Local MP4s will play in the browser using the HTML5 player.</li>
          </ul>
        </aside>
      </div>
    </div>
  );
}
