// src/components/SpectatorView.jsx
import React, { useState } from 'react';
import './SpectatorView.css';

function SpectatorView({ onVote, hasVoted, teamA, teamB, speakingFor, debateStarted }) {
  const [localHasVoted, setLocalHasVoted] = useState(false);

  const handleVote = (voteType) => {
    if (!localHasVoted && debateStarted) {
      onVote(voteType);
      setLocalHasVoted(true);
    }
  };

  // If debate hasn't started, show waiting message
  if (!debateStarted) {
    return (
      <div className="spectator-view">
        <div className="waiting-container">
          <h3>Welcome to The Great Debate!</h3>
          <p>Waiting for the debate to begin...</p>
          <div className="teams-preview">
            <div className="team-preview">
              <h4>Team A ({teamA.length} members)</h4>
              <ul className="team-preview-list">
                {teamA.map((student, index) => (
                  <li key={index}>{student}</li>
                ))}
              </ul>
            </div>
            
            <div className="team-preview">
              <h4>Team B ({teamB.length} members)</h4>
              <ul className="team-preview-list">
                {teamB.map((student, index) => (
                  <li key={index}>{student}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If debate has started, show voting interface
  return (
    <div className="spectator-view">
      <div className="spectator-header">
        <h3>Debate is Active!</h3>
        <div className="debate-status-badge">
          <span className="status-dot"></span>
          Live
        </div>
      </div>

      {/* Teams Display */}
      <div className="teams-display">
        <div className="team-section">
          <h4>Team A</h4>
          <ul className="team-list">
            {teamA.map((student, index) => (
              <li key={index} className={speakingFor === 'A' ? 'speaking' : ''}>
                {student}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="team-section">
          <h4>Team B</h4>
          <ul className="team-list">
            {teamB.map((student, index) => (
              <li key={index} className={speakingFor === 'B' ? 'speaking' : ''}>
                {student}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Voting Section */}
      {localHasVoted ? (
        <div className="voted-message">
          <p>Thanks for your vote! Waiting for the result...</p>
        </div>
      ) : (
        <div className="voting-section">
          <h4>Your Vote Counts!</h4>
          <p>Should the teams switch their sides?</p>
          <div className="vote-buttons">
            <button 
              className="vote-btn switch" 
              onClick={() => handleVote('switch')}
            >
              Switch!
            </button>
            <button 
              className="vote-btn dont-switch" 
              onClick={() => handleVote('dontSwitch')}
            >
              No, Keep It.
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpectatorView;