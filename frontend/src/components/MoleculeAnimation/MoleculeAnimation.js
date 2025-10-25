
import React, { useEffect, useLayoutEffect, useState, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import './MoleculeAnimation.css';

// Molecule data
const MOLECULES = [
  {
    name: 'Water',
    formula: 'H₂O',
    atoms: [
      { element: 'O', x: 0, y: 0, z: 0, color: '#FF0000' },
      { element: 'H', x: -0.8, y: -0.5, z: 0, color: '#FFFFFF' },
      { element: 'H', x: 0.8, y: -0.5, z: 0, color: '#FFFFFF' }
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 }
    ],
    description: 'A polar molecule with bent geometry. Essential for life.',
    properties: ['Polar', 'Bent geometry', 'Hydrogen bonding']
  },
  {
    name: 'Carbon Dioxide',
    formula: 'CO₂',
    atoms: [
      { element: 'C', x: 0, y: 0, z: 0, color: '#808080' },
      { element: 'O', x: 1.2, y: 0, z: 0, color: '#FF0000' },
      { element: 'O', x: -1.2, y: 0, z: 0, color: '#FF0000' }
    ],
    bonds: [
      { from: 0, to: 1, double: true },
      { from: 0, to: 2, double: true }
    ],
    description: 'Linear molecule, greenhouse gas, product of combustion.',
    properties: ['Linear geometry', 'Non-polar', 'Greenhouse gas']
  },
  {
    name: 'Methane',
    formula: 'CH₄',
    atoms: [
      { element: 'C', x: 0, y: 0, z: 0, color: '#808080' },
      { element: 'H', x: 0.6, y: 0.6, z: 0.6, color: '#FFFFFF' },
      { element: 'H', x: -0.6, y: -0.6, z: 0.6, color: '#FFFFFF' },
      { element: 'H', x: 0.6, y: -0.6, z: -0.6, color: '#FFFFFF' },
      { element: 'H', x: -0.6, y: 0.6, z: -0.6, color: '#FFFFFF' }
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 },
      { from: 0, to: 4 }
    ],
    description: 'Tetrahedral geometry, simplest alkane, natural gas component.',
    properties: ['Tetrahedral', 'Non-polar', 'Alkane']
  },
  {
    name: 'Ammonia',
    formula: 'NH₃',
    atoms: [
      { element: 'N', x: 0, y: 0, z: 0, color: '#3050F8' },
      { element: 'H', x: 0.5, y: 0.5, z: 0.5, color: '#FFFFFF' },
      { element: 'H', x: -0.5, y: 0.5, z: -0.5, color: '#FFFFFF' },
      { element: 'H', x: 0, y: -0.7, z: 0, color: '#FFFFFF' }
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 0, to: 2 },
      { from: 0, to: 3 }
    ],
    description: 'Trigonal pyramidal geometry, weak base, important in fertilizers.',
    properties: ['Trigonal pyramidal', 'Polar', 'Weak base']
  },
  {
    name: 'Ethanol',
    formula: 'C₂H₅OH',
    atoms: [
      { element: 'C', x: 0, y: 0, z: 0, color: '#808080' },
      { element: 'C', x: 1.2, y: 0, z: 0, color: '#808080' },
      { element: 'O', x: 2.2, y: 0.8, z: 0, color: '#FF0000' },
      { element: 'H', x: -0.4, y: 1, z: 0, color: '#FFFFFF' },
      { element: 'H', x: -0.4, y: -0.5, z: 0.9, color: '#FFFFFF' },
      { element: 'H', x: -0.4, y: -0.5, z: -0.9, color: '#FFFFFF' },
      { element: 'H', x: 1.6, y: -1, z: 0, color: '#FFFFFF' },
      { element: 'H', x: 1.6, y: 0.5, z: -0.9, color: '#FFFFFF' },
      { element: 'H', x: 2.8, y: 0.3, z: 0.5, color: '#FFFFFF' }
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 0, to: 3 },
      { from: 0, to: 4 },
      { from: 0, to: 5 },
      { from: 1, to: 6 },
      { from: 1, to: 7 },
      { from: 2, to: 8 }
    ],
    description: 'Alcohol with hydroxyl group, used in beverages and fuel.',
    properties: ['Alcohol', 'Polar', 'Hydroxyl group']
  },
  {
    name: 'Benzene',
    formula: 'C₆H₆',
    atoms: [
      { element: 'C', x: 0, y: 1.2, z: 0, color: '#808080' },
      { element: 'C', x: 1.04, y: 0.6, z: 0, color: '#808080' },
      { element: 'C', x: 1.04, y: -0.6, z: 0, color: '#808080' },
      { element: 'C', x: 0, y: -1.2, z: 0, color: '#808080' },
      { element: 'C', x: -1.04, y: -0.6, z: 0, color: '#808080' },
      { element: 'C', x: -1.04, y: 0.6, z: 0, color: '#808080' },
      { element: 'H', x: 0, y: 2.1, z: 0, color: '#FFFFFF' },
      { element: 'H', x: 1.82, y: 1.05, z: 0, color: '#FFFFFF' },
      { element: 'H', x: 1.82, y: -1.05, z: 0, color: '#FFFFFF' },
      { element: 'H', x: 0, y: -2.1, z: 0, color: '#FFFFFF' },
      { element: 'H', x: -1.82, y: -1.05, z: 0, color: '#FFFFFF' },
      { element: 'H', x: -1.82, y: 1.05, z: 0, color: '#FFFFFF' }
    ],
    bonds: [
      { from: 0, to: 1 },
      { from: 1, to: 2 },
      { from: 2, to: 3 },
      { from: 3, to: 4 },
      { from: 4, to: 5 },
      { from: 5, to: 0 },
      { from: 0, to: 6 },
      { from: 1, to: 7 },
      { from: 2, to: 8 },
      { from: 3, to: 9 },
      { from: 4, to: 10 },
      { from: 5, to: 11 }
    ],
    description: 'Aromatic hydrocarbon with a ring structure, found in many organic compounds.',
    properties: ['Aromatic', 'Planar', 'Resonance structure']
  }
];

// Three.js-based molecule visualization component
const MoleculeAnimation = () => {
  const [selected, setSelected] = useState(0);
  const [isRotating, setIsRotating] = useState(true);
  const [viewStyle, setViewStyle] = useState('stick');
  
  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const moleculeGroupRef = useRef(null);
  const animationFrameRef = useRef(null);

  // Get current molecule
  const molecule = MOLECULES[selected];

  // Get atom radius based on element and view style
  const getAtomRadius = (element, style) => {
    if (style === 'sphere') {
      return element === 'H' ? 0.15 : 0.25;
    } else if (style === 'ball_stick') {
      return element === 'H' ? 0.1 : 0.15;
    } else {
      return element === 'H' ? 0.05 : 0.08;
    }
  };

  // Build or rebuild the molecule in the scene
  const buildMolecule = () => {
    if (!moleculeGroupRef.current || !sceneRef.current) return;

    // Clear previous molecule
    while (moleculeGroupRef.current.children.length > 0) {
      const object = moleculeGroupRef.current.children[0];
      if (object.geometry) object.geometry.dispose();
      if (object.material) {
        if (Array.isArray(object.material)) {
          object.material.forEach(material => material.dispose());
        } else {
          object.material.dispose();
        }
      }
      moleculeGroupRef.current.remove(object);
    }

    // Create atoms
    molecule.atoms.forEach((atom) => {
      const radius = getAtomRadius(atom.element, viewStyle);
      const segments = 32;
      const geometry = new THREE.SphereGeometry(radius, segments, segments);
      const material = new THREE.MeshPhongMaterial({ 
        color: new THREE.Color(atom.color),
        shininess: 100
      });
      const sphere = new THREE.Mesh(geometry, material);
      sphere.position.set(atom.x, atom.y, atom.z);
      moleculeGroupRef.current.add(sphere);

      // Add label for larger atoms in ball_stick or sphere mode
      if ((viewStyle === 'ball_stick' || viewStyle === 'sphere') && atom.element !== 'H') {
        const canvas = document.createElement('canvas');
        canvas.width = 64;
        canvas.height = 64;
        const context = canvas.getContext('2d');
        context.fillStyle = 'black';
        context.font = 'Bold 32px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(atom.element, 32, 32);
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(labelMaterial);
        sprite.position.set(atom.x, atom.y, atom.z);
        sprite.scale.set(0.3, 0.3, 0.3);
        moleculeGroupRef.current.add(sprite);
      }
    });

    // Create bonds
    molecule.bonds.forEach(bond => {
      const fromAtom = molecule.atoms[bond.from];
      const toAtom = molecule.atoms[bond.to];
      const start = new THREE.Vector3(fromAtom.x, fromAtom.y, fromAtom.z);
      const end = new THREE.Vector3(toAtom.x, toAtom.y, toAtom.z);
      const direction = new THREE.Vector3().subVectors(end, start);
      const length = direction.length();
      const bondRadius = viewStyle === 'stick' ? 0.05 : 0.02;
      const cylinderGeometry = new THREE.CylinderGeometry(bondRadius, bondRadius, length, 8);
      const cylinderMaterial = new THREE.MeshPhongMaterial({ color: 0x444444 });
      const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
      cylinder.position.copy(start);
      cylinder.position.lerp(end, 0.5);
      cylinder.quaternion.setFromUnitVectors(
        new THREE.Vector3(0, 1, 0),
        direction.clone().normalize()
      );
      moleculeGroupRef.current.add(cylinder);

      if (bond.double) {
        const offset = new THREE.Vector3().crossVectors(
          direction.clone().normalize(),
          new THREE.Vector3(0, 1, 0)
        ).normalize().multiplyScalar(0.05);
        const secondCylinder = cylinder.clone();
        secondCylinder.position.add(offset);
        moleculeGroupRef.current.add(secondCylinder);
      }
    });

    // Center the molecule
    moleculeGroupRef.current.position.set(0, 0, 0);
  };

  // Initialize Three.js scene
  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Determine initial size with fallbacks (avoid zero-height/width)
    const rect = container.getBoundingClientRect();
    const initWidth = Math.max(1, Math.floor(rect.width || container.clientWidth || container.offsetWidth || 500));
    const initHeight = Math.max(1, Math.floor(rect.height || container.clientHeight || container.offsetHeight || 400));

    // Create scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Create camera with safe aspect
    const camera = new THREE.PerspectiveCamera(
      75,
      initWidth / initHeight,
      0.1,
      1000
    );
    camera.position.z = 5;
    cameraRef.current = camera;

    // Create renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(window.devicePixelRatio || 1);
    renderer.setSize(initWidth, initHeight);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Create controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.rotateSpeed = 0.5;
    controlsRef.current = controls;
    controls.autoRotate = isRotating;

    // Add lights
    const ambientLight = new THREE.AmbientLight(0x404040, 1);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Create molecule group
    const moleculeGroup = new THREE.Group();
    scene.add(moleculeGroup);
    moleculeGroupRef.current = moleculeGroup;

    // Add axes helper to ensure something is visible for debugging
    const axes = new THREE.AxesHelper(1.5);
    scene.add(axes);

    // Add a subtle grid to aid visibility
    const grid = new THREE.GridHelper(6, 12, 0x888888, 0xcccccc);
    grid.position.y = -2.5;
    scene.add(grid);

    // Handle window resize
    const handleResize = () => {
      const container = containerRef.current;
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const rect = container.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width || container.clientWidth || container.offsetWidth || 500));
      const height = Math.max(1, Math.floor(rect.height || container.clientHeight || container.offsetHeight || 400));
      cameraRef.current.aspect = width / height;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
    
    // Use ResizeObserver to detect when container becomes visible
    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && containerRef.current.clientWidth > 0 && containerRef.current.clientHeight > 0) {
        handleResize();
        // Force a re-render of the scene
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
      }
    });
    
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    // Animation loop
    const animate = () => {
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    // Build initial molecule once scene is ready
    buildMolecule();

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver.disconnect();
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      const container = containerRef.current;
      if (rendererRef.current && container && rendererRef.current.domElement.parentNode === container) {
        container.removeChild(rendererRef.current.domElement);
      }
      if (controlsRef.current) {
        controlsRef.current.dispose();
      }
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
    };
  }, []);

  // Handle auto-rotation
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.autoRotate = isRotating;
    }
  }, [isRotating]);

  // Toggle rotation
  const toggleRotation = () => {
    setIsRotating(!isRotating);
    
    if (controlsRef.current) {
      controlsRef.current.autoRotate = !isRotating;
    }
  };

  // Rebuild molecule when selection or view style changes
  useEffect(() => {
    buildMolecule();
  }, [selected, viewStyle]);

  return (
    <div className="molecule-animation">
      <div className="ma-header">
        <h2>3D Molecule Viewer</h2>
        <p>Explore interactive 3D molecular structures</p>
      </div>
      
      <div className="ma-content">
        <div className="molecule-selector">
          <label htmlFor="mol-select">Select Molecule:</label>
          <select 
            id="mol-select" 
            value={selected} 
            onChange={e => setSelected(Number(e.target.value))}
            className="molecule-select"
          >
            {MOLECULES.map((mol, idx) => (
              <option value={idx} key={mol.name}>
                {mol.name} ({mol.formula})
              </option>
            ))}
          </select>
        </div>

        <div className="molecule-display">
          <div className="molecule-info">
            <h3>{molecule.name}</h3>
            <div className="formula">{molecule.formula}</div>
            <p className="description">{molecule.description}</p>
            
            <div className="properties">
              <h4>Properties:</h4>
              <div className="property-tags">
                {molecule.properties.map((prop, idx) => (
                  <span key={idx} className="property-tag">{prop}</span>
                ))}
              </div>
            </div>
            
            <div className="view-controls">
              <h4>View Controls:</h4>
              <div className="control-buttons">
                <button 
                  className={`view-btn ${viewStyle === 'stick' ? 'active' : ''}`}
                  onClick={() => setViewStyle('stick')}
                >
                  Stick
                </button>
                <button 
                  className={`view-btn ${viewStyle === 'sphere' ? 'active' : ''}`}
                  onClick={() => setViewStyle('sphere')}
                >
                  Space Fill
                </button>
                <button 
                  className={`view-btn ${viewStyle === 'ball_stick' ? 'active' : ''}`}
                  onClick={() => setViewStyle('ball_stick')}
                >
                  Ball & Stick
                </button>
                <button 
                  className={`view-btn ${isRotating ? 'active' : ''}`}
                  onClick={toggleRotation}
                >
                  {isRotating ? 'Stop Rotation' : 'Start Rotation'}
                </button>
              </div>
              <div className="interaction-tip">
                <p><strong>Tip:</strong> Click and drag to rotate. Scroll to zoom.</p>
              </div>
            </div>
          </div>

          <div 
            className="molecule-visualization" 
            ref={containerRef}
            style={{ width: '100%', height: '400px' }}
          >
            {/* Three.js will render here */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MoleculeAnimation;