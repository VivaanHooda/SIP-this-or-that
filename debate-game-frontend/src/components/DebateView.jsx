// src/components/DebateView.jsx
import React from 'react';
import TeamDisplay from './TeamDisplay';
import './DebateView.css';

function DebateView({ topic, votes, teamA, teamB, speakingFor }) {
  const totalVotes = votes.switch + votes.dontSwitch;
  const switchPercentage = totalVotes > 0 ? (votes.switch / totalVotes) * 100 : 0;

  return (
    <div className="debate-view">
      <div className="topic-card">
        <h2>Debate Topic:</h2>
        <h1>{topic}</h1>
      </div>
      
      <div className="teams-container">
        <TeamDisplay 
          teamName="Team A" 
          students={teamA} 
          side={speakingFor === 'A' ? 'For' : 'Against'} 
        />
        <TeamDisplay 
          teamName="Team B" 
          students={teamB} 
          side={speakingFor === 'B' ? 'For' : 'Against'} 
        />
      </div>

      <div className="vote-section">
        <h3>Vote to switch the debate?</h3>
        <div className="vote-bar-container">
          <div 
            className="vote-bar-fill" 
            style={{ width: `${switchPercentage}%` }}
          ></div>
        </div>
        <div className="vote-counts">
          <span className="vote-count-switch">Switch: {votes.switch}</span>
          <span className="vote-count-dont-switch">Don't Switch: {votes.dontSwitch}</span>
        </div>
      </div>
    </div>
  );
}

export default DebateView;