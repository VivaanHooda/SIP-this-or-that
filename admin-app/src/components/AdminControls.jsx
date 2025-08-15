// admin-app/src/components/AdminControls.jsx
import React, { useState } from 'react';
import './AdminControls.css';

function AdminControls({ onSetTopic, onSwitchSides, onStartDebate, debateStarted, onUpdateTeams, teamA, teamB }) {
  const [newTopic, setNewTopic] = useState('');
  const [newDebaterName, setNewDebaterName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('A');

  const handleTopicSubmit = (e) => {
    e.preventDefault();
    if (newTopic.trim()) {
      onSetTopic(newTopic.trim());
      setNewTopic('');
    }
  };

  const handleAddDebater = (e) => {
    e.preventDefault();
    const name = newDebaterName.trim();
    if (!name) return;

    if (selectedTeam === 'A') {
      onUpdateTeams([...teamA, name], teamB);
    } else {
      onUpdateTeams(teamA, [...teamB, name]);
    }
    setNewDebaterName('');
  };

  const handleRemoveDebater = (team, index) => {
    if (team === 'A') {
      const updated = teamA.filter((_, i) => i !== index);
      onUpdateTeams(updated, teamB);
    } else {
      const updated = teamB.filter((_, i) => i !== index);
      onUpdateTeams(teamA, updated);
    }
  };

  const handleClearTeams = () => {
    onUpdateTeams([], []);
  };

  return (
    <div className="admin-controls">
      <h3>Admin Controls</h3>
      
      {/* Topic Setting */}
      <div className="control-section">
        <h4>Set Debate Topic</h4>
        <form onSubmit={handleTopicSubmit}>
          <input 
            type="text" 
            value={newTopic} 
            onChange={(e) => setNewTopic(e.target.value)} 
            placeholder="Enter new debate topic..."
          />
          <button type="submit">Set Topic</button>
        </form>
      </div>

      {/* Debater Registration */}
      <div className="control-section">
        <h4>Register Debaters</h4>
        <form onSubmit={handleAddDebater}>
          <div className="debater-form">
            <input 
              type="text" 
              value={newDebaterName} 
              onChange={(e) => setNewDebaterName(e.target.value)} 
              placeholder="Enter debater name..."
              required
            />
            <select 
              value={selectedTeam} 
              onChange={(e) => setSelectedTeam(e.target.value)}
            >
              <option value="A">Team A</option>
              <option value="B">Team B</option>
            </select>
            <button type="submit">Add Debater</button>
          </div>
        </form>
      </div>

      {/* Team Management */}
      <div className="teams-management">
        <div className="team-section">
          <h5>Team A ({teamA.length} members)</h5>
          <ul className="debater-list">
            {teamA.map((debater, index) => (
              <li key={index}>
                {debater}
                <button 
                  onClick={() => handleRemoveDebater('A', index)}
                  className="remove-btn"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
        
        <div className="team-section">
          <h5>Team B ({teamB.length} members)</h5>
          <ul className="debater-list">
            {teamB.map((debater, index) => (
              <li key={index}>
                {debater}
                <button 
                  onClick={() => handleRemoveDebater('B', index)}
                  className="remove-btn"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Team Actions */}
      <div className="team-actions">
        <button onClick={handleClearTeams} className="clear-btn">
          Clear All Teams
        </button>
      </div>

      {/* Debate Control */}
      <div className="debate-control">
        {!debateStarted ? (
          <button 
            onClick={onStartDebate} 
            className="start-debate-btn"
            disabled={teamA.length === 0 || teamB.length === 0}
          >
            Start Debate
          </button>
        ) : (
          <div className="debate-status">
            <p className="status-active">Debate is Active</p>
            <button onClick={onSwitchSides} className="switch-btn">
              Force Switch Sides
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminControls;
