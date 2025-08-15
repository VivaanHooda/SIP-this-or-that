// src/components/TeamDisplay.jsx
import React from 'react';
import './TeamDisplay.css'; // We'll create this CSS file later

function TeamDisplay({ teamName, students, side }) {
  return (
    <div className={`team-display ${side.toLowerCase()}`}>
      <h3>{teamName}</h3>
      <div className="team-side-indicator">
        <p>{side}</p>
      </div>
      <ul className="student-list">
        {students.map((student, index) => (
          <li key={index}>{student}</li>
        ))}
      </ul>
    </div>
  );
}

export default TeamDisplay;