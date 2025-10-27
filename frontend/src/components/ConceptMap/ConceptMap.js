import React, { useEffect, useMemo, useRef, useState } from 'react';
import './ConceptMap.css';

// Controlled component; remove seed defaults to prevent static data persistence
const DEFAULT_MAPS = {
  student: {
    nodes: [
      { id: 1, label: 'Overview', x: 80, y: 80 },
      { id: 2, label: 'Concepts', x: 280, y: 60 },
      { id: 3, label: 'Quizzes', x: 500, y: 120 },
      { id: 4, label: 'Progress', x: 120, y: 260 },
      { id: 5, label: 'Concept Map', x: 320, y: 220 },
      { id: 6, label: 'Remediation', x: 520, y: 260 },
      { id: 7, label: 'Leaderboard', x: 360, y: 360 },
      { id: 8, label: 'Performance', x: 160, y: 380 }
    ],
    links: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 2, to: 5 },
      { from: 3, to: 5 },
      { from: 5, to: 6 },
      { from: 4, to: 8 },
      { from: 6, to: 7 }
    ]
  },
  teacher: {
    nodes: [
      { id: 1, label: 'Overview', x: 80, y: 80 },
      { id: 2, label: 'Students', x: 280, y: 60 },
      { id: 3, label: 'Analytics', x: 500, y: 120 },
      { id: 4, label: 'Content', x: 120, y: 260 },
      { id: 5, label: 'Concept Library', x: 340, y: 200 },
      { id: 6, label: 'Concept Map', x: 520, y: 260 },
      { id: 7, label: 'Performance', x: 320, y: 360 },
      { id: 8, label: 'Quizzes', x: 140, y: 400 }
    ],
    links: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 4, to: 5 },
      { from: 5, to: 6 },
      { from: 3, to: 7 },
      { from: 2, to: 7 },
      { from: 4, to: 8 }
    ]
  },
  admin: {
    nodes: [
      { id: 1, label: 'Overview', x: 80, y: 80 },
      { id: 2, label: 'Analytics', x: 280, y: 60 },
      { id: 3, label: 'Users', x: 500, y: 120 },
      { id: 4, label: 'Concepts', x: 120, y: 260 },
      { id: 5, label: 'Quizzes', x: 320, y: 220 },
      { id: 6, label: 'Misconceptions', x: 520, y: 260 },
      { id: 7, label: 'Reports', x: 360, y: 360 },
      { id: 8, label: 'System', x: 160, y: 380 }
    ],
    links: [
      { from: 1, to: 2 },
      { from: 1, to: 3 },
      { from: 1, to: 4 },
      { from: 4, to: 5 },
      { from: 2, to: 6 },
      { from: 3, to: 6 },
      { from: 2, to: 7 },
      { from: 1, to: 8 }
    ]
  }
};

const ConceptMap = ({ nodes: propNodes = [], links: propLinks = [], onChange, role }) => {
  const defaultData = useMemo(() => {
    if (!role || !DEFAULT_MAPS[role]) return { nodes: [], links: [] };
    const source = DEFAULT_MAPS[role];
    return {
      nodes: source.nodes.map((item) => ({ ...item })),
      links: source.links.map((item) => ({ ...item }))
    };
  }, [role]);

  const [nodes, setNodes] = useState(() => {
    if (Array.isArray(propNodes) && propNodes.length) return propNodes;
    if (defaultData.nodes.length) return defaultData.nodes;
    return [];
  });
  const [links, setLinks] = useState(() => {
    if (Array.isArray(propLinks) && propLinks.length) return propLinks;
    if (defaultData.links.length) return defaultData.links;
    return [];
  });
  const [draggedNode, setDraggedNode] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [linkFrom, setLinkFrom] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedLinkIdx, setSelectedLinkIdx] = useState(null);
  const svgRef = useRef();
  const heading = role ? `${role.charAt(0).toUpperCase()}${role.slice(1)} Concept Map` : 'Concept Map';

  useEffect(() => {
    if (Array.isArray(propNodes) && propNodes.length) {
      setNodes(propNodes);
    } else if (!Array.isArray(propNodes) && defaultData.nodes.length) {
      setNodes(defaultData.nodes);
    } else if (Array.isArray(propNodes) && !propNodes.length && defaultData.nodes.length && nodes.length === 0) {
      setNodes(defaultData.nodes);
    }
  }, [propNodes, defaultData, nodes.length]);
  useEffect(() => {
    if (Array.isArray(propLinks) && propLinks.length) {
      setLinks(propLinks);
    } else if (!Array.isArray(propLinks) && defaultData.links.length) {
      setLinks(defaultData.links);
    } else if (Array.isArray(propLinks) && !propLinks.length && defaultData.links.length && links.length === 0) {
      setLinks(defaultData.links);
    }
  }, [propLinks, defaultData, links.length]);

  // Notify parent when state changes
  useEffect(() => {
    if (typeof onChange === 'function') onChange({ nodes, links });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, links]);

  const handleMouseDown = (e, node) => {
    setDraggedNode(node.id);
    setSelectedNodeId(node.id);
    setSelectedLinkIdx(null);
    setOffset({ x: e.clientX - node.x, y: e.clientY - node.y });
  };

  const handleMouseMove = (e) => {
    if (!draggedNode) return;
    setNodes((curr) => curr.map((n) => (
      n.id === draggedNode ? { ...n, x: e.clientX - offset.x, y: e.clientY - offset.y } : n
    )));
  };

  const handleMouseUp = () => setDraggedNode(null);

  const addNode = () => {
    const newId = nodes.length ? Math.max(...nodes.map(n => n.id)) + 1 : 1;
    setNodes([...nodes, { id: newId, label: `Concept ${newId}`, x: 200, y: 200 }]);
  };

  const handleNodeClick = (id) => {
    if (linkFrom === null) {
      setLinkFrom(id);
      setSelectedNodeId(id);
      setSelectedLinkIdx(null);
      return;
    }
    if (linkFrom !== id) {
      setLinks((curr) => [...curr, { from: linkFrom, to: id }]);
    }
    setLinkFrom(null);
  };

  const handleLinkClick = (idx) => {
    setSelectedLinkIdx(idx);
    setSelectedNodeId(null);
  };

  const deleteSelected = () => {
    if (selectedNodeId != null) {
      setLinks(links.filter(l => l.from !== selectedNodeId && l.to !== selectedNodeId));
      setNodes(nodes.filter(n => n.id !== selectedNodeId));
      setSelectedNodeId(null);
    } else if (selectedLinkIdx != null) {
      setLinks(links.filter((_, i) => i !== selectedLinkIdx));
      setSelectedLinkIdx(null);
    }
  };

  const renameNode = (id, label) => {
    setNodes(nodes.map(n => n.id === id ? { ...n, label } : n));
  };

  const resetToDefault = () => {
    if (!defaultData.nodes.length && !defaultData.links.length) {
      setNodes([]);
      setLinks([]);
      return;
    }
    setNodes(defaultData.nodes.map((item) => ({ ...item })));
    setLinks(defaultData.links.map((item) => ({ ...item })));
    setSelectedNodeId(null);
    setSelectedLinkIdx(null);
    setLinkFrom(null);
  };

  useEffect(() => {
    if (draggedNode) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggedNode, offset]);

  return (
    <div className="concept-map">
      <div className="concept-map-header">
        <h2>{heading}</h2>
        <p>Drag to rearrange, edit labels inline, select two nodes to connect them.</p>
        <button className="add-node-btn" onClick={addNode}>+ Add Concept</button>
        <button onClick={deleteSelected} disabled={selectedNodeId == null && selectedLinkIdx == null}>Delete Selected</button>
        <button onClick={resetToDefault}>Reset</button>
        {linkFrom && <span className="link-hint">Select another node to create a link</span>}
      </div>
      <div className="concept-map-content" style={{ height: 500, position: 'relative' }}>
        <svg ref={svgRef} width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
          {links.map((link, i) => {
            const from = nodes.find(n => n.id === link.from);
            const to = nodes.find(n => n.id === link.to);
            if (!from || !to) return null;
            return (
              <line
                key={`${link.from}-${link.to}-${i}`}
                x1={from.x + 60}
                y1={from.y + 30}
                x2={to.x + 60}
                y2={to.y + 30}
                stroke={selectedLinkIdx === i ? '#ef4444' : '#3b82f6'}
                strokeWidth={selectedLinkIdx === i ? 4 : 3}
                markerEnd="url(#arrowhead)"
                onClick={() => handleLinkClick(i)}
              />
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" markerUnits="strokeWidth">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
          </defs>
        </svg>
        {nodes.map((node) => (
          <div
            key={node.id}
            className={`concept-node${linkFrom === node.id ? ' linking' : ''}${selectedNodeId === node.id ? ' selected' : ''}`}
            style={{ left: node.x, top: node.y, position: 'absolute', zIndex: 1, cursor: 'grab' }}
            onMouseDown={(e) => handleMouseDown(e, node)}
            onClick={() => handleNodeClick(node.id)}
          >
            <input
              value={node.label}
              onChange={(e) => renameNode(node.id, e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                outline: 'none',
                width: 140,
                textAlign: 'center',
                fontWeight: 600
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConceptMap;
