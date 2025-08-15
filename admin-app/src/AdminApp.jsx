import React, { useState } from 'react';
import { createRoomWithGemini } from './services/geminiService';
import { saveRoomDetails, listenToVotes } from './services/debateService';

const AdminApp = () => {
  const [step, setStep] = useState('landing');
  const [roomKey, setRoomKey] = useState('');
  const [teams, setTeams] = useState(['', '']);
  const [topic, setTopic] = useState('');
  const [votes, setVotes] = useState({});

  // Step 1: Create Room
  const handleCreateRoom = async () => {
    const key = await createRoomWithGemini();
    setRoomKey(key);
    setStep('setup');
  };

  // Step 2: Save Room Details
  const handleSaveDetails = async () => {
    await saveRoomDetails(roomKey, { teams, topic });
    setStep('votes');
    listenToVotes(roomKey, setVotes);
  };

  // UI
  if (step === 'landing') {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <h1>Admin Panel</h1>
        <button onClick={handleCreateRoom}>Create Room</button>
      </div>
    );
  }

  if (step === 'setup') {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <h2>Room Key: {roomKey}</h2>
        <div>
          <input
            placeholder="Team 1 Name"
            value={teams[0]}
            onChange={e => setTeams([e.target.value, teams[1]])}
          />
          <input
            placeholder="Team 2 Name"
            value={teams[1]}
            onChange={e => setTeams([teams[0], e.target.value])}
          />
        </div>
        <div>
          <input
            placeholder="Debate Topic"
            value={topic}
            onChange={e => setTopic(e.target.value)}
          />
        </div>
        <button onClick={handleSaveDetails}>Open Room</button>
      </div>
    );
  }

  if (step === 'votes') {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <h2>Room Key: {roomKey}</h2>
        <h3>Debate Topic: {topic}</h3>
        <h4>Votes</h4>
        <ul>
          {teams.map(team => (
            <li key={team}>{team}: {votes[team] || 0}</li>
          ))}
        </ul>
      </div>
    );
  }

  return null;
};

export default AdminApp;
