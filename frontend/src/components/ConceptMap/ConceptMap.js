import React, { useRef, useState } from 'react';
import './ConceptMap.css';

const initialNodes = [
  { id: 1, label: 'Atomic Structure', x: 120, y: 120 },
  { id: 2, label: 'Bonding', x: 350, y: 120 },
  { id: 3, label: 'Acids & Bases', x: 220, y: 300 },
  { id: 4, label: 'pH', x: 420, y: 300 },
];
const initialLinks = [
  { from: 1, to: 2 },
  { from: 2, to: 3 },
  { from: 3, to: 4 },
];

const ConceptMap = () => {
  const [nodes, setNodes] = useState(initialNodes);
  const [links, setLinks] = useState(initialLinks);
  const [draggedNode, setDraggedNode] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef();

  // Drag logic
  const handleMouseDown = (e, node) => {
    setDraggedNode(node.id);
    setOffset({
      x: e.clientX - node.x,
      y: e.clientY - node.y
    });
  };
  const handleMouseMove = (e) => {
    if (draggedNode) {
      setNodes(nodes => nodes.map(n =>
        n.id === draggedNode ? { ...n, x: e.clientX - offset.x, y: e.clientY - offset.y } : n
      ));
    }
  };
  const handleMouseUp = () => setDraggedNode(null);

  // Add new node
  const addNode = () => {
    const newId = nodes.length + 1;
    setNodes([...nodes, { id: newId, label: `Concept ${newId}`, x: 200, y: 200 }]);
  };

  // Add new link
  const [linkFrom, setLinkFrom] = useState(null);
  const handleNodeClick = (id) => {
    if (linkFrom === null) {
      setLinkFrom(id);
    } else if (linkFrom !== id) {
      setLinks([...links, { from: linkFrom, to: id }]);
      setLinkFrom(null);
    } else {
      setLinkFrom(null);
    }
  };

  React.useEffect(() => {
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
  });

  return (
    <div className="concept-map">
      <div className="concept-map-header">
        <h2>Concept Map</h2>
        <p>Drag nodes to rearrange. Click two nodes to link them.</p>
        <button className="add-node-btn" onClick={addNode}>+ Add Concept</button>
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
                key={i}
                x1={from.x + 60}
                y1={from.y + 30}
                x2={to.x + 60}
                y2={to.y + 30}
                stroke="#3b82f6"
                strokeWidth={3}
                markerEnd="url(#arrowhead)"
              />
            );
          })}
          <defs>
            <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto" markerUnits="strokeWidth">
              <polygon points="0 0, 10 3.5, 0 7" fill="#3b82f6" />
            </marker>
          </defs>
        </svg>
        {nodes.map(node => (
          <div
            key={node.id}
            className={`concept-node${linkFrom === node.id ? ' linking' : ''}`}
            style={{ left: node.x, top: node.y, position: 'absolute', zIndex: 1, cursor: 'grab' }}
            onMouseDown={e => handleMouseDown(e, node)}
            onClick={() => handleNodeClick(node.id)}
          >
            {node.label}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConceptMap;
