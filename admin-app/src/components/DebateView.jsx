// admin-app/src/components/DebateView.jsx
import React from 'react';
import './DebateView.css';

function DebateView({ topic, votes, teamA, teamB, speakingFor, debateStarted }) {
  return (
    <div className="debate-view">
      <div className="debate-header">
        <h2>Current Debate Status</h2>
        <div className={`status-indicator ${debateStarted ? 'active' : 'waiting'}`}>
          {debateStarted ? '🟢 Debate Active' : '⏳ Waiting to Start'}
        </div>
      </div>

      <div className="debate-content">
        <div className="topic-section">
          <h3>Topic: {topic}</h3>
        </div>

        <div className="teams-overview">
          <div className="team-overview">
            <h4>Team A ({teamA.length} members)</h4>
            <div className="team-members">
              {teamA.length > 0 ? (
                teamA.map((student, index) => (
                  <span key={index} className="member-tag">
                    {student}
                  </span>
                ))
              ) : (
                <p className="no-members">No members yet</p>
              )}
            </div>
          </div>

          <div className="team-overview">
            <h4>Team B ({teamB.length} members)</h4>
            <div className="team-members">
              {teamB.length > 0 ? (
                teamB.map((student, index) => (
                  <span key={index} className="member-tag">
                    {student}
                  </span>
                ))
              ) : (
                <p className="no-members">No members yet</p>
              )}
            </div>
          </div>
        </div>

        {debateStarted && (
          <div className="debate-stats">
            <div className="current-side">
              <h4>Currently Speaking For:</h4>
              <div className={`side-indicator ${speakingFor === 'A' ? 'team-a' : 'team-b'}`}>
                Team {speakingFor}
              </div>
            </div>

            <div className="vote-counts">
              <h4>Vote Counts:</h4>
              <div className="vote-display">
                <div className="vote-item">
                  <span className="vote-label">Switch:</span>
                  <span className="vote-number">{votes.switch}</span>
                </div>
                <div className="vote-item">
                  <span className="vote-label">Don't Switch:</span>
                  <span className="vote-number">{votes.dontSwitch}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default DebateView;
