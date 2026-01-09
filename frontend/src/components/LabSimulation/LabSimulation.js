import React, { useState, useRef, useEffect } from 'react';
import './LabSimulation.css';
import TutorialOverlay from './TutorialOverlay';

const LAB_EXPERIMENTS = [
  {
    id: 1,
    name: 'Acid-Base Neutralization',
    description: 'Observe how acids and bases neutralize each other in a classic reaction.',
    apparatus: ['Beaker', 'Acid Solution', 'Base Solution', 'Indicator'],
    steps: [
      'Pour acid solution into beaker',
      'Add indicator to change color',
      'Gradually add base solution',
      'Observe color change as reaction occurs',
      'Record pH changes'
    ],
    animation: 'neutralization',
    expectedResult: 'Color changes from red to colorless to blue as pH shifts',
    safetyPrecautions: 'Wear goggles and gloves. Handle chemicals carefully.',
    principles: 'Neutralization is a chemical reaction in which an acid and a base react quantitatively with each other. In a reaction in water, neutralization results in there being no excess of hydrogen or hydroxide ions present in the solution.'
  },
  {
    id: 2,
    name: 'Combustion Reaction',
    description: 'Explore exothermic combustion reactions with flame and heat generation.',
    apparatus: ['Burner', 'Fuel', 'Oxygen', 'Heat Source', 'Thermometer'],
    steps: [
      'Place fuel in combustion chamber',
      'Supply oxygen',
      'Apply heat source to ignite',
      'Observe flame and heat generation',
      'Measure temperature change'
    ],
    animation: 'combustion',
    expectedResult: 'Bright flame, heat release, temperature increase',
    safetyPrecautions: 'Keep away from flammable materials. Have fire extinguisher nearby.',
    principles: 'Combustion is a high-temperature exothermic redox chemical reaction between a fuel and an oxidant, usually atmospheric oxygen, that produces oxidized, often gaseous products, in a mixture termed as smoke.'
  },
  {
    id: 3,
    name: 'Crystallization',
    description: 'Watch crystals form as solutions evaporate and cool.',
    apparatus: ['Solution', 'Evaporating Dish', 'Heat', 'Magnifying Glass'],
    steps: [
      'Pour solution into evaporating dish',
      'Heat gently to evaporate solvent',
      'Allow to cool slowly',
      'Observe crystal formation',
      'Examine crystal structure'
    ],
    animation: 'crystallization',
    expectedResult: 'Beautiful crystal formation from saturated solution',
    safetyPrecautions: 'Do not touch hot equipment. Allow to cool before handling.',
    principles: 'Crystallization is the process by which a solid forms, where the atoms or molecules are highly organized into a structure known as a crystal. Some ways by which crystals form are precipitating from a solution, freezing, or more rarely direct deposition from a gas.'
  },
  {
    id: 4,
    name: 'Oxidation-Reduction',
    description: 'Observe electron transfer in redox reactions with color changes.',
    apparatus: ['Copper Sulfate', 'Iron Nail', 'Beaker', 'Solution'],
    steps: [
      'Place iron nail in copper sulfate solution',
      'Observe initial state',
      'Monitor color change over time',
      'Witness copper deposition on iron',
      'Record observations'
    ],
    animation: 'redox',
    expectedResult: 'Blue solution fades, copper coating forms on nail',
    safetyPrecautions: 'Avoid skin contact with chemical solutions.',
    principles: 'Redox is a type of chemical reaction in which the oxidation states of atoms are changed. Redox reactions are characterized by the actual or formal transfer of electrons between chemical species, most often with one species undergoing oxidation while another species undergoes reduction.'
  }
];

const LabSimulation = ({ externalExperiment = null, role = 'student', experimentId = null }) => {
  const [selectedExperiment, setSelectedExperiment] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [observations, setObservations] = useState('');
  const [advisorWarnings, setAdvisorWarnings] = useState([]);
  const canvasRef = useRef(null);
  const microCanvasRef = useRef(null);
  const [showMicroView, setShowMicroView] = useState(false);
  const [showTutorial, setShowTutorial] = useState(() => !localStorage.getItem('labTutorialSeen'));
  
  // Simulation State for Neutralization
  const [simState, setSimState] = useState({
    acidVolume: 0,
    baseVolume: 0,
    indicator: null,
    isStirring: false,
    dropsFalling: false,
    ph: 7.0,
    solutionColor: 'rgba(230, 240, 255, 0.3)', // Water-like initially
    temperature: 25,
    reactionComplete: false,
    totalVolume: 0
  });

  // UI / Advisor state (was missing causing eslint no-undef errors)
  const [advisorBlocking, setAdvisorBlocking] = useState(false);
  const [stepVerified, setStepVerified] = useState(false);
  const [stepFeedback, setStepFeedback] = useState('');

  const [acidVolume, setAcidVolume] = useState(0);
  const [indicatorChoice, setIndicatorChoice] = useState('');
  const [baseRate, setBaseRate] = useState(2);
  const [observedTransition, setObservedTransition] = useState('');
  const [pHReading, setPHReading] = useState('');
  const [guidedMode, setGuidedMode] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState(0);
  const [videoError, setVideoError] = useState(null);

  // Simple advisor ruleset (expandable)
  const ADVISOR_RULES = {
    neutralization: [
      { warn: 'Check PPE', suggest: 'Wear goggles and gloves', match: () => true },
      { warn: 'Acid volume range', suggest: 'Use 10–100 mL for titration', match: (ctx) => /acid/i.test(ctx.nextStepText) }
    ],
    combustion: [],
    crystallization: [],
    redox: []
  };

  // Keep UI fields and simState in sync where appropriate
  useEffect(() => {
    if (simState.acidVolume !== acidVolume) setAcidVolume(simState.acidVolume);
  }, [simState.acidVolume]);

  useEffect(() => {
    const v = Number(acidVolume) || 0;
    if (simState.acidVolume !== v) setSimState(prev => ({ ...prev, acidVolume: v, totalVolume: v + prev.baseVolume }));
  }, [acidVolume]);

  useEffect(() => {
    if (simState.indicator !== indicatorChoice) setIndicatorChoice(simState.indicator || '');
  }, [simState.indicator]);

  useEffect(() => {
    if (simState.indicator !== indicatorChoice) setSimState(prev => ({ ...prev, indicator: indicatorChoice }));
  }, [indicatorChoice]);

  const generateAdvisorWarnings = (experimentObj, nextStepIndex) => {
    const rules = ADVISOR_RULES[experimentObj.animation] || [];
    const nextStepText = experimentObj?.steps?.[nextStepIndex] || '';
    const ctx = { nextStepText };
    const warnings = rules
      .filter(r => !r.match || r.match(ctx))
      .map(r => ({ warn: r.warn, suggest: r.suggest }));
    return warnings;
  };

  const experiment = externalExperiment || LAB_EXPERIMENTS[selectedExperiment];

  useEffect(() => {
    let animationFrameId;

    const render = () => {
      if (isRunning && canvasRef.current) {
        drawAnimation(canvasRef.current, experiment.animation, currentStep);
        animationFrameId = requestAnimationFrame(render);
      }
    };

    if (isRunning) {
      render();
    } else if (canvasRef.current) {
      // Draw initial state even if not running
      drawAnimation(canvasRef.current, experiment.animation, currentStep);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isRunning, currentStep, experiment.animation]);

  const drawAnimation = (canvas, animationType, progress) => {
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, width, height);

    ctx.font = '16px Arial';
    ctx.fillStyle = '#333';

    switch (animationType) {
      case 'neutralization':
        drawNeutralization(ctx, width, height, progress);
        break;
      case 'combustion':
        drawCombustion(ctx, width, height, progress);
        break;
      case 'crystallization':
        drawCrystallization(ctx, width, height, progress);
        break;
      case 'redox':
        drawRedox(ctx, width, height, progress);
        break;
      default:
        ctx.fillText('Animation will display here', 20, 30);
    }
  };

  // Microscopic View — simple ion animation illustrating neutralization
  useEffect(() => {
    if (!showMicroView || selectedExperiment !== 0) return;
    const canvas = microCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;

    const ions = [];
    const acidCount = Math.min(50, Math.round(simState.acidVolume)); // H+
    const baseCount = Math.min(50, Math.round(simState.baseVolume)); // OH-

    for (let i = 0; i < acidCount; i++) {
      ions.push({ type: 'H', x: Math.random() * width, y: Math.random() * height, vx: (Math.random()-0.5)*0.8, vy: (Math.random()-0.5)*0.8, alive: true });
    }
    for (let i = 0; i < baseCount; i++) {
      ions.push({ type: 'OH', x: Math.random() * width, y: Math.random() * height, vx: (Math.random()-0.5)*0.8, vy: (Math.random()-0.5)*0.8, alive: true });
    }

    let raf;
    const step = () => {
      ctx.clearRect(0, 0, width, height);
      // Background tint reflects indicator color/pH qualitatively
      ctx.fillStyle = simState.solutionColor;
      ctx.fillRect(0, 0, width, height);

      // Pair-up reaction: when H+ and OH- get close, form H2O droplet
      for (let i = 0; i < ions.length; i++) {
        const a = ions[i];
        if (!a.alive || a.type !== 'H') continue;
        for (let j = 0; j < ions.length; j++) {
          const b = ions[j];
          if (!b.alive || b.type !== 'OH') continue;
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const d2 = dx*dx + dy*dy;
          if (d2 < 10*10) { // collision threshold
            a.alive = false;
            b.alive = false;
            // draw a small water droplet at midpoint
            const mx = (a.x + b.x)/2;
            const my = (a.y + b.y)/2;
            ctx.fillStyle = 'rgba(173, 216, 230, 0.8)';
            ctx.beginPath();
            ctx.arc(mx, my, 4, 0, Math.PI*2);
            ctx.fill();
            break;
          }
        }
      }

      // Move and draw remaining ions
      ions.forEach(p => {
        if (!p.alive) return;
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > width) p.vx *= -1;
        if (p.y < 0 || p.y > height) p.vy *= -1;
        ctx.fillStyle = p.type === 'H' ? '#ff4d4f' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI*2);
        ctx.fill();
      });

      // Legend
      ctx.fillStyle = '#0f172a';
      ctx.font = '12px Arial';
      ctx.fillText('H+ (red) + OH- (blue) → H2O (droplet)', 10, height - 10);

      raf = requestAnimationFrame(step);
    };

    step();
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [showMicroView, selectedExperiment, simState.acidVolume, simState.baseVolume, simState.solutionColor]);

  useEffect(() => {
    if (selectedExperiment === 0) {
      // Initialize Neutralization State
      setSimState(prev => ({ ...prev, ph: 1.0, solutionColor: 'rgba(255, 255, 255, 0.1)', acidVolume: 0, baseVolume: 0, totalVolume: 0 }));
    }
  }, [selectedExperiment]);

  // Physics & Chemistry Engine
  useEffect(() => {
    if (selectedExperiment !== 0) return; // Only for Neutralization

    // Calculate pH and Color based on volumes
    const acidMoles = simState.acidVolume * 0.1; // 0.1 M HCl
    const baseMoles = simState.baseVolume * 0.1; // 0.1 M NaOH
    const totalVol = simState.acidVolume + simState.baseVolume;
    
    let newPh = 7.0;
    if (totalVol > 0) {
      if (acidMoles > baseMoles) {
        const excessAcid = acidMoles - baseMoles;
        const concH = excessAcid / totalVol;
        newPh = -Math.log10(concH);
      } else if (baseMoles > acidMoles) {
        const excessBase = baseMoles - acidMoles;
        const concOH = excessBase / totalVol;
        const pOH = -Math.log10(concOH);
        newPh = 14 - pOH;
      } else {
        newPh = 7.0;
      }
    } else {
        newPh = 7.0; // Empty
    }

    // Clamp pH
    newPh = Math.max(0, Math.min(14, newPh));

    // Determine Color based on Indicator
    let color = 'rgba(240, 248, 255, 0.4)'; // Clear
    if (simState.indicator === 'phenolphthalein') {
      if (newPh < 8.2) color = 'rgba(255, 255, 255, 0.4)'; // Colorless
      else if (newPh >= 8.2 && newPh < 10) color = `rgba(255, 105, 180, ${(newPh - 8.2) / 1.8})`; // Pinkish
      else color = 'rgba(255, 20, 147, 0.8)'; // Deep Pink
    } else if (simState.indicator === 'universal') {
       if (newPh < 3) color = 'rgba(255, 0, 0, 0.6)';
       else if (newPh < 6) color = 'rgba(255, 165, 0, 0.6)';
       else if (newPh < 8) color = 'rgba(0, 255, 0, 0.6)';
       else if (newPh < 11) color = 'rgba(0, 0, 255, 0.6)';
       else color = 'rgba(128, 0, 128, 0.6)';
    }

    setSimState(prev => ({
      ...prev,
      ph: newPh,
      solutionColor: color,
      totalVolume: totalVol
    }));

  }, [simState.acidVolume, simState.baseVolume, simState.indicator]);


  const drawNeutralization = (ctx, width, height, progress) => {
    // Clear
    ctx.clearRect(0, 0, width, height);

    const centerX = width / 2;
    const centerY = height / 2 + 50;
    const scale = 1.0;

    // Draw Burette (Top)
    ctx.fillStyle = '#e0e0e0';
    ctx.strokeStyle = '#999';
    ctx.lineWidth = 2;
    ctx.fillRect(centerX - 10, centerY - 250, 20, 200); // Tube
    ctx.strokeRect(centerX - 10, centerY - 250, 20, 200);
    
    // Burette Liquid
    const buretteFill = Math.max(0, 50 - simState.baseVolume); // Assuming 50mL burette
    const buretteHeight = (buretteFill / 50) * 190;
    ctx.fillStyle = 'rgba(200, 230, 255, 0.5)';
    ctx.fillRect(centerX - 8, centerY - 248 + (190 - buretteHeight), 16, buretteHeight);

    // Valve
    ctx.fillStyle = '#555';
    ctx.fillRect(centerX - 15, centerY - 50, 30, 10);
    ctx.fillStyle = simState.dropsFalling ? '#27ae60' : '#c0392b'; // Green if open, Red if closed
    ctx.beginPath();
    ctx.arc(centerX, centerY - 45, 4, 0, Math.PI * 2);
    ctx.fill();

    // Falling Drops
    if (simState.dropsFalling) {
        ctx.fillStyle = 'rgba(200, 230, 255, 0.8)';
        const dropY = centerY - 40 + (Date.now() % 200) / 2; // Simple animation loop
        ctx.beginPath();
        ctx.arc(centerX, dropY, 3, 0, Math.PI * 2);
        ctx.fill();
    }

    // Beaker
    const beakerWidth = 120;
    const beakerHeight = 150;
    const beakerX = centerX - beakerWidth / 2;
    const beakerY = centerY;

    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(beakerX, beakerY); // Top Left
    ctx.lineTo(beakerX, beakerY + beakerHeight); // Bottom Left
    ctx.quadraticCurveTo(beakerX + beakerWidth/2, beakerY + beakerHeight + 10, beakerX + beakerWidth, beakerY + beakerHeight); // Bottom curve
    ctx.lineTo(beakerX + beakerWidth, beakerY); // Top Right
    ctx.stroke();

    // Beaker Liquid
    const liquidMaxHeight = 130;
    const liquidHeight = Math.min(liquidMaxHeight, (simState.totalVolume / 150) * liquidMaxHeight); // 150mL max visual
    
    if (liquidHeight > 0) {
        ctx.fillStyle = simState.solutionColor;
        const liquidTopY = beakerY + beakerHeight - liquidHeight;
        
        ctx.beginPath();
        ctx.moveTo(beakerX + 2, liquidTopY);
        ctx.lineTo(beakerX + 2, beakerY + beakerHeight - 2);
        ctx.quadraticCurveTo(centerX, beakerY + beakerHeight + 8, beakerX + beakerWidth - 2, beakerY + beakerHeight - 2);
        ctx.lineTo(beakerX + beakerWidth - 2, liquidTopY);
        ctx.lineTo(beakerX + 2, liquidTopY);
        ctx.fill();

        // Meniscus / Surface
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.beginPath();
        ctx.ellipse(centerX, liquidTopY, beakerWidth/2 - 2, 5, 0, 0, Math.PI * 2);
        ctx.fill();
    }

    // Beaker Labels/Graduations
    ctx.fillStyle = '#999';
    ctx.font = '10px Arial';
    for(let i=1; i<=4; i++) {
        const y = beakerY + beakerHeight - (i * 30);
        ctx.fillRect(beakerX + 10, y, 10, 1);
        ctx.fillText(`${i * 25}ml`, beakerX + 25, y + 3);
    }
  };

  const drawCombustion = (ctx, width, height, progress) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxSteps = LAB_EXPERIMENTS[selectedExperiment].steps.length - 1;
    const ratio = progress / maxSteps;

    // Draw Burner
    ctx.fillStyle = '#7f8c8d';
    ctx.fillRect(centerX - 20, centerY + 20, 40, 60);
    ctx.fillStyle = '#34495e';
    ctx.fillRect(centerX - 25, centerY + 70, 50, 10);

    if (progress > 0) {
      const flameIntensity = Math.sin(Date.now() * 0.005) * 0.2 + 0.8;
      const flameSize = 30 * ratio * flameIntensity;

      // Draw Flame
      const gradient = ctx.createRadialGradient(centerX, centerY + 10, 0, centerX, centerY + 10, flameSize);
      gradient.addColorStop(0, '#f1c40f');
      gradient.addColorStop(0.5, '#e67e22');
      gradient.addColorStop(1, 'rgba(231, 76, 60, 0)');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY + 10, flameSize, 0, Math.PI * 2);
      ctx.fill();

      // Heat waves
      ctx.strokeStyle = `rgba(231, 76, 60, ${0.3 * flameIntensity})`;
      ctx.lineWidth = 2;
      for (let i = 0; i < 3; i++) {
        const yOff = (Date.now() * 0.05 + i * 20) % 60;
        ctx.beginPath();
        ctx.moveTo(centerX - 30 + i * 30, centerY - yOff);
        ctx.quadraticCurveTo(centerX - 15 + i * 30, centerY - yOff - 10, centerX - 30 + i * 30, centerY - yOff - 20);
        ctx.stroke();
      }
    }

    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Bunsen Burner', centerX - 45, centerY + 100);
    
    const temp = 25 + (ratio * 150);
    ctx.fillStyle = temp > 100 ? '#e74c3c' : '#2c3e50';
    ctx.fillText(`Temperature: ${Math.round(temp)}°C`, centerX - 60, centerY - 80);
  };

  const drawCrystallization = (ctx, width, height, progress) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxSteps = LAB_EXPERIMENTS[selectedExperiment].steps.length - 1;
    const evaporation = Math.min(progress / maxSteps, 1);

    // Draw Evaporating Dish
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 60, 0, Math.PI, false);
    ctx.stroke();
    
    // Draw Solution
    if (evaporation < 1) {
      ctx.fillStyle = `rgba(52, 152, 219, ${0.6 * (1 - evaporation)})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 56, 0.2 * Math.PI, 0.8 * Math.PI, false);
      ctx.fill();
    }

    // Draw Crystals
    const crystalCount = Math.floor(evaporation * 40);
    ctx.fillStyle = '#ecf0f1';
    ctx.strokeStyle = '#3498db';
    ctx.lineWidth = 1;

    for (let i = 0; i < crystalCount; i++) {
      const angle = (i / 40) * Math.PI * 0.6 + 0.2 * Math.PI;
      const r = Math.random() * 50;
      const x = centerX + Math.cos(angle) * r;
      const y = centerY + Math.sin(angle) * r;
      const size = 3 + Math.random() * 5;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.random() * Math.PI);
      ctx.fillRect(-size/2, -size/2, size, size);
      ctx.strokeRect(-size/2, -size/2, size, size);
      ctx.restore();
    }

    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Evaporating Dish', centerX - 55, centerY + 40);
    ctx.fillText(`Saturation: ${Math.round(evaporation * 100)}%`, centerX - 50, centerY - 80);
  };

  const drawRedox = (ctx, width, height, progress) => {
    const centerX = width / 2;
    const centerY = height / 2;
    const maxSteps = LAB_EXPERIMENTS[selectedExperiment].steps.length - 1;
    const ratio = progress / maxSteps;

    // Draw Beaker
    ctx.strokeStyle = '#2c3e50';
    ctx.lineWidth = 3;
    ctx.strokeRect(centerX - 70, centerY - 50, 140, 120);

    // Draw Solution (Copper Sulfate - Blue to Greenish)
    const solutionBlue = 219 - (ratio * 100);
    const solutionGreen = 152 - (ratio * 50);
    ctx.fillStyle = `rgba(52, ${solutionGreen}, ${solutionBlue}, 0.5)`;
    ctx.fillRect(centerX - 67, centerY + 10, 134, 57);

    // Draw Iron Nail
    const nailColor = ratio > 0.5 ? '#d35400' : '#95a5a6';
    ctx.fillStyle = nailColor;
    ctx.fillRect(centerX - 8, centerY - 20, 16, 80);
    
    // Coating on nail
    if (ratio > 0) {
      ctx.fillStyle = `rgba(211, 84, 0, ${ratio})`;
      ctx.fillRect(centerX - 8, centerY + 10, 16, 50);
    }

    ctx.fillStyle = '#2c3e50';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Iron Nail in CuSO4', centerX - 60, centerY + 90);
    ctx.fillText(`Reaction Progress: ${Math.round(ratio * 100)}%`, centerX - 70, centerY - 70);
  };

  const startExperiment = () => {
    const warnings = generateAdvisorWarnings(experiment, 0);
    if (warnings.length) {
      setAdvisorWarnings(warnings);
      setAdvisorBlocking(false);
    }
    setIsRunning(true);
    setCurrentStep(0);
    setStepVerified(false);
    setStepFeedback('');
  };

  const runNextStep = () => {
    if (currentStep < experiment.steps.length - 1) {
      const nextIdx = currentStep + 1;
      const warnings = generateAdvisorWarnings(experiment, nextIdx);
      if (warnings.length) {
        setAdvisorWarnings(warnings);
        setAdvisorBlocking(false);
      }
      setCurrentStep(nextIdx);
      setStepVerified(false);
      setStepFeedback('');
    }
  };

  const resetExperiment = () => {
    setIsRunning(false);
    setCurrentStep(0);
    setObservations('');
    setAdvisorWarnings([]);
    setAdvisorBlocking(false);
    setStepVerified(false);
    setStepFeedback('');
    setAcidVolume(50);
    setIndicatorChoice('');
    setBaseRate(2);
    setObservedTransition('');
    setPHReading('');
  };

  const getGuidance = () => {
    const key = experiment.animation;
    const idx = currentStep;
    if (key === 'neutralization') {
      if (idx === 0) return { todo: 'Measure and pour acid into the beaker', mistakes: 'Avoid excessive volume that can dilute the endpoint', why: 'Volume affects titration sensitivity and endpoint clarity' };
      if (idx === 1) return { todo: 'Choose and add the correct indicator', mistakes: 'Skipping indicator prevents visible endpoint', why: 'Indicator reveals the equivalence point via color change' };
      if (idx === 2) return { todo: 'Add base slowly while stirring', mistakes: 'Fast addition overshoots neutralization', why: 'Controlled addition keeps pH near the target' };
      if (idx === 3) return { todo: 'Observe color transition while mixing', mistakes: 'Not mixing can cause local pH pockets', why: 'Uniform mixing ensures accurate visual endpoint' };
      if (idx === 4) return { todo: 'Record pH at stable reading', mistakes: 'Reading while stirring causes drift', why: 'Settled readings give reliable measurements' };
    }
    return { todo: 'Follow the procedure step carefully', mistakes: 'Avoid rushing or skipping details', why: 'Each step builds toward a safe, correct outcome' };
  };

  const verifyStep = () => {
    const idx = currentStep;
    const key = experiment.animation;
    if (key === 'neutralization') {
      if (idx === 0) {
        const v = Number(acidVolume);
        if (isNaN(v) || v < 10 || v > 100) {
          setStepFeedback('Choose a volume between 10–100 mL');
          setStepVerified(false);
          return;
        }
        setStepFeedback('Good. Proceed to add indicator.');
        setStepVerified(true);
        return;
      }
      if (idx === 1) {
        const ok = ['phenolphthalein', 'universal'].includes(indicatorChoice.toLowerCase());
        if (!ok) {
          setStepFeedback('Select phenolphthalein or universal indicator');
          setStepVerified(false);
          return;
        }
        setStepFeedback('Correct indicator selected.');
        setStepVerified(true);
        return;
      }
      if (idx === 2) {
        const r = Number(baseRate);
        if (isNaN(r) || r < 1 || r > 3) {
          setStepFeedback('Set drop rate between 1–3 drops/sec');
          setStepVerified(false);
          return;
        }
        setStepFeedback('Controlled addition rate selected.');
        setStepVerified(true);
        return;
      }
      if (idx === 3) {
        const t = observedTransition.toLowerCase();
        const ok = t.includes('red') && t.includes('colorless') && t.includes('blue');
        if (!ok) {
          setStepFeedback('Expected transition: Red → Colorless → Blue');
          setStepVerified(false);
          return;
        }
        setStepFeedback('Observation matches expected transition.');
        setStepVerified(true);
        return;
      }
      if (idx === 4) {
        const p = Number(pHReading);
        if (isNaN(p) || p < 6 || p > 8) {
          setStepFeedback('Enter a stable pH between 6.0 and 8.0');
          setStepVerified(false);
          return;
        }
        setStepFeedback('pH recorded in acceptable range.');
        setStepVerified(true);
        return;
      }
    }
    setStepFeedback('Step validated.');
    setStepVerified(true);
  };

  const handleControlAction = (action, value) => {
    if (action === 'pourAcid') {
        setSimState(prev => ({ ...prev, acidVolume: Math.min(100, prev.acidVolume + 10) }));
        if (currentStep === 0 && simState.acidVolume >= 20) {
             setStepFeedback('Great! You have enough acid.');
             setStepVerified(true);
        }
    }
    if (action === 'addIndicator') {
        setSimState(prev => ({ ...prev, indicator: value }));
        setStepFeedback(`${value} added.`);
        setStepVerified(true);
    }
    if (action === 'toggleBurette') {
        setSimState(prev => ({ ...prev, dropsFalling: !prev.dropsFalling }));
        if (!simState.dropsFalling) {
            // Start titration loop
            const interval = setInterval(() => {
                setSimState(prev => {
                    if (!prev.dropsFalling) {
                        clearInterval(interval);
                        return prev;
                    }
                    return { ...prev, baseVolume: prev.baseVolume + 0.5 };
                });
            }, 100);
        }
    }
    if (action === 'reset') {
        setSimState(prev => ({ ...prev, acidVolume: 0, baseVolume: 0, totalVolume: 0, ph: 7, dropsFalling: false, indicator: null }));
        setCurrentStep(0);
    }
  };

  const renderControls = () => {
    if (selectedExperiment !== 0 && !externalExperiment) return null; // Default controls for others

    // If user is not a student, show preview/read-only view
    if (role !== 'student') {
      return (
        <div className="interactive-controls readonly">
          <div style={{ padding: 12, border: '1px solid #eee', borderRadius: 6, background: '#fafafa' }}>
            <h4>Preview Mode</h4>
            <p>This is a preview of the experiment. Interactive controls are disabled for your role.</p>
            {role === 'admin' && experimentId && (
              <div style={{ marginTop: 8 }}>
                <a className="btn btn-primary" href={`/admin/experiments/${experimentId}/edit`}>Edit Experiment</a>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
        <div className="interactive-controls">
            <div className="control-group">
                <h4>🔬 Lab Controls</h4>
                {currentStep === 0 && (
                    <div className="control-panel">
                        <label>Acid Volume: {simState.acidVolume} mL</label>
                        <button className="btn-lab" onClick={() => handleControlAction('pourAcid')}>
                            +10mL Acid
                        </button>
                    </div>
                )}
                {currentStep === 1 && (
                    <div className="control-panel">
                         <label>Select Indicator:</label>
                         <div className="btn-row">
                            <button className={`btn-lab ${simState.indicator === 'phenolphthalein' ? 'active' : ''}`} onClick={() => handleControlAction('addIndicator', 'phenolphthalein')}>
                                Phenolphthalein
                            </button>
                            <button className={`btn-lab ${simState.indicator === 'universal' ? 'active' : ''}`} onClick={() => handleControlAction('addIndicator', 'universal')}>
                                Universal Indicator
                            </button>
                         </div>
                    </div>
                )}
                {currentStep >= 2 && (
                    <div className="control-panel">
                         <label>Burette Control (Base): {simState.baseVolume.toFixed(1)} mL added</label>
                         <button className={`btn-lab ${simState.dropsFalling ? 'danger' : 'success'}`} onClick={() => handleControlAction('toggleBurette')}>
                             {simState.dropsFalling ? 'Stop Titration' : 'Start Titration'}
                         </button>
                         <div className="ph-meter">
                            <span className="ph-label">pH Meter:</span>
                            <span className="ph-value" style={{ color: simState.ph < 7 ? 'red' : simState.ph > 7 ? 'blue' : 'green' }}>
                                {simState.ph.toFixed(2)}
                            </span>
                         </div>
                    </div>
                )}
            </div>
            <div className="mentor-note" style={{ marginTop: 12 }}>
              <p><strong>Coach Tip:</strong> {getGuidance().todo}. {getGuidance().why}</p>
            </div>
        </div>
    );
  };

  return (
    <div className="lab-simulation">
      {showTutorial && <TutorialOverlay onClose={() => setShowTutorial(false)} />}
      <div className="lab-header">
        <h2>Virtual Lab Simulation</h2>
        <p>Conduct safe, interactive chemistry experiments</p>
      </div>

      <div className="lab-container">
        <div className="experiment-selector">
          <h3>Select Experiment:</h3>
          <div className="exp-list">
            {LAB_EXPERIMENTS.map((exp, idx) => (
              <button
                key={exp.id}
                className={`exp-btn ${selectedExperiment === idx ? 'active' : ''}`}
                onClick={() => {
                  setSelectedExperiment(idx);
                  resetExperiment();
                }}
              >
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <img src={exp.thumbnail || 'https://via.placeholder.com/90x60?text=Lab'} alt={exp.name} style={{ width: 90, height: 60, objectFit: 'cover', borderRadius: 6 }} />
                  <div style={{ textAlign: 'left' }}>
                    <div className="exp-name">{exp.name}</div>
                    <div className="exp-short">{exp.description.substring(0, 60)}...</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="experiment-content">
          <div className="exp-header">
            <h3>{experiment.name}</h3>
            <p>{experiment.description}</p>
          </div>

          <div className="lab-intro" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 6px 0' }}>Learning objectives</h4>
              <p style={{ margin: 0, color: '#475569' }}>{experiment.principles || 'Understand the reaction and observe macroscopic changes corresponding to molecular events.'}</p>
              <div style={{ marginTop: 8 }}>
                <strong>Expected:</strong> <span style={{ color: '#374151' }}>{experiment.expectedResult}</span>
              </div>
            </div>
            <div style={{ width: 220, textAlign: 'right' }}>
              <div style={{ marginBottom: 8 }}>
                <label style={{ fontWeight: 700, color: '#374151' }}>Guided Mode</label>
                <div>
                  <button className="btn-secondary btn" onClick={() => setGuidedMode(g => !g)}>{guidedMode ? 'Turn Off' : 'Turn On'}</button>
                </div>
              </div>
              <div>
                <small style={{ color: '#64748b' }}>Follow step-by-step guidance when enabled.</small>
              </div>
            </div>
          </div>

          <div className="exp-apparatus">
            <h4>⚗️ Apparatus Required:</h4>
            <div className="apparatus-list">
              {experiment.apparatus.map((item, idx) => (
                <span key={idx} className="apparatus-item">{item}</span>
              ))}
            </div>
          </div>

          {experiment.videos && experiment.videos.length > 0 && (
            <div className="exp-videos" style={{ marginTop: 12 }}>
              <h4>🎬 Related Videos</h4>
              <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ minWidth: 220 }}>
                  {experiment.videos.map((v, i) => (
                    <div key={i} className={`video-item ${i === selectedVideo ? 'active' : ''}`} style={{ padding: 8, border: i === selectedVideo ? '1px solid #3b82f6' : '1px solid #e6e6e6', borderRadius: 6, marginBottom: 8, cursor: 'pointer' }} onClick={() => { setSelectedVideo(i); setVideoError(null); }}>
                      <strong style={{ fontSize: 13 }}>{v.title}</strong>
                      <div style={{ fontSize: 12, color: '#64748b' }}>{v.description}</div>
                    </div>
                  ))}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ border: '1px solid #e6e6e6', borderRadius: 6, padding: 8 }}>
                    <h5 style={{ marginTop: 0 }}>{(experiment.videos[selectedVideo] && experiment.videos[selectedVideo].title) || 'Video'}</h5>
                    {experiment.videos[selectedVideo] && (() => {
                      const v = experiment.videos[selectedVideo];
                      const isYouTube = v.type === 'youtube' || /youtube\.com|youtu\.be/.test(v.url);
                      if (isYouTube) {
                        // convert to embed
                        let embed = null;
                        try {
                          const u = new URL(v.url);
                          if (u.hostname.includes('youtube.com')) {
                            const vid = u.searchParams.get('v');
                            if (vid) embed = `https://www.youtube.com/embed/${vid}`;
                          } else if (u.hostname === 'youtu.be') {
                            const id = u.pathname.slice(1);
                            if (id) embed = `https://www.youtube.com/embed/${id}`;
                          }
                        } catch (e) {
                          embed = null;
                        }

                        return (
                          <div>
                            {embed ? (
                              <iframe title={v.title} src={embed} width="100%" height={360} frameBorder="0" allowFullScreen />
                            ) : (
                              <div style={{ color: 'crimson' }}>Invalid YouTube URL</div>
                            )}
                          </div>
                        );
                      }

                      return (
                        <div>
                          <video
                            key={v.url}
                            controls
                            style={{ width: '100%', maxHeight: 360, background: '#000' }}
                            onError={() => setVideoError('Unable to load video')}
                          >
                            <source src={v.url} type="video/mp4" />
                            Your browser does not support HTML5 video.
                          </video>
                          {videoError && <div style={{ color: 'crimson', marginTop: 8 }}>{videoError}</div>}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="exp-canvas-area">
            <div className="canvas-header">
              <span className="live-badge">LIVE SIMULATION</span>
              <span className="exp-progress">Progress: {Math.round((currentStep / (experiment.steps.length - 1)) * 100)}%</span>
              {experiment.animation === 'neutralization' && (
                <>
                <button className="btn btn-secondary" onClick={() => setShowMicroView(v => !v)}>
                  {showMicroView ? 'Hide Microscopic View' : 'Show Microscopic View'}
                </button>
                <button className="btn btn-secondary" style={{ marginLeft: 8 }} onClick={() => setGuidedMode(g => !g)}>
                  {guidedMode ? 'Guidance: ON' : 'Guidance: OFF'}
                </button>
                </>
              )}
            </div>
            <canvas
              ref={canvasRef}
              width={500}
              height={300}
              className="exp-canvas"
            />
            {experiment.animation === 'neutralization' && (
              <canvas
                ref={microCanvasRef}
                width={500}
                height={140}
                className="exp-canvas"
                style={{ display: showMicroView ? 'block' : 'none', marginTop: 12 }}
              />
            )}
            <div className="canvas-footer">
              <p>Interact with the simulation by following the procedure steps below.</p>
            </div>
            {renderControls()} 
          </div>

          <div className="exp-steps">
            <h4>📋 Procedure:</h4>
            <div className="steps-list">
              {experiment.steps.map((step, idx) => (
                <div
                  key={idx}
                  className={`step-item ${idx === currentStep ? 'active' : ''} ${idx < currentStep ? 'completed' : ''}`}
                >
                  <span className="step-number">{idx + 1}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%' }}>
                    <div style={{ flex: 1 }}>
                      <div className="step-text">{step}</div>
                      <div style={{ fontSize: 12, color: '#94a3b8' }}>{idx === currentStep ? 'This is the active step' : idx < currentStep ? 'Completed' : 'Pending'}</div>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="btn btn-secondary" onClick={() => { setCurrentStep(idx); if (!isRunning) setIsRunning(true); }}>Do</button>
                      {idx === currentStep && !isRunning && (
                        <button className="btn btn-primary" onClick={() => { setIsRunning(true); }}>Start</button>
                      )}
                      {idx === currentStep && isRunning && (
                        <button className="btn btn-secondary" onClick={() => { setIsRunning(false); }}>Pause</button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {guidedMode && (
            <div className="mentor-panel">
              <div className="mentor-header">
                <span className="mentor-icon">🎓</span>
                <strong>Student Mentor</strong>
                <span className="mentor-tag">Guided step</span>
              </div>
              <div className="mentor-guidance">
                <div className="mentor-box">
                  <h5>What to do now</h5>
                  <p>{getGuidance().todo}</p>
                </div>
                <div className="mentor-box warn">
                  <h5>Common mistakes</h5>
                  <p>{getGuidance().mistakes}</p>
                </div>
                <div className="mentor-box why">
                  <h5>Why this matters</h5>
                  <p>{getGuidance().why}</p>
                </div>
              </div>
              <div className="mentor-controls">
                {experiment.animation === 'neutralization' ? (
                    <div className="mentor-note">
                        <p>Use the <strong>Lab Controls</strong> above to interact with the experiment.</p>
                    </div>
                ) : (
                 <>
                {experiment.animation === 'neutralization' && currentStep === 0 && (
                  <div className="mentor-task">
                    <label>Acid volume (mL)</label>
                    <input type="number" value={acidVolume} onChange={(e) => setAcidVolume(e.target.value)} min={10} max={100} />
                  </div>
                )}
                {experiment.animation === 'neutralization' && currentStep === 1 && (
                  <div className="mentor-task">
                    <label>Indicator</label>
                    <select value={indicatorChoice} onChange={(e) => setIndicatorChoice(e.target.value)}>
                      <option value="">Select…</option>
                      <option value="phenolphthalein">Phenolphthalein</option>
                      <option value="universal">Universal indicator</option>
                      <option value="methyl orange">Methyl orange</option>
                    </select>
                  </div>
                )}
                {experiment.animation === 'neutralization' && currentStep === 2 && (
                  <div className="mentor-task">
                    <label>Base addition rate (drops/sec)</label>
                    <input type="range" min={1} max={5} step={1} value={baseRate} onChange={(e) => setBaseRate(e.target.value)} />
                    <span className="mentor-range-value">{baseRate}</span>
                  </div>
                )}
                {experiment.animation === 'neutralization' && currentStep === 3 && (
                  <div className="mentor-task">
                    <label>Observed transition</label>
                    <select value={observedTransition} onChange={(e) => setObservedTransition(e.target.value)}>
                      <option value="">Select…</option>
                      <option value="Red → Colorless → Blue">Red → Colorless → Blue</option>
                      <option value="Red → Redder">Red → Redder</option>
                      <option value="Colorless → Red">Colorless → Red</option>
                    </select>
                  </div>
                )}
                {experiment.animation === 'neutralization' && currentStep === 4 && (
                  <div className="mentor-task">
                    <label>pH reading</label>
                    <input type="number" step="0.1" value={pHReading} onChange={(e) => setPHReading(e.target.value)} />
                  </div>
                )}
                </>
                )}
              </div>
              <div className="mentor-actions">
                <button className="btn btn-secondary" onClick={verifyStep}>Check my step</button>
              </div>
              {stepFeedback && (
                <div className="mentor-feedback">{stepFeedback}</div>
              )}
            </div>
          )}

          <div className="scientific-principles">
            <h4>💡 Scientific Principles:</h4>
            <div className="principle-card">
              <p>{experiment.principles}</p>
            </div>
          </div>

          <div className="exp-info">
            <div className="info-box">
              <h4>✓ Expected Result:</h4>
              <p>{experiment.expectedResult}</p>
            </div>

            <div className="info-box danger">
              <h4>⚠️ Safety Precautions:</h4>
              <p>{experiment.safetyPrecautions}</p>
            </div>
          </div>

          <div className="obs-area">
            <h4>📝 Observations:</h4>
            <textarea
              value={observations}
              onChange={(e) => setObservations(e.target.value)}
              placeholder="Record your observations here..."
              className="obs-input"
            />
          </div>

          <div className="exp-controls">
            <button
              className="btn btn-primary"
              onClick={startExperiment}
              disabled={isRunning}
            >
              🚀 Start Experiment
            </button>
            <button
              className="btn btn-secondary"
              onClick={runNextStep}
              disabled={!isRunning || currentStep >= experiment.steps.length - 1 || (guidedMode && !stepVerified)}
            >
              ➡️ Next Step
            </button>
            <button
              className="btn btn-danger"
              onClick={resetExperiment}
            >
              🔄 Reset
            </button>

            {/* Student can save attempts to backend when running an external experiment */}
            {role === 'student' && experimentId && (
              <button className="btn btn-success" onClick={async () => {
                // Prepare payload
                try {
                  const payload = {
                    responses: { simState },
                    observations,
                    pHReadings: [simState.ph, Number(pHReading) || null],
                    startTime: new Date(),
                    endTime: new Date()
                  };
                  // Use fetch to avoid importing api client here; parent pages can override if needed
                  const token = localStorage.getItem('token');
                  const res = await fetch(`/api/experiments/${experimentId}/attempts`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      Authorization: token ? `Bearer ${token}` : ''
                    },
                    body: JSON.stringify(payload)
                  });
                  if (!res.ok) throw new Error('Save failed');
                  setStepFeedback('Attempt saved successfully.');
                } catch (err) {
                  console.error('Failed to save attempt', err);
                  setStepFeedback('Failed to save attempt.');
                }
              }}>💾 Save Attempt</button>
            )}
          </div>

          {advisorWarnings.length > 0 && (
            <div className={`advisor-panel ${advisorBlocking ? 'blocking' : ''}`}>
              <div className="advisor-header">
                <span className="advisor-icon">🧠</span>
                <strong>Virtual Lab Advisor</strong>
                <span className="advisor-tag">Pre-execution check</span>
              </div>
              <div className="advisor-list">
                {advisorWarnings.map((a, i) => (
                  <div key={i} className="advisor-item">
                    <div className="advisor-warn">⚠️ {a.warn}</div>
                    <div className="advisor-suggest">✅ {a.suggest}</div>
                  </div>
                ))}
              </div>
              <div className="advisor-actions">
                {advisorBlocking && (
                  <>
                    <button className="btn btn-secondary" onClick={() => setAdvisorBlocking(false)}>Apply suggestions</button>
                    <button className="btn btn-primary" onClick={() => {
                      if (!isRunning) setIsRunning(true);
                      setCurrentStep(Math.min(currentStep + 1, experiment.steps.length - 1));
                      setAdvisorWarnings([]);
                      setAdvisorBlocking(false);
                    }}>Proceed</button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LabSimulation;
