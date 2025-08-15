// admin-app/src/App.jsx
import React, { useState, useEffect } from 'react';
import DebateView from './components/DebateView';
import AdminControls from './components/AdminControls';
import ClassroomSetup from './components/ClassroomSetup';
// import DebateBackground from './components/DebateBackground';
import {
  getDebateData,
  subscribeToDebate,
  updateTopic,
  startDebate,
  switchSides,
  updateTeams,
  getTeams,
  subscribeToTeams,
  createClassroom,
  verifyClassroom
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
  const [showClassroomSetup, setShowClassroomSetup] = useState(false);
  const [appState, setAppState] = useState('loading'); // 'loading', 'welcome', 'setup', 'debate'

  // Check for existing classroom on load
  // DEV MODE: Skip verification and load dummy classroom immediately
useEffect(() => {
  // force disable loading state
  setIsLoading(false);

  // set app state directly to debate
  setAppState("debate");

  // create dummy classroom data
  setCurrentClassroom({
    id: "dev123456",
    name: "Test Classroom",
    adminName: "Dev Admin",
    password: "123456"
  });

  // mock debate state
  setTopic("Sample Debate Topic");
  setVotes({ switch: 0, dontSwitch: 0 });
  setSpeakingFor("A");
  setTeamA(["Alice", "Bob"]);
  setTeamB(["Charlie", "Dana"]);
  setDebateStarted(false);
}, []);


  const loadDebateDataForClassroom = async (classroomId) => {
    try {
      setIsLoading(true);

      // Load from localStorage first for immediate UI update
      const savedTopic = localStorage.getItem(`debateTopic_${classroomId}`);
      const savedVotes = localStorage.getItem(`debateVotes_${classroomId}`);
      const savedSpeakingFor = localStorage.getItem(`debateSpeakingFor_${classroomId}`);
      const savedTeamA = localStorage.getItem(`debateTeamA_${classroomId}`);
      const savedTeamB = localStorage.getItem(`debateTeamB_${classroomId}`);
      const savedDebateStarted = localStorage.getItem(`debateStarted_${classroomId}`);

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
        localStorage.setItem(`debateTopic_${currentClassroom.id}`, debateData.topic);
        localStorage.setItem(`debateVotes_${currentClassroom.id}`, JSON.stringify(debateData.votes));
        localStorage.setItem(`debateSpeakingFor_${currentClassroom.id}`, debateData.speakingFor);
        localStorage.setItem(`debateStarted_${currentClassroom.id}`, JSON.stringify(debateData.debateStarted));
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
        localStorage.setItem(`debateTeamA_${currentClassroom.id}`, JSON.stringify(teamsData.teamA || []));
        localStorage.setItem(`debateTeamB_${currentClassroom.id}`, JSON.stringify(teamsData.teamB || []));
      }
    });

    return () => unsubscribeTeams();
  }, [currentClassroom, appState]);

  const handleClassroomCreated = async (classroomData) => {
    try {
      const classroom = await createClassroom(classroomData);
      setCurrentClassroom(classroom);
      localStorage.setItem('currentClassroom', JSON.stringify(classroom));
      setAppState('debate');

      // Initialize debate data for new classroom
      await handleSetTopic(topic);
      await handleUpdateTeams([], []);
    } catch (error) {
      console.error('Error creating classroom:', error);
      alert('Failed to create classroom. Please try again.');
    }
  };

  const handleNewClassroom = () => {
    // Clear current classroom data
    if (currentClassroom) {
      localStorage.removeItem(`debateTopic_${currentClassroom.id}`);
      localStorage.removeItem(`debateVotes_${currentClassroom.id}`);
      localStorage.removeItem(`debateSpeakingFor_${currentClassroom.id}`);
      localStorage.removeItem(`debateTeamA_${currentClassroom.id}`);
      localStorage.removeItem(`debateTeamB_${currentClassroom.id}`);
      localStorage.removeItem(`debateStarted_${currentClassroom.id}`);
    }

    setCurrentClassroom(null);
    localStorage.removeItem('currentClassroom');
    setAppState('setup');

    // Reset state
    setTopic("Is technology making us less social?");
    setVotes({ switch: 0, dontSwitch: 0 });
    setSpeakingFor('A');
    setTeamA([]);
    setTeamB([]);
    setDebateStarted(false);
  };

  const handleSetTopic = async (newTopic) => {
    if (!currentClassroom) return;

    try {
      await updateTopic(currentClassroom.id, newTopic);
      console.log('Topic updated successfully');
    } catch (error) {
      console.error('Error updating topic:', error);
    }
  };

  const handleStartDebate = async () => {
    if (!currentClassroom) return;

    try {
      await startDebate(currentClassroom.id);
      console.log('Debate started successfully');
    } catch (error) {
      console.error('Error starting debate:', error);
    }
  };

  const handleSwitchSides = async () => {
    if (!currentClassroom) return;

    try {
      await switchSides(currentClassroom.id);
      console.log('Sides switched successfully');
    } catch (error) {
      console.error('Error switching sides:', error);
    }
  };

  const handleUpdateTeams = async (newTeamA, newTeamB) => {
    if (!currentClassroom) return;

    try {
      await updateTeams(currentClassroom.id, newTeamA, newTeamB);
      console.log('Teams updated successfully');
    } catch (error) {
      console.error('Error updating teams:', error);
    }
  };

  const handleBackToWelcome = () => {
    setAppState('welcome');
  };

  const handleShowSetup = () => {
    setAppState('setup');
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="app-container">
        {/* <DebateBackground /> */}
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading debate session...</p>
        </div>
      </div>
    );
  }

  // Classroom setup state
  if (appState === 'setup') {
    return (
      <div className="app-container">
        {/* <DebateBackground /> */}
        <header>
          <h1>This Or That</h1>
          <p className="byline">Speak. Listen. Convince.</p>
          <p className="admin-subtitle">Create New Debate Session</p>
        </header>
        <ClassroomSetup
          onClassroomCreated={handleClassroomCreated}
          onBack={handleBackToWelcome}
        />
      </div>
    );
  }

  // Welcome/initial state
  if (appState === 'welcome') {
    return (
      <div className="app-container">
        {/* <DebateBackground /> */}
        <header>
          <h1>This Or That</h1>
          <p className="byline">Speak. Listen. Convince.</p>
          <p className="admin-subtitle">Admin Dashboard</p>
        </header>
        <div className="welcome-screen">
          <div className="welcome-card">
            <h2>Welcome, Teacher!</h2>
            <p>Create and manage debate sessions for your classroom. Set topics, organize teams, and facilitate engaging discussions.</p>

            <div className="admin-features">
              <div className="feature-item">
                <h3>🎯 Set Topics</h3>
                <p>Create engaging debate questions</p>
              </div>
              <div className="feature-item">
                <h3>👥 Manage Teams</h3>
                <p>Organize students into debate teams</p>
              </div>
              <div className="feature-item">
                <h3>🎮 Control Flow</h3>
                <p>Start debates and switch sides</p>
              </div>
              <div className="feature-item">
                <h3>📊 Track Progress</h3>
                <p>Monitor votes and participation</p>
              </div>
            </div>

            <button
              className="create-classroom-btn primary-btn"
              onClick={handleShowSetup}
            >
              Create New Classroom Session
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main debate interface
  return (
    <div className="app-container">
      {/* <DebateBackground /> */}
      <header>
        <h1>This Or That</h1>
        <p className="byline">Speak. Listen. Convince.</p>
        <div className="admin-header-info">
          <div className="classroom-details">
            <p className="admin-subtitle">
              {currentClassroom?.name} • {currentClassroom?.adminName}
            </p>
            <div className="classroom-meta">
              <span className="password-display">
                Session Password: <strong>{currentClassroom?.password}</strong>
              </span>
              <span className="session-id">
                ID: {currentClassroom?.id?.slice(-6)}
              </span>
            </div>
          </div>
          <button className="new-classroom-btn secondary-btn" onClick={handleNewClassroom}>
            New Session
          </button>
        </div>
      </header>

      <AdminControls
        onSetTopic={handleSetTopic}
        onSwitchSides={handleSwitchSides}
        onStartDebate={handleStartDebate}
        debateStarted={debateStarted}
        onUpdateTeams={handleUpdateTeams}
        teamA={teamA}
        teamB={teamB}
        currentTopic={topic}
      />

      <DebateView
        topic={topic}
        votes={votes}
        teamA={teamA}
        teamB={teamB}
        speakingFor={speakingFor}
        debateStarted={debateStarted}
        isAdmin={true}
      />

      {debateStarted && (
        <div className="admin-status">
          <div className="status-indicator">
            <span className="status-dot active"></span>
            <span>Debate Session Active</span>
          </div>
          <div className="participants-count">
            <span>{teamA.length + teamB.length} participants</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;