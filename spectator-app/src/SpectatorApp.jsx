import React, { useState } from 'react';
import { joinRoom, voteForTeam } from './services/debateService';

const SpectatorApp = () => {
  const [step, setStep] = useState('entry');
  const [roomKey, setRoomKey] = useState('');
  const [room, setRoom] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState('');
  const [voted, setVoted] = useState(false);

  // Step 1: Enter Room Key
  const handleJoin = async () => {
    const data = await joinRoom(roomKey);
    if (data) {
      setRoom(data);
      setStep('debate');
    } else {
      alert('Room not found');
    }
  };

  // Step 2: Vote
  const handleVote = async () => {
    await voteForTeam(roomKey, selectedTeam);
    setVoted(true);
  };

  if (step === 'entry') {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <h1>Enter Debate Room</h1>
        <input
          placeholder="Enter Room Key"
          value={roomKey}
          onChange={e => setRoomKey(e.target.value.toUpperCase())}
        />
        <button onClick={handleJoin}>Join</button>
      </div>
    );
  }

  if (step === 'debate' && room) {
    return (
      <div style={{ textAlign: 'center', marginTop: 100 }}>
        <h2>Debate Topic: {room.topic}</h2>
        <h3>Teams</h3>
        <ul>
          {room.teams.map(team => (
            <li key={team}>{team}</li>
          ))}
        </ul>
        <h4>Vote for a Team</h4>
        {voted ? (
          <p>Thank you for voting!</p>
        ) : (
          <>
            {room.teams.map(team => (
              <button
                key={team}
                onClick={() => { setSelectedTeam(team); handleVote(); }}
                style={{ margin: 10 }}
              >
                {team}
              </button>
            ))}
          </>
        )}
      </div>
    );
  }

  return null;
};

export default SpectatorApp;
