import React, { useState, useEffect } from 'react';
import { Plus, Settings, Users, Play, RotateCcw, Eye, EyeOff, Trash2 } from 'lucide-react';
import { useDebate } from '../../context/DebateContext';
import { updateTimer } from '../../services/debateService';
import TimerDisplay from '../spectator/TimerDisplay';
import {
  createClassroom,
  generateDebatePassword,
  updateClassroom,
  generateDebateTopic
} from '../../services/geminiService';
import {
  updateTopic,
  startDebate,
  switchSides,
  getDebateData,
  getTeams,
  removeStudentFromTeam,
  clearAllTeams,
  getClassroomStudents
} from '../../services/debateService';

import ClassroomSetup from './ClassroomSetup';
import './AdminDashboard.css';


function AdminDashboard() {
  const { state, actions } = useDebate();
  const [view, setView] = useState('dashboard'); // 'dashboard', 'setup', 'classroom'
  const [activeClassroom, setActiveClassroom] = useState(null);
  const [newTopic, setNewTopic] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [students, setStudents] = useState([]);
  const [timerMinutes, setTimerMinutes] = useState(5);

  // Load saved classroom on mount
  useEffect(() => {
    const savedClassroom = localStorage.getItem('currentClassroom');
    if (savedClassroom) {
      const classroom = JSON.parse(savedClassroom);
      setActiveClassroom(classroom);
      actions.setClassroom(classroom);
      setView('classroom');
      loadClassroomData(classroom.id);
    }
  }, []);

  const loadClassroomData = async (classroomId) => {
    try {
      actions.setLoading(true);
      
      const [debateData, teamsData, studentsData] = await Promise.all([
        getDebateData(classroomId),
        getTeams(classroomId),
        getClassroomStudents(classroomId)
      ]);

      if (debateData) {
        actions.setTopic(debateData.topic);
        actions.setVotes(debateData.votes || { switch: 0, dontSwitch: 0 });
        actions.setSpeakingFor(debateData.speakingFor || 'A');
        actions.setDebateStarted(debateData.debateStarted || false);
      }

      if (teamsData) {
        actions.setTeams(teamsData);
      }

      setStudents(studentsData || []);
      actions.setLoading(false);
    } catch (error) {
      console.error('Error loading classroom data:', error);
      actions.setError('Failed to load classroom data');
    }
  };

  const handleCreateClassroom = async (classroomData) => {
    try {
      actions.setLoading(true);
      const classroom = await createClassroom(classroomData);
      
      setActiveClassroom(classroom);
      actions.setClassroom(classroom);
      localStorage.setItem('currentClassroom', JSON.stringify(classroom));
      
      setView('classroom');
      await loadClassroomData(classroom.id);
    } catch (error) {
      console.error('Error creating classroom:', error);
      actions.setError('Failed to create classroom');
    }
  };

  const handleUpdateTopic = async () => {
    if (!newTopic.trim() || !activeClassroom) return;
    
    try {
      await updateTopic(activeClassroom.id, newTopic.trim());
      actions.setTopic(newTopic.trim());
      setNewTopic('');
    } catch (error) {
      console.error('Error updating topic:', error);
      actions.setError('Failed to update topic');
    }
  };

  const handleStartDebate = async () => {
    if (!activeClassroom) return;
    
    try {
      await startDebate(activeClassroom.id);
      actions.setDebateStarted(true);
      actions.setVotes({ switch: 0, dontSwitch: 0 });
    } catch (error) {
      console.error('Error starting debate:', error);
      actions.setError('Failed to start debate');
    }
  };

  const handleSwitchSides = async () => {
    if (!activeClassroom) return;
    
    try {
      await switchSides(activeClassroom.id);
      const newSide = state.speakingFor === 'A' ? 'B' : 'A';
      actions.setSpeakingFor(newSide);
      actions.setVotes({ switch: 0, dontSwitch: 0 });
    } catch (error) {
      console.error('Error switching sides:', error);
      actions.setError('Failed to switch sides');
    }
  };

  const handleRemoveStudent = async (admissionNumber) => {
    if (!activeClassroom) return;
    
    try {
      await removeStudentFromTeam(activeClassroom.id, admissionNumber);
      await loadClassroomData(activeClassroom.id); // Refresh data
    } catch (error) {
      console.error('Error removing student:', error);
      actions.setError('Failed to remove student');
    }
  };

  const handleClearAllTeams = async () => {
    if (!activeClassroom) return;

    try {
      await clearAllTeams(activeClassroom.id);
      await loadClassroomData(activeClassroom.id); // Refresh data
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
    if (!activeClassroom) return;
  
    const timeInSeconds = timerMinutes * 60;
  
    await updateTimer(activeClassroom.id, timeInSeconds, true);
  };
  

  const handleTimerPause = async () => {
    if (!activeClassroom) return;
    await updateTimer(activeClassroom.id, state.timer, false); // Pause at current time
  };

  const handleTimerReset = async () => {
    if (!activeClassroom) return;
    await updateTimer(activeClassroom.id, 300, false); // Reset to 5 mins, paused
  };
  const handleGenerateTopic = async () => {
    try {
      actions.setLoading(true); // Show a loading indicator
      const topic = await generateDebateTopic();
      setNewTopic(topic); // Set the returned topic into the input field's state
    } catch (error) {
      console.error("Failed to generate topic:", error);
      actions.setError("Could not generate a topic right now.");
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

  if (view === 'classroom' && activeClassroom) {
    return (
      <div className="admin-dashboard">
        {state.error && (
          <div className="error-message">
            {state.error}
            <button onClick={() => actions.setError(null)}>×</button>
          </div>
        )}

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

        {/* Topic Management */}
        <div className="topic-management card">
          <h3>
            <Settings size={20} />
            Debate Topic
          </h3>
          <div className="current-topic">
            <strong>Current Topic:</strong> {state.topic}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); handleUpdateTopic(); }} className="topic-form">
            <input
              type="text"
              className="form-input"
              placeholder="Enter new debate topic..."
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
            />
           
            <button type="button" className="btn-secondary" onClick={handleGenerateTopic}>
              ✨ Generate Topic
            </button>

            <button type="submit" className="btn-primary" disabled={!newTopic.trim()}>
              Update Topic
            </button>
          </form>
          <div className="team-info">
            <p className="team-description">
              Enter a custom topic or use the AI-generated suggestion.
              
            </p>
          </div>
        </div>

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
                        Joined: {new Date(student.joinedAt).toLocaleTimeString()}
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
                        Joined: {new Date(student.joinedAt).toLocaleTimeString()}
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

        {/* Debate Control */}
        <div className="debate-control card">
          <h3>Debate Control</h3>
          {state.debateStarted && <TimerDisplay />}
          {!state.debateStarted ? (
            <div className="start-section">
              <p>Ready to begin the debate?</p>
              <button
                onClick={handleStartDebate}
                className="btn-success"
                disabled={state.teamA.length === 0 || state.teamB.length === 0}
              >
                <Play size={16} />
                Start Debate
              </button>
              {(state.teamA.length === 0 || state.teamB.length === 0) && (
                <p className="requirement-note">
                  Both teams need at least one student to start the debate
                </p>
              )}
            </div>
          ) : (
            <div className="active-debate">
              <div className="debate-status">
                <div className="status-indicator active">
                  <div className="status-dot"></div>
                  Debate Active
                </div>
                <div className="current-side">
                  Currently Speaking: <strong>Team {state.speakingFor}</strong>
                </div>
              </div>

              <div className="vote-display">
                <div className="vote-item">
                  <span className="vote-label">Switch Sides:</span>
                  <span className="vote-count">{state.votes.switch}</span>
                </div>
                <div className="vote-item">
                  <span className="vote-label">Keep Current:</span>
                  <span className="vote-count">{state.votes.dontSwitch}</span>
                </div>
              </div>

              <button
                onClick={handleSwitchSides}
                className="btn-primary"
              >
                <RotateCcw size={16} />
                Force Switch Sides
              </button>
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
                <button onClick={handleTimerStart} className="btn-primary">Start Timer</button>
                <button onClick={handleTimerPause} className="btn-secondary">Pause Timer</button>
                <button onClick={handleTimerReset} className="btn-danger">Reset Timer</button>
              </div>
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
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;