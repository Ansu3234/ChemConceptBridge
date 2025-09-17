import React, { useState } from 'react';
import './ConfidenceMeter.css';

const ConfidenceMeter = ({ onSubmit }) => {
  const [confidence, setConfidence] = useState(0);
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setConfidence(Number(e.target.value));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    if (onSubmit) onSubmit(confidence);
  };

  return (
    <div className="confidence-meter">
      <h2>Confidence Meter</h2>
      <p>How confident are you about this topic?</p>
      <form onSubmit={handleSubmit}>
        <div className="slider-container">
          <input
            type="range"
            min="0"
            max="100"
            value={confidence}
            onChange={handleChange}
            className="slider"
          />
          <div className="confidence-labels">
            <span>Not Confident</span>
            <span>Very Confident</span>
          </div>
        </div>
        <div className="confidence-value">{confidence}%</div>
        <button className="submit-btn" type="submit" disabled={submitted}>
          {submitted ? 'Submitted' : 'Submit Confidence'}
        </button>
      </form>
      {submitted && (
        <div className="thank-you">Thank you for your feedback!</div>
      )}
    </div>
  );
};

export default ConfidenceMeter;
