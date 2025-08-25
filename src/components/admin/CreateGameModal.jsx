"use client";
import React, { useState } from 'react';
import './CreateGameModal.css'; // We will add styles for this

function CreateGameModal({ teamA, teamB, onCreate, onCancel }) {
  const [gameName, setGameName] = useState('');
  const [selectedTeamA, setSelectedTeamA] = useState([]);
  const [selectedTeamB, setSelectedTeamB] = useState([]);

  const handleSelectPlayer = (player, team) => {
    if (team === 'A') {
      setSelectedTeamA(prev => 
        prev.find(p => p.admissionNumber === player.admissionNumber)
          ? prev.filter(p => p.admissionNumber !== player.admissionNumber)
          : [...prev, player]
      );
    } else {
      setSelectedTeamB(prev => 
        prev.find(p => p.admissionNumber === player.admissionNumber)
          ? prev.filter(p => p.admissionNumber !== player.admissionNumber)
          : [...prev, player]
      );
    }
  };

  const handleCreate = () => {
    if (!gameName.trim()) {
      alert('Please enter a name for the game.');
      return;
    }
    onCreate({
      gameName,
      teamAPlayers: selectedTeamA,
      teamBPlayers: selectedTeamB,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Create New Breakout Game</h2>
        <div className="form-group">
          <label>Game Name</label>
          <input
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="e.g., Game 1: AI in Art"
          />
        </div>

        <div className="player-selection">
          <div className="team-column">
            <h3>Team A ({selectedTeamA.length} selected)</h3>
            {teamA.map(player => (
              <div key={player.admissionNumber} className="player-checkbox">
                <input
                  type="checkbox"
                  id={`player-${player.admissionNumber}`}
                  onChange={() => handleSelectPlayer(player, 'A')}
                />
                <label htmlFor={`player-${player.admissionNumber}`}>{player.name}</label>
              </div>
            ))}
          </div>
          <div className="team-column">
            <h3>Team B ({selectedTeamB.length} selected)</h3>
            {teamB.map(player => (
              <div key={player.admissionNumber} className="player-checkbox">
                <input
                  type="checkbox"
                  id={`player-${player.admissionNumber}`}
                  onChange={() => handleSelectPlayer(player, 'B')}
                />
                <label htmlFor={`player-${player.admissionNumber}`}>{player.name}</label>
              </div>
            ))}
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onCancel}>Cancel</button>
          <button className="btn-primary" onClick={handleCreate}>Create Game</button>
        </div>
      </div>
    </div>
  );
}

export default CreateGameModal;