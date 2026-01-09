import React, { useState, useEffect, useMemo } from 'react';
import api from '../../apiClient';
import './KnowledgeGraphVisualizer.css';

const KnowledgeGraphVisualizer = () => {
  const [concepts, setConcepts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConcept, setSelectedConcept] = useState(null);
  const [filterTopic, setFilterTopic] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('');
  const [filterBoard, setFilterBoard] = useState('');
  const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'list'
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(null);
  const [graphNodes, setGraphNodes] = useState([]);
  const [graphLinks, setGraphLinks] = useState([]);

  useEffect(() => {
    loadConcepts();
  }, []);

  useEffect(() => {
    if (concepts.length > 0) {
      buildGraph();
    }
  }, [concepts, filterTopic, filterDifficulty, filterBoard]);

  const loadConcepts = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/concept');
      
      // The API already populates prerequisites and relatedConcepts with title
      // For full details, we can fetch individual concepts if needed, but for graph
      // we can work with the populated data
      const conceptsWithRelations = (data || []).map((concept) => {
        // Convert populated prerequisites and relatedConcepts to full objects
        const prereqs = Array.isArray(concept.prerequisites) 
          ? concept.prerequisites.map(p => typeof p === 'object' ? p : { _id: p, title: 'Unknown' })
          : [];
        
        const related = Array.isArray(concept.relatedConcepts)
          ? concept.relatedConcepts.map(r => typeof r === 'object' ? r : { _id: r, title: 'Unknown' })
          : [];

        return {
          ...concept,
          prerequisitesDetails: prereqs,
          relatedConceptsDetails: related
        };
      });
      
      setConcepts(conceptsWithRelations);
    } catch (error) {
      console.error('Error loading concepts:', error);
      setConcepts([]);
    } finally {
      setLoading(false);
    }
  };

  const buildGraph = () => {
    const filtered = concepts.filter(c => {
      if (filterTopic && c.topic?.toLowerCase() !== filterTopic.toLowerCase()) return false;
      if (filterDifficulty && c.difficulty !== filterDifficulty) return false;
      if (filterBoard && c.syllabus?.board !== filterBoard) return false;
      return true;
    });

    const nodeMap = new Map();
    const links = [];
    let nodeId = 1;

    // Create nodes
    filtered.forEach(concept => {
      if (!nodeMap.has(concept._id)) {
        nodeMap.set(concept._id, {
          id: nodeId++,
          conceptId: concept._id,
          label: concept.title,
          topic: concept.topic,
          difficulty: concept.difficulty,
          board: concept.syllabus?.board || 'NCERT',
          unit: concept.syllabus?.unit || '',
          chapter: concept.syllabus?.chapter || '',
          x: Math.random() * 800 + 100,
          y: Math.random() * 600 + 100,
          concept: concept
        });
      }
    });

    // Create links for prerequisites and related concepts
    filtered.forEach(concept => {
      const sourceNode = nodeMap.get(concept._id);
      if (!sourceNode) return;

      // Prerequisites (dependencies)
      (concept.prerequisitesDetails || []).forEach(prereq => {
        const targetNode = nodeMap.get(prereq._id);
        if (targetNode) {
          links.push({
            from: sourceNode.id,
            to: targetNode.id,
            type: 'prerequisite',
            label: 'requires'
          });
        }
      });

      // Related concepts
      (concept.relatedConceptsDetails || []).forEach(related => {
        const targetNode = nodeMap.get(related._id);
        if (targetNode && !links.some(l => 
          (l.from === sourceNode.id && l.to === targetNode.id) ||
          (l.from === targetNode.id && l.to === sourceNode.id)
        )) {
          links.push({
            from: sourceNode.id,
            to: targetNode.id,
            type: 'related',
            label: 'related to'
          });
        }
      });
    });

    // Layout nodes in a hierarchical structure
    const nodes = Array.from(nodeMap.values());
    layoutNodes(nodes, links);

    setGraphNodes(nodes);
    setGraphLinks(links);
  };

  const layoutNodes = (nodes, links) => {
    // Simple force-directed layout
    const iterations = 100;
    const k = Math.sqrt((800 * 600) / nodes.length);
    
    for (let iter = 0; iter < iterations; iter++) {
      nodes.forEach(node => {
        let fx = 0, fy = 0;

        // Repulsion from other nodes
        nodes.forEach(other => {
          if (node.id === other.id) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = k * k / dist;
          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
        });

        // Attraction along links
        links.forEach(link => {
          if (link.from === node.id) {
            const target = nodes.find(n => n.id === link.to);
            if (target) {
              const dx = target.x - node.x;
              const dy = target.y - node.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              fx += (dx / dist) * dist / k;
              fy += (dy / dist) * dist / k;
            }
          } else if (link.to === node.id) {
            const source = nodes.find(n => n.id === link.from);
            if (source) {
              const dx = source.x - node.x;
              const dy = source.y - node.y;
              const dist = Math.sqrt(dx * dx + dy * dy) || 1;
              fx += (dx / dist) * dist / k;
              fy += (dy / dist) * dist / k;
            }
          }
        });

        node.x += fx * 0.1;
        node.y += fy * 0.1;
        
        // Keep within bounds
        node.x = Math.max(50, Math.min(750, node.x));
        node.y = Math.max(50, Math.min(550, node.y));
      });
    }
  };

  const handleNodeClick = (node) => {
    setSelectedConcept(node.concept);
  };

  const handleMouseDown = (e, node) => {
    if (e.button === 0) {
      setDragging({ node, startX: e.clientX - pan.x, startY: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e) => {
    if (dragging) {
      setPan({
        x: e.clientX - dragging.startX,
        y: e.clientY - dragging.startY
      });
    }
  };

  const handleMouseUp = () => {
    setDragging(null);
  };

  const uniqueTopics = useMemo(() => {
    return [...new Set(concepts.map(c => c.topic).filter(Boolean))].sort();
  }, [concepts]);

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return '#16a34a';
      case 'Intermediate': return '#d97706';
      case 'Advanced': return '#dc2626';
      default: return '#64748b';
    }
  };

  const getNodeColor = (node) => {
    return getDifficultyColor(node.difficulty);
  };

  const renderGraphView = () => {
    return (
      <div 
        className="graph-container"
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          className="knowledge-graph-svg"
          viewBox="0 0 800 600"
          style={{ transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})` }}
        >
          {/* Render links */}
          {graphLinks.map((link, idx) => {
            const fromNode = graphNodes.find(n => n.id === link.from);
            const toNode = graphNodes.find(n => n.id === link.to);
            if (!fromNode || !toNode) return null;

            const isPrerequisite = link.type === 'prerequisite';
            return (
              <g key={idx}>
                <line
                  x1={fromNode.x}
                  y1={fromNode.y}
                  x2={toNode.x}
                  y2={toNode.y}
                  stroke={isPrerequisite ? '#dc2626' : '#3b82f6'}
                  strokeWidth={isPrerequisite ? 2 : 1}
                  strokeDasharray={isPrerequisite ? '5,5' : 'none'}
                  markerEnd={isPrerequisite ? 'url(#arrowhead-prereq)' : 'url(#arrowhead-related)'}
                />
                {link.label && (
                  <text
                    x={(fromNode.x + toNode.x) / 2}
                    y={(fromNode.y + toNode.y) / 2 - 5}
                    fontSize="10"
                    fill="#64748b"
                    textAnchor="middle"
                  >
                    {link.label}
                  </text>
                )}
              </g>
            );
          })}

          {/* Arrow markers */}
          <defs>
            <marker
              id="arrowhead-prereq"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#dc2626" />
            </marker>
            <marker
              id="arrowhead-related"
              markerWidth="10"
              markerHeight="10"
              refX="9"
              refY="3"
              orient="auto"
            >
              <polygon points="0 0, 10 3, 0 6" fill="#3b82f6" />
            </marker>
          </defs>

          {/* Render nodes */}
          {graphNodes.map(node => (
            <g
              key={node.id}
              className="graph-node"
              onClick={() => handleNodeClick(node)}
              onMouseDown={(e) => handleMouseDown(e, node)}
              style={{ cursor: 'pointer' }}
            >
              <circle
                cx={node.x}
                cy={node.y}
                r={20}
                fill={getNodeColor(node)}
                stroke={selectedConcept?._id === node.conceptId ? '#1e293b' : '#fff'}
                strokeWidth={selectedConcept?._id === node.conceptId ? 3 : 1}
              />
              <text
                x={node.x}
                y={node.y + 35}
                fontSize="11"
                fill="#1e293b"
                textAnchor="middle"
                fontWeight="500"
              >
                {node.label.length > 15 ? node.label.substring(0, 15) + '...' : node.label}
              </text>
            </g>
          ))}
        </svg>
      </div>
    );
  };

  const renderListView = () => {
    const filtered = concepts.filter(c => {
      if (filterTopic && c.topic?.toLowerCase() !== filterTopic.toLowerCase()) return false;
      if (filterDifficulty && c.difficulty !== filterDifficulty) return false;
      if (filterBoard && c.syllabus?.board !== filterBoard) return false;
      return true;
    });

    return (
      <div className="concepts-list-view">
        {filtered.map(concept => (
          <div
            key={concept._id}
            className={`concept-card ${selectedConcept?._id === concept._id ? 'selected' : ''}`}
            onClick={() => setSelectedConcept(concept)}
          >
            <div className="concept-card-header">
              <h3>{concept.title}</h3>
              <span
                className="difficulty-badge"
                style={{ color: getDifficultyColor(concept.difficulty) }}
              >
                {concept.difficulty}
              </span>
            </div>
            <p className="concept-description">{concept.description}</p>
            <div className="concept-meta">
              <span className="meta-item">📚 {concept.topic}</span>
              {concept.syllabus?.board && (
                <span className="meta-item">📋 {concept.syllabus.board}</span>
              )}
              {concept.syllabus?.unit && (
                <span className="meta-item">📖 Unit: {concept.syllabus.unit}</span>
              )}
              {concept.syllabus?.chapter && (
                <span className="meta-item">📄 Chapter: {concept.syllabus.chapter}</span>
              )}
            </div>
            {(concept.prerequisitesDetails?.length > 0 || concept.relatedConceptsDetails?.length > 0) && (
              <div className="concept-relationships">
                {concept.prerequisitesDetails?.length > 0 && (
                  <div className="relationship-group">
                    <strong>Prerequisites:</strong>
                    {concept.prerequisitesDetails.map(p => (
                      <span key={p._id} className="relationship-tag prerequisite">
                        {p.title}
                      </span>
                    ))}
                  </div>
                )}
                {concept.relatedConceptsDetails?.length > 0 && (
                  <div className="relationship-group">
                    <strong>Related:</strong>
                    {concept.relatedConceptsDetails.map(r => (
                      <span key={r._id} className="relationship-tag related">
                        {r.title}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="knowledge-graph-container">
        <div className="loading-state">Loading knowledge graph...</div>
      </div>
    );
  }

  return (
    <div className="knowledge-graph-container">
      <div className="kg-header">
        <div className="header-content">
          <h1>🧠 Knowledge Graph & Concept Map Visualizer</h1>
          <p>Explore relationships between concepts and curriculum dependencies</p>
        </div>
        <button
          className="back-btn"
          onClick={() => {
            const event = new CustomEvent('navigate-to-tab', { detail: { tab: 'overview' } });
            window.dispatchEvent(event);
          }}
        >
          ← Back to Dashboard
        </button>
      </div>

      <div className="kg-controls">
        <div className="filters">
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="filter-select"
          >
            <option value="">All Topics</option>
            {uniqueTopics.map(topic => (
              <option key={topic} value={topic}>{topic}</option>
            ))}
          </select>

          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="filter-select"
          >
            <option value="">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>

          <select
            value={filterBoard}
            onChange={(e) => setFilterBoard(e.target.value)}
            className="filter-select"
          >
            <option value="">All Boards</option>
            <option value="NCERT">NCERT</option>
            <option value="NEET">NEET</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="view-controls">
          <button
            className={`view-btn ${viewMode === 'graph' ? 'active' : ''}`}
            onClick={() => setViewMode('graph')}
          >
            📊 Graph View
          </button>
          <button
            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
            onClick={() => setViewMode('list')}
          >
            📋 List View
          </button>
        </div>

        {viewMode === 'graph' && (
          <div className="zoom-controls">
            <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}>−</button>
            <span>{Math.round(zoom * 100)}%</span>
            <button onClick={() => setZoom(Math.min(2, zoom + 0.1))}>+</button>
            <button onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }); }}>Reset</button>
          </div>
        )}
      </div>

      <div className="kg-content">
        <div className={`kg-main ${viewMode === 'graph' ? 'graph-mode' : 'list-mode'}`}>
          {viewMode === 'graph' ? renderGraphView() : renderListView()}
        </div>

        {selectedConcept && (
          <div className="kg-sidebar">
            <div className="concept-details">
              <button className="close-details" onClick={() => setSelectedConcept(null)}>×</button>
              <h2>{selectedConcept.title}</h2>
              <p className="concept-topic">📚 {selectedConcept.topic}</p>
              <p className="concept-description-full">{selectedConcept.description}</p>
              
              <div className="detail-section">
                <h3>Difficulty</h3>
                <span
                  className="difficulty-badge"
                  style={{ color: getDifficultyColor(selectedConcept.difficulty) }}
                >
                  {selectedConcept.difficulty}
                </span>
              </div>

              {selectedConcept.syllabus && (
                <div className="detail-section">
                  <h3>Curriculum Information</h3>
                  <div className="curriculum-info">
                    <p><strong>Board:</strong> {selectedConcept.syllabus.board || 'NCERT'}</p>
                    {selectedConcept.syllabus.unit && (
                      <p><strong>Unit:</strong> {selectedConcept.syllabus.unit}</p>
                    )}
                    {selectedConcept.syllabus.chapter && (
                      <p><strong>Chapter:</strong> {selectedConcept.syllabus.chapter}</p>
                    )}
                    {selectedConcept.syllabus.topicPath?.length > 0 && (
                      <p><strong>Path:</strong> {selectedConcept.syllabus.topicPath.join(' → ')}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedConcept.prerequisitesDetails?.length > 0 && (
                <div className="detail-section">
                  <h3>Prerequisites (Dependencies)</h3>
                  <ul className="relationship-list">
                    {selectedConcept.prerequisitesDetails.map(prereq => (
                      <li key={prereq._id} className="prerequisite-item">
                        <span onClick={() => setSelectedConcept(prereq)} style={{ cursor: 'pointer', color: '#dc2626' }}>
                          {prereq.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedConcept.relatedConceptsDetails?.length > 0 && (
                <div className="detail-section">
                  <h3>Related Concepts</h3>
                  <ul className="relationship-list">
                    {selectedConcept.relatedConceptsDetails.map(related => (
                      <li key={related._id} className="related-item">
                        <span onClick={() => setSelectedConcept(related)} style={{ cursor: 'pointer', color: '#3b82f6' }}>
                          {related.title}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="detail-actions">
                <button
                  className="action-btn primary"
                  onClick={() => {
                    const event = new CustomEvent('navigate-to-tab', { 
                      detail: { tab: 'concepts', topic: selectedConcept.topic } 
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  View Study Notes
                </button>
                <button
                  className="action-btn secondary"
                  onClick={() => {
                    const event = new CustomEvent('navigate-to-tab', { 
                      detail: { tab: 'quizzes', topic: selectedConcept.topic } 
                    });
                    window.dispatchEvent(event);
                  }}
                >
                  Take Quiz
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="kg-legend">
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#dc2626' }}></div>
          <span>Prerequisite (Dependency)</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#3b82f6' }}></div>
          <span>Related Concept</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#16a34a' }}></div>
          <span>Beginner</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#d97706' }}></div>
          <span>Intermediate</span>
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{ background: '#dc2626' }}></div>
          <span>Advanced</span>
        </div>
      </div>
    </div>
  );
};

export default KnowledgeGraphVisualizer;

