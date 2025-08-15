// spectator-app/src/App.jsx
import React, { useState, useEffect } from 'react';
import SpectatorView from './components/SpectatorView';
import DebateView from './components/DebateView';
import PasswordEntry from './components/PasswordEntry';
// import DebateBackground from './components/DebateBackground';
import { 
  getDebateData, 
  subscribeToDebate, 
  getTeams, 
  subscribeToTeams,
  submitVote,
  verifyPassword,
  getClassroomByPassword
} from './services/debateService';
import './App.css';

function App() {
  const [topic, setTopic] = useState("Is technology making us less social?");
  const [votes, setVotes] = useState({ switch: 0, dontSwitch: 0 });
  const [speakingFor, setSpeakingFor] = useState('A');
  const [teamA, setTeamA] = useState([]);
  const [teamB, setTeamB] = useState([]);
  const [debateStarted, setDebateStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentClassroom, setCurrentClassroom] = useState(null);
  const [appState, setAppState] = useState('loading'); // 'loading', 'password-entry', 'debate'
  const [hasVoted, setHasVoted] = useState(false);
  const [userVote, setUserVote] = useState(null);
  const [spectatorId, setSpectatorId] = useState(null);

  // Generate or retrieve spectator ID
  useEffect(() => {
    let id = localStorage.getItem('spectatorId');
    if (!id) {
      id = 'spec_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      localStorage.setItem('spectatorId', id);
    }
    setSpectatorId(id);
  }, []);

  // Check for existing classroom on load
  useEffect(() => {
    const savedClassroom = localStorage.getItem('spectatorCurrentClassroom');
    if (savedClassroom) {
      try {
        const classroom = JSON.parse(savedClassroom);
        // Verify the classroom still exists and password is valid
        verifyPassword(classroom.password).then((isValid) => {
          if (isValid) {
            setCurrentClassroom(classroom);
            setAppState('debate');
            loadDebateDataForClassroom(classroom.id);
          } else {
            localStorage.removeItem('spectatorCurrentClassroom');
            setAppState('password-entry');
            setIsLoading(false);
          }
        });
      } catch (error) {
        console.error('Error loading saved classroom:', error);
        localStorage.removeItem('spectatorCurrentClassroom');
        setAppState('password-entry');
        setIsLoading(false);
      }
    } else {
      setAppState('password-entry');
      setIsLoading(false);
    }
  }, []);

  // Load voting state for current classroom
  useEffect(() => {
    if (currentClassroom && spectatorId) {
      const voteKey = `vote_${currentClassroom.id}_${spectatorId}`;
      const savedVote = localStorage.getItem(voteKey);
      if (savedVote) {
        setUserVote(savedVote);
        setHasVoted(true);
      } else {
        setUserVote(null);
        setHasVoted(false);
      }
    }
  }, [currentClassroom, spectatorId]);

  const loadDebateDataForClassroom = async (classroomId) => {
    try {
      setIsLoading(true);
      
      // Load from localStorage first for immediate UI update
      const savedTopic = localStorage.getItem(`spectatorTopic_${classroomId}`);
      const savedVotes = localStorage.getItem(`spectatorVotes_${classroomId}`);
      const savedSpeakingFor = localStorage.getItem(`spectatorSpeakingFor_${classroomId}`);
      const savedTeamA = localStorage.getItem(`spectatorTeamA_${classroomId}`);
      const savedTeamB = localStorage.getItem(`spectatorTeamB_${classroomId}`);
      const savedDebateStarted = localStorage.getItem(`spectatorDebateStarted_${classroomId}`);
      
      if (savedTopic) setTopic(savedTopic);
      if (savedVotes) setVotes(JSON.parse(savedVotes));
      if (savedSpeakingFor) setSpeakingFor(savedSpeakingFor);
      if (savedTeamA) setTeamA(JSON.parse(savedTeamA));
      if (savedTeamB) setTeamB(JSON.parse(savedTeamB));
      if (savedDebateStarted) setDebateStarted(JSON.parse(savedDebateStarted));
      
      // Then load from Firebase for real-time data
      const debateData = await getDebateData(classroomId);
      const teamsData = await getTeams(classroomId);
      
      if (debateData) {
        setTopic(debateData.topic || topic);
        setVotes(debateData.votes || votes);
        setSpeakingFor(debateData.speakingFor || speakingFor);
        setDebateStarted(debateData.debateStarted || false);
      }
      
      if (teamsData) {
        setTeamA(teamsData.teamA || []);
        setTeamB(teamsData.teamB || []);
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading debate data:', error);
      setIsLoading(false);
    }
  };

  // Subscribe to real-time debate updates
  useEffect(() => {
    if (!currentClassroom || appState !== 'debate') return;

    const unsubscribeDebate = subscribeToDebate(currentClassroom.id, (debateData) => {
      if (debateData) {
        setTopic(debateData.topic);
        setVotes(debateData.votes);
        setSpeakingFor(debateData.speakingFor);
        setDebateStarted(debateData.debateStarted);
        
        // Save to localStorage with classroom ID
        localStorage.setItem(`spectatorTopic_${currentClassroom.id}`, debateData.topic);
        localStorage.setItem(`spectatorVotes_${currentClassroom.id}`, JSON.stringify(debateData.votes));
        localStorage.setItem(`spectatorSpeakingFor_${currentClassroom.id}`, debateData.speakingFor);
        localStorage.setItem(`spectatorDebateStarted_${currentClassroom.id}`, JSON.stringify(debateData.debateStarted));
      }
    });

    return () => unsubscribeDebate();
  }, [currentClassroom, appState]);

  // Subscribe to real-time team updates
  useEffect(() => {
    if (!currentClassroom || appState !== 'debate') return;

    const unsubscribeTeams = subscribeToTeams(currentClassroom.id, (teamsData) => {
      if (teamsData) {
        setTeamA(teamsData.teamA || []);
        setTeamB(teamsData.teamB || []);
        
        // Save to localStorage with classroom ID
        localStorage.setItem(`spectatorTeamA_${currentClassroom.id}`, JSON.stringify(teamsData.teamA || []));
        localStorage.setItem(`spectatorTeamB_${currentClassroom.id}`, JSON.stringify(teamsData.teamB || []));
      }
    });

    return () => unsubscribeTeams();
  }, [currentClassroom, appState]);

  const handlePasswordValid = async (password) => {
    try {
      setIsLoading(true);
      const classroom = await getClassroomByPassword(password);
      
      if (classroom) {
        setCurrentClassroom(classroom);
        localStorage.setItem('spectatorCurrentClassroom', JSON.stringify(classroom));
        setAppState('debate');
        await loadDebateDataForClassroom(classroom.id);
      } else {
        throw new Error('Invalid password');
      }
    } catch (error) {
      setIsLoading(false);
      throw error; // Re-throw to let PasswordEntry handle the error display
    }
  };

  const handleLeaveClassroom = () => {
    // Clear classroom-specific data
    if (currentClassroom) {
      localStorage.removeItem(`spectatorTopic_${currentClassroom.id}`);
      localStorage.removeItem(`spectatorVotes_${currentClassroom.id}`);
      localStorage.removeItem(`spectatorSpeakingFor_${currentClassroom.id}`);
      localStorage.removeItem(`spectatorTeamA_${currentClassroom.id}`);
      localStorage.removeItem(`spectatorTeamB_${currentClassroom.id}`);
      localStorage.removeItem(`spectatorDebateStarted_${currentClassroom.id}`);
      
      // Clear vote data
      const voteKey = `vote_${currentClassroom.id}_${spectatorId}`;
      localStorage.removeItem(voteKey);
    }
    
    setCurrentClassroom(null);
    localStorage.removeItem('spectatorCurrentClassroom');
    setAppState('password-entry');
    
    // Reset state
    setTopic("Is technology making us less social?");
    setVotes({ switch: 0, dontSwitch: 0 });
    setSpeakingFor('A');
    setTeamA([]);
    setTeamB([]);
    setDebateStarted(false);
    setHasVoted(false);
    setUserVote(null);
  };

  const handleVote = async (voteType) => {
    if (!currentClassroom || !spectatorId || hasVoted) return;
    
    try {
      await submitVote(currentClassroom.id, voteType, spectatorId);
      
      // Update local state
      setHasVoted(true);
      setUserVote(voteType);
      
      // Save vote to localStorage
      const voteKey = `vote_${currentClassroom.id}_${spectatorId}`;
      localStorage.setItem(voteKey, voteType);
      
      console.log(`Vote submitted: ${voteType}`);
    } catch (error) {
      console.error('Error submitting vote:', error);
      alert('Failed to submit vote. Please try again.');
    }
  };

  const handleChangeVote = () => {
    if (!currentClassroom || !spectatorId) return;
    
    // Allow user to change their vote
    setHasVoted(false);
    setUserVote(null);
    
    // Remove vote from localStorage
    const voteKey = `vote_${currentClassroom.id}_${spectatorId}`;
    localStorage.removeItem(voteKey);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="app-container">
        {/* <DebateBackground /> */}
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Connecting to debate session...</p>
        </div>
      </div>
    );
  }

  // Password entry state
  if (appState === 'password-entry') {
    return (
      <div className="app-container">
        {/* <DebateBackground /> */}
        <header>
          <h1>This Or That</h1>
          <p className="byline">Speak. Listen. Convince.</p>
          <p className="spectator-subtitle">Join Debate Session</p>
        </header>
        
        <div className="welcome-screen">
          <div className="welcome-card">
            <h2>Welcome, Student!</h2>
            <p>Enter the session password provided by your teacher to join the debate and cast your vote.</p>
            
            <div className="spectator-features">
              <div className="feature-item">
                <h3>👀 Watch Debates</h3>
                <p>Follow live debate sessions</p>
              </div>
              <div className="feature-item">
                <h3>🗳️ Cast Votes</h3>
                <p>Vote on which side convinced you</p>
              </div>
              <div className="feature-item">
                <h3>📈 See Results</h3>
                <p>View real-time voting results</p>
              </div>
            </div>
          </div>
        </div>
        
        <PasswordEntry 
          onPasswordValid={handlePasswordValid}
        />
      </div>
    );
  }

  // Main debate viewing interface
  return (
    <div className="app-container">
      {/* <DebateBackground /> */}
      <header>
        <h1>This Or That</h1>
        <p className="byline">Speak. Listen. Convince.</p>
        <div className="spectator-header-info">
          <div className="classroom-details">
            <p className="spectator-subtitle">
              {currentClassroom?.name} • {currentClassroom?.adminName}
            </p>
            <div className="session-status">
              {debateStarted ? (
                <span className="status-badge active">🔴 Live Debate</span>
              ) : (
                <span className="status-badge waiting">⏳ Waiting to Start</span>
              )}
            </div>
          </div>
          <button className="leave-classroom-btn secondary-btn" onClick={handleLeaveClassroom}>
            Leave Session
          </button>
        </div>
      </header>

      <DebateView
        topic={topic}
        votes={votes}
        teamA={teamA}
        teamB={teamB}
        speakingFor={speakingFor}
        debateStarted={debateStarted}
        isAdmin={false}
      />
      
      <SpectatorView
        onVote={handleVote}
        onChangeVote={handleChangeVote}
        hasVoted={hasVoted}
        userVote={userVote}
        teamA={teamA}
        teamB={teamB}
        speakingFor={speakingFor}
        debateStarted={debateStarted}
        votes={votes}
      />

      {!debateStarted && (
        <div className="waiting-message">
          <div className="waiting-card">
            <h3>🎭 Debate Starting Soon</h3>
            <p>Your teacher is setting up the debate. You'll be able to vote once it begins!</p>
            <div className="participants-preview">
              <div className="team-preview">
                <strong>Team A:</strong> {teamA.length} members
              </div>
              <div className="team-preview">
                <strong>Team B:</strong> {teamB.length} members
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;