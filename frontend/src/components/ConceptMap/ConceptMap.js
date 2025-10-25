import React, { useEffect, useRef, useState } from 'react';
import './ConceptMap.css';

// Controlled component; remove seed defaults to prevent static data persistence
const ConceptMap = ({ nodes: propNodes = [], links: propLinks = [], onChange }) => {
  const [nodes, setNodes] = useState(Array.isArray(propNodes) ? propNodes : []);
  const [links, setLinks] = useState(Array.isArray(propLinks) ? propLinks : []);
  const [draggedNode, setDraggedNode] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [linkFrom, setLinkFrom] = useState(null);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [selectedLinkIdx, setSelectedLinkIdx] = useState(null);
  const svgRef = useRef();

  // Keep local state in sync when parent props change
  useEffect(() => {
    setNodes(Array.isArray(propNodes) ? propNodes : []);
  }, [propNodes]);
  useEffect(() => {
    setLinks(Array.isArray(propLinks) ? propLinks : []);
  }, [propLinks]);

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
        <h2>Concept Map</h2>
        <p>Drag nodes to rearrange. Click two nodes to link them.</p>
        <button className="add-node-btn" onClick={addNode}>+ Add Concept</button>
        <button onClick={deleteSelected} disabled={selectedNodeId == null && selectedLinkIdx == null}>Delete Selected</button>
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
