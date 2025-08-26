"use client";
import React, { useState, useEffect } from 'react';
import { Plus, Settings, Users, Play, RotateCcw, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useDebate } from '../../context/DebateContext';
import TimerDisplay from '../spectator/TimerDisplay';
import {
  createClassroom,
  generateDebatePassword,
  updateClassroom,
  generateDebateTopic
} from '../../services/geminiService';
import {
  createGame,
  subscribeToGamesList,
  updateTopicInGame,
  startGame,
  switchSidesInGame,
  updateTimerInGame,
  deleteGame,
  getTeams,
  getClassroomStudents,
  removeStudentFromTeam,
  getClassroomByPassword,
  clearAllTeams,
} from '../../services/debateService';
import CreateGameModal from './CreateGameModal';
import ClassroomSetup from './ClassroomSetup';
import './AdminDashboard.css';


function AdminDashboard() {
  const { state, actions } = useDebate();
  const [view, setView] = useState('dashboard'); 
  const [isClient, setIsClient] = useState(false);
  const [isGeneratingTopic, setIsGeneratingTopic] = useState(false);
  const [activeClassroom, setActiveClassroom] = useState(null);
  const [newTopic, setNewTopic] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [students, setStudents] = useState([]);
  const [timerMinutes, setTimerMinutes] = useState(5);
  const [games, setGames] = useState([]);
  const [activeGameId, setActiveGameId] = useState(null);
  const [isCreateGameModalOpen, setIsCreateGameModalOpen] = useState(false);
  const [activeGame,setActiveGame] = useState(null);
  const [rejoinPassword, setRejoinPassword] = useState('');
  const [isDataLoading, setIsDataLoading] = useState(true);


  useEffect(() => {
    // This function will run whenever a new classroom is loaded
    const loadInitialData = async () => {
      if (!activeClassroom?.id) return;
  
      setIsDataLoading(true); // Start loading
      try {
        // Fetch the master team list and all registered students
        const teamsData = await getTeams(activeClassroom.id);
        const studentsData = await getClassroomStudents(activeClassroom.id);
  
        // Update the global state with the master team roster
        if (teamsData) {
          actions.setTeams(teamsData);
        }
        // Update the local state with the list of all students
        if (studentsData) {
          setStudents(studentsData);
        }
  
      } catch (error) {
        console.error('Error loading initial classroom data:', error);
        actions.setError('Failed to load classroom data.');
      } finally {
        setIsDataLoading(false); // Finish loading
      }
    };
  
    loadInitialData();
  }, [activeClassroom?.id]);
  useEffect(() => {
    if (activeGameId) {
      const newActiveGame = games.find(game => game.id === activeGameId);
      setActiveGame(newActiveGame);
    } else {
      setActiveGame(null);
    }
  }, [games, activeGameId]);

  useEffect(() => {
    setIsClient(true);
  }, []);
  useEffect(() => {
    const savedClassroom = localStorage.getItem('currentClassroom');
    if (savedClassroom) {
      const classroom = JSON.parse(savedClassroom);
      setActiveClassroom(classroom);
      actions.setClassroom(classroom);
      setView('classroom');
      
    }
  }, []);
  useEffect(() => {
    if (!activeClassroom?.id) return;
  
    // Subscribe to the list of games for this classroom
    const unsubscribe = subscribeToGamesList(activeClassroom.id, (gamesList) => {
      setGames(gamesList);
    });
  
    // Clean up the subscription when the component unmounts
    return () => unsubscribe();
  }, [activeClassroom?.id]);

  
  const handleCreateClassroom = async (classroomData) => {
    try {
      actions.setLoading(true);
      const classroom = await createClassroom(classroomData);
      
      setActiveClassroom(classroom);
      actions.setClassroom(classroom);
      localStorage.setItem('currentClassroom', JSON.stringify(classroom));
      
      setView('classroom');
      
    } catch (error) {
      console.error('Error creating classroom:', error);
      actions.setError('Failed to create classroom');
    }
  };

  const handleUpdateTopic = async () => {
    if (!newTopic.trim() || !activeClassroom || !activeGameId) return;
  
    try {
      await updateTopicInGame(activeClassroom.id, activeGameId, newTopic.trim());
      setNewTopic('');
    } catch (error) {
      console.error('Error updating topic:', error);
      actions.setError('Failed to update topic');
    }
  };
  const handleStartGame = async () => {
    // Check if a game is selected
    if (!activeClassroom || !activeGameId) return;
    
    try {
      // Call the new service function with the active game's ID
      await startGame(activeClassroom.id, activeGameId);
      // No need to set state here, the listener will update the UI
    } catch (error) {
      console.error('Error starting game:', error);
      actions.setError('Failed to start the selected game');
    }
  };
  const handleSwitchSides = async () => {
    // Check if a game is selected
    if (!activeClassroom || !activeGameId) return;
    
    try {
      // Call the new service function with the active game's ID
      await switchSidesInGame(activeClassroom.id, activeGameId);
      // No need to set state here, the listener will update the UI
    } catch (error) {
      console.error('Error switching sides:', error);
      actions.setError('Failed to switch sides');
    }
  };

  const handleRemoveStudent = async (admissionNumber) => {
    if (!activeClassroom) return;
    
    try {
      await removeStudentFromTeam(activeClassroom.id, admissionNumber);
    } catch (error) {
      console.error('Error removing student:', error);
      actions.setError('Failed to remove student');
    }
  };

  const handleClearAllTeams = async () => {
    if (!activeClassroom) return;

    try {
      await clearAllTeams(activeClassroom.id);
    } catch (error) {
      console.error('Error clearing teams:', error);
      actions.setError('Failed to clear teams');
    }
  };

  const handleNewClassroom = () => {
    setActiveClassroom(null);
    actions.resetState();
    setStudents([]);
    localStorage.removeItem('currentClassroom');
    setView('setup');
  };
  const handleTimerStart = async () => {
    // Check if a game is selected
    if (!activeClassroom || !activeGameId) return;
  
    try {
      // Convert minutes from the input field to seconds
      const timeInSeconds = timerMinutes * 60;
      // Call the new service function with the active game's ID
      await updateTimerInGame(activeClassroom.id, activeGameId, timeInSeconds, true);
    } catch (error) {
      console.error('Error starting timer:', error);
      actions.setError('Failed to start the timer.');
    }
  };
  const handleTimerReset = async() => {
    if (!activeClassroom || !activeGameId) return;
    try {
      const timeInSeconds = timerMinutes * 60;
      await updateTimerInGame(activeClassroom.id, activeGameId, timeInSeconds, false);
    }
    catch(error){
    console.error('Error resetting timer:',error);
    actions.setError('Failed to reset the timer');
  }
};
  
  const handleCreateGame = async (gameData) => {
    if (!activeClassroom) return;
  
    try {
      // Call the service function to create the game in Firestore
      await createGame(activeClassroom.id, gameData);
      setIsCreateGameModalOpen(false); // Close the modal on success
    } catch (error) {
      console.error('Error creating game:', error);
      actions.setError('Failed to create the new game.');
    }
  };
  const handleSelectGame = (game) => {
    setActiveGameId(game.id);
    setActiveGame(game);
    // Also, update the topic input field to show the selected game's topic
    setNewTopic(game.topic); 
  };

  const handleTimerPause = async () => {
    if (!activeClassroom || !activeGameId || !activeGame) return;
  
    try {
      await updateTimerInGame(activeClassroom.id, activeGameId, activeGame.timer, false);
    } catch (error) {
      console.error('Error pausing timer:', error);
      actions.setError('Failed to pause the timer.');
    }
  };
  const handleGenerateTopic = async () => {
    // Ensure a game is selected before generating a topic for it
    if (!activeGameId) {
      alert("Please select a game before generating a topic.");
      return;
    }
  
    setIsGeneratingTopic(true);
    try {
      const topic = await generateDebateTopic();
      // Set the generated topic into the input field, ready to be saved
      setNewTopic(topic); 
    } catch (error) {
      console.error("Failed to generate topic:", error);
      actions.setError("Could not generate a topic right now.");
    } finally {
      setIsGeneratingTopic(false);
    }
  };
  const handleDeleteGame = async (gameId) => {
    // Simple confirmation to prevent accidental deletion
    if (window.confirm("Are you sure you want to delete this game? This cannot be undone.")) {
      try {
        await deleteGame(activeClassroom.id, gameId);
        // If the deleted game was the active one, clear the selection
        if (activeGameId === gameId) {
          setActiveGameId(null);
          setActiveGame(null);
        }
      } catch (error) {
        console.error("Error deleting game:", error);
        actions.setError("Failed to delete the game.");
      }
    }
  };
  const handleRejoinSession = async () => {
    if (!rejoinPassword.trim()) {
      actions.setError("Please enter a session password.");
      return;
    }
  
    actions.setLoading(true);
    try {
      const classroom = await getClassroomByPassword(rejoinPassword.trim());
      if (classroom) {
        // If found, load it into state and save to localStorage
        setActiveClassroom(classroom);
        actions.setClassroom(classroom);
        localStorage.setItem('currentClassroom', JSON.stringify(classroom));
        setView('classroom'); // Switch to the main classroom view
      } else {
        actions.setError("No classroom found with that password.");
      }
    } catch (error) {
      console.error("Rejoin error:", error);
      actions.setError("Failed to rejoin the session.");
    } finally {
      actions.setLoading(false);
    }
  };

  if (state.isLoading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (view === 'setup') {
    return (
      <div className="admin-dashboard">
        <ClassroomSetup 
          onClassroomCreated={handleCreateClassroom}
          onBack={() => setView('dashboard')}
        />
      </div>
    );
  }
  if (view === 'rejoin') {
    return (
      <div className="admin-dashboard">
        <div className="rejoin-card card">
          <h2>Rejoin Session</h2>
          <p>Enter the session password to get back to your classroom.</p>
          {state.error && <div className="error-message">{state.error}</div>}
          <form onSubmit={(e) => { e.preventDefault(); handleRejoinSession(); }}>
            <input
              type="text"
              className="form-input"
              placeholder="Enter session password"
              value={rejoinPassword}
              onChange={(e) => setRejoinPassword(e.target.value)}
            />
            <div className="action-buttons">
              <button type="button" className="btn-secondary" onClick={() => setView('dashboard')}>Back</button>
              <button type="submit" className="btn-primary">Rejoin</button>
            </div>
          </form>
        </div>
      </div>
    );
  }
  
  if (view === 'classroom' && activeClassroom) {
    return (
      <div className="admin-dashboard">
 {/* Classroom Header */}
    <div className="classroom-header card">
              <div className="classroom-info">
                <h2>{activeClassroom.name}</h2>
                <div className="classroom-meta">
                  <div className="password-display">
                    <span>Session Password: </span>
                    <div className="password-field">
                      <code className={showPassword ? 'visible' : 'hidden'}>
                        {showPassword ? activeClassroom.password : '••••••'}
                      </code>
                      <button 
                        className="toggle-password"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                  </div>
                  <div className="session-info">
                    ID: {activeClassroom.id?.slice(-6)} • Created by {activeClassroom.adminName}
                  </div>
                </div>
              </div>
              <button className="new-session-btn btn-secondary" onClick={handleNewClassroom}>
                <Plus size={16} />
                New Session
              </button>
            </div>

        {isDataLoading ? (
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading classroom data...</p>
        </div>
      ) : (
        <>
        {/* New Game Management Card */}
        <div className="game-management card">
          <h3>Breakout Games</h3>
          <button
            className="btn-primary"
            onClick={() => setIsCreateGameModalOpen(true)}
          >
            <Plus size={16} /> Create New Game
          </button>
  
          <div className="games-list">
            {games.length > 0 ? (
              games.map(game => (
                <div
                  key={game.id}
                  className={`game-item ${activeGameId === game.id ? 'active' : ''}`}
                  onClick={() => handleSelectGame(game)}
                >
                  <span className="game-name">{game.gameName}</span>
                  <span className={`game-status ${game.status}`}>{game.status}</span>
                  <button 
        className="delete-game-btn" 
        onClick={() => handleDeleteGame(game.id)}
      >
        <Trash2 size={16} />
      </button>
                </div>
                
              ))
            ) : (
              <p>No games created yet. Click "Create New Game" to start.</p>
            )}
          </div>
        </div>
  
        {/* This will render the modal popup when isCreateGameModalOpen is true */}
        {isCreateGameModalOpen && (
          <CreateGameModal
            teamA={state.teamA}
            teamB={state.teamB}
            onCreate={handleCreateGame}
            onCancel={() => setIsCreateGameModalOpen(false)}
          />
        )}
  
        {/* Updated Debate Control Card - only shows if a game is selected */}
        {activeGame && (
          <div className="debate-control card">
          <h3>Controls for: "{activeGame.gameName}"</h3>
          
          <div className="active-speakers">
          <h4>Currently Debating:</h4>
          <div className="speaker-lists">
            <div>
              <strong>Team A:</strong>
              <span>{activeGame.teamAPlayers.map(p => p.name).join(', ')}</span>
            </div>
            <div>
              <strong>Team B:</strong>
              <span>{activeGame.teamBPlayers.map(p => p.name).join(', ')}</span>
            </div>
          </div>
        </div>
        {activeGame.status === 'live' && <TimerDisplay />} {/* This will now show the active game's timer */}
  
            <div className="topic-management">
              <strong>Topic:</strong> {activeGame.topic}
              <form onSubmit={(e) => { e.preventDefault(); handleUpdateTopic(); }} className="topic-form">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter new topic..."
                  value={newTopic}
                  onChange={(e) => setNewTopic(e.target.value)}
                />
            <button type="button" onClick={handleGenerateTopic} disabled={isGeneratingTopic}>
                {isGeneratingTopic ? 'Generating...' : '✨ Suggest Topic'}
              </button>
              <button type="submit">Update</button>              
              </form>
            </div>
            {activeGame.status === 'live' && (
            <div className="active-debate">
              <div className="vote-display">
                <div className="vote-item">
                  <span>Switch Sides:</span>
                  <span className="vote-count">{activeGame.votes.switch}</span>
                </div>
                <div className="vote-item">
                  <span>Keep Current:</span>
                  <span className="vote-count">{activeGame.votes.dontSwitch}</span>
                </div>
              </div>
  
              <div className="main-controls">
              {activeGame.status === 'waiting' && (
                <button onClick={handleStartGame} className="btn-success" disabled={activeGame.status === 'live'}>
                  <Play size={16} /> Start Game
                </button>
              )}
                <button onClick={handleSwitchSides} className="btn-primary">
                  <RotateCcw size={16} /> Switch Sides
                </button>
              </div>
  
              <div className="timer-controls">
                <div className="timer-input-group">
                  <label htmlFor="timer-minutes">Set Time (min):</label>
                  <input
                    type="number"
                    id="timer-minutes"
                    value={timerMinutes}
                    onChange={(e) => setTimerMinutes(Number(e.target.value))}
                    className="timer-input"
                  />
                </div>
                <button onClick={handleTimerStart} className="btn-primary">Start</button>
                <button onClick={handleTimerPause} className="btn-secondary">Pause</button>
                <button onClick={handleTimerReset} className="btn-danger">Reset</button>
              </div>
            </div>
          )}
          </div>
        )}
         {/* Student Management - Auto-Assigned Teams */}
         <div className="team-management card">
          <h3>
            <Users size={20} />
            Auto-Assigned Teams
          </h3>
          
          <div className="team-info">
            <p className="team-description">
              Students are automatically assigned to balanced teams when they register. 
              Total students: <strong>{students.length}</strong>
            </p>
          </div>

          {/* Teams Display */}
          <div className="teams-display">
            <div className="team-section">
              <h4>Team A ({state.teamA.length} students)</h4>
              <ul className="team-list">
                {state.teamA.map((student, index) => (
                  <li key={student.admissionNumber || index} className="team-member">
                    <div className="student-info">
                      <span className="student-name">{student.name}</span>
                      <span className="student-id">ID: {student.admissionNumber}</span>
                      <span className="join-time">
                      Joined: {isClient ? new Date(student.joinedAt).toLocaleTimeString() : '...'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(student.admissionNumber)}
                      className="remove-btn"
                      title="Remove student"
                    >
                      ×
                    </button>
                  </li>
                ))}
                {state.teamA.length === 0 && (
                  <li className="no-members">No students assigned yet</li>
                )}
              </ul>
            </div>

            <div className="team-section">
              <h4>Team B ({state.teamB.length} students)</h4>
              <ul className="team-list">
                {state.teamB.map((student, index) => (
                  <li key={student.admissionNumber || index} className="team-member">
                    <div className="student-info">
                      <span className="student-name">{student.name}</span>
                      <span className="student-id">ID: {student.admissionNumber}</span>
                      <span className="join-time">
                        Joined: {new Date(student.joinedAt).toLocaleTimeString()||'...'}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveStudent(student.admissionNumber)}
                      className="remove-btn"
                      title="Remove student"
                    >
                      ×
                    </button>
                  </li>
                ))}
                {state.teamB.length === 0 && (
                  <li className="no-members">No students assigned yet</li>
                )}
              </ul>
            </div>
          </div>

          {students.length > 0 && (
            <div className="team-actions">
              <div className="balance-info">
                <span>Team Balance: </span>
                <span className={Math.abs(state.teamA.length - state.teamB.length) <= 1 ? 'balanced' : 'unbalanced'}>
                  {Math.abs(state.teamA.length - state.teamB.length) <= 1 ? 'Balanced' : 'Needs Balancing'}
                </span>
              </div>
              <button onClick={handleClearAllTeams} className="btn-danger">
                <Trash2 size={16} />
                Clear All Students
              </button>
            </div>
          )}
        </div>
        {/* Instructions */}
        <div className="instructions card">
          <h3>📋 Instructions</h3>
          <ul>
            <li><strong>Share the password:</strong> Students use "{activeClassroom.password}" to join</li>
            <li><strong>Auto-assignment:</strong> Students are automatically balanced between teams</li>
            <li><strong>Student registration:</strong> Each student provides name and admission number</li>
            <li><strong>Remove students:</strong> Click the × next to any student to remove them</li>
            <li><strong>Start when ready:</strong> Both teams need at least one student to begin</li>
          </ul>
        </div>
        </>
      )}
      </div>
    );
  }

  // Default dashboard view
  return (
    <div className="admin-dashboard">
      <div className="welcome-section">
        <div className="welcome-card card">
          <h2>Welcome to Admin Dashboard</h2>
          <p>Create and manage debate sessions with automatic student team assignment</p>
          
          <div className="action-buttons">
            <button
              onClick={() => setView('setup')}
              className="btn-primary large"
            >
              <Plus size={20} />
              Create New Classroom Session
            </button>
            <button
            onClick={() => setView('rejoin')}
            className="btn-secondary large"
          >
            <Users size={20} />
            Rejoin Existing Session
          </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;