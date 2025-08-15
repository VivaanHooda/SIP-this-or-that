// src/App.jsx
import React, { useState, useEffect } from 'react';
import DebateView from './components/DebateView';
import SpectatorView from './components/SpectatorView';
import AdminControls from './components/AdminControls';
import './App.css';

function App() {
  const [topic, setTopic] = useState("Is technology making us less social?");
  const [votes, setVotes] = useState({ switch: 0, dontSwitch: 0 });
  const [userRole, setUserRole] = useState('spectator'); // 'spectator', 'admin'
  const [hasVoted, setHasVoted] = useState(false);
  const [speakingFor, setSpeakingFor] = useState('A'); // 'A' or 'B'
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [debateStarted, setDebateStarted] = useState(false);

  // Load teams from localStorage on component mount
  useEffect(() => {
    const savedTeamA = localStorage.getItem('debateTeamA');
    const savedTeamB = localStorage.getItem('debateTeamB');
    
    if (savedTeamA) setTeamA(JSON.parse(savedTeamA));
    if (savedTeamB) setTeamB(JSON.parse(savedTeamB));
  }, []);

  const handleVote = (voteType) => {
    console.log(`User voted to: ${voteType}`);
    setHasVoted(true);

    setVotes(prevVotes => ({
      ...prevVotes,
      [voteType]: prevVotes[voteType] + 1
    }));
  };

  const handleSwitchSides = () => {
    setSpeakingFor(prevSide => (prevSide === 'A' ? 'B' : 'A'));
    setVotes({ switch: 0, dontSwitch: 0 });
    setHasVoted(false);
    console.log(`Sides have been switched!`);
  };

  const handleStartDebate = () => {
    setDebateStarted(true);
    console.log('Debate has started!');
  };

  const handleSetTopic = (newTopic) => {
    setTopic(newTopic);
    setDebateStarted(false); // Reset debate state when topic changes
    setVotes({ switch: 0, dontSwitch: 0 });
    setHasVoted(false);
  };

  const handleUpdateTeams = (newTeamA, newTeamB) => {
    setTeamA(newTeamA);
    setTeamB(newTeamB);
  };

  useEffect(() => {
    // This is a simple check to auto-switch if a majority vote is reached
    if (votes.switch > votes.dontSwitch && votes.switch + votes.dontSwitch >= 5) { // Requires a minimum of 5 votes to switch
      alert('Majority has voted to switch! Sides are now switching.');
      handleSwitchSides();
    }
  }, [votes]);

  return (
    <div className="app-container">
      <header>
        <h1>The Great Debate</h1>
        <div className="role-switcher">
          <button onClick={() => setUserRole('spectator')}>Spectator</button>
          <button onClick={() => setUserRole('admin')}>Admin</button>
        </div>
      </header>

      {userRole === 'admin' && (
        <AdminControls
          onSetTopic={handleSetTopic}
          onSwitchSides={handleSwitchSides}
          onStartDebate={handleStartDebate}
          debateStarted={debateStarted}
          onUpdateTeams={handleUpdateTeams}
        />
      )}
      
      <DebateView
        topic={topic}
        votes={votes}
        teamA={teamA}
        teamB={teamB}
        speakingFor={speakingFor}
        debateStarted={debateStarted}
      />
      
      {userRole === 'spectator' && (
        <SpectatorView
          onVote={handleVote}
          hasVoted={hasVoted}
          teamA={teamA}
          teamB={teamB}
          speakingFor={speakingFor}
          debateStarted={debateStarted}
        />
      )}
    </div>
  );
}

export default App;