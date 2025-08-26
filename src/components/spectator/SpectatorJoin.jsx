import React, { useState } from 'react';
import { ArrowLeft, Users, Key, AlertCircle } from 'lucide-react';
import { getClassroomByPassword, getStudent } from '../../services/debateService';
import StudentRegistration from './StudentRegistration';
import './SpectatorJoin.css';

function SpectatorJoin({ onJoin, onBack }) {
  const [password, setPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const [classroom, setClassroom] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [returningStudent, setReturningStudent] = useState(null);


  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter a session password');
      return;
    }

    setIsJoining(true);
    setError('');

    try {
      const foundClassroom = await getClassroomByPassword(password.trim());
      
      if (!foundClassroom) {
        setError('Invalid session password. Please check with the volunteer.');
        return;
      }
      const savedDetails = localStorage.getItem(`student_details_${foundClassroom.id}`);
    if (savedDetails) {
      // If details are found, show the quick rejoin prompt
      setReturningStudent(JSON.parse(savedDetails));
    } else {
      // If no details are found, show the normal registration form
      setClassroom(foundClassroom);
      setShowRegistration(true);
    }
      if (!foundClassroom.isActive) {
        setError('This debate session is no longer active.');
        return;
      }

      setClassroom(foundClassroom);
      setShowRegistration(true);
    } catch (error) {
      console.error('Join session error:', error);
      setError('Failed to join session. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  const handleRegistrationComplete = (studentData) => {
    // Pass both classroom and student data to the parent component
    onJoin(classroom, studentData);
  };

  const handleBackFromRegistration = () => {
    setShowRegistration(false);
    setClassroom(null);
    setPassword('');
  };
  if (returningStudent) {
    return (
      <div className="spectator-join">
        <div className="join-container card">
          <div className="join-header">
            <h2>Welcome Back, {returningStudent.name}!</h2>
            <p>Are you trying to rejoin the session?</p>
          </div>
          <div className="action-buttons">
            <button 
              className="btn-secondary" 
              onClick={() => setReturningStudent(null)}
            >
              No, I'm a different student
            </button>
            <button 
              className="btn-primary" 
              onClick={() => onJoin(classroom, returningStudent)}
            >
              Yes, Rejoin Now
            </button>
          </div>
        </div>
      </div>
    );
  }
  // Show registration form if classroom is found
  if (showRegistration && classroom) {
    return (
      <StudentRegistration
        classroom={classroom}
        onRegistrationComplete={handleRegistrationComplete}
        onBack={handleBackFromRegistration}
      />
    );
  }

  // Show password entry form
  return (
    <div className="spectator-join">
      <div className="join-container card">
        <div className="join-header">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
            Back
          </button>
          
          <div className="join-title">
            <div className="title-icon">
              <Users size={32} />
            </div>
            <h2>Join Debate Session</h2>
            <p>Enter the password provided by the volunteer to join the live debate</p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={16} />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="join-form">
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              <Key size={18} />
              Session Password
            </label>
            <input
              type="text"
              id="password"
              className="password-input form-input"
              placeholder="Enter session password :"
              value={password}
              onChange={handlePasswordChange}
              autoFocus
              required
            />
            <div className="input-help">
              Ask the volunteer for the session password
            </div>
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="join-btn btn-primary"
              disabled={isJoining || !password.trim()}
            >
              {isJoining ? (
                <>
                  <div className="loading-spinner small"></div>
                  Verifying Password...
                </>
              ) : (
                <>
                  <Users size={18} />
                  Continue to Registration
                </>
              )}
            </button>
          </div>
        </form>

        <div className="join-help">
          <div className="help-section">
            <h4>How to Join</h4>
            <div className="help-steps">
              <div className="help-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <strong>Get Password</strong>
                  <p>The Volunteer will provide a unique session password</p>
                </div>
              </div>
              <div className="help-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <strong>Enter Your Details</strong>
                  <p>Provide your name and admission number for registration</p>
                </div>
              </div>
              <div className="help-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <strong>Auto Team Assignment</strong>
                  <p>You'll be automatically assigned to a balanced team</p>
                </div>
              </div>
              <div className="help-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <strong>Start Debating</strong>
                  <p>Participate in live debates and vote on arguments</p>
                </div>
              </div>
            </div>
          </div>

          <div className="help-section">
            <h4>What You Can Do</h4>
            <ul className="feature-list">
              <li>Join automatically balanced teams</li>
              <li>View live debate topics and discussions</li>
              <li>Vote on whether teams should switch sides</li>
              <li>See real-time vote counts and participation</li>
              <li>The volunteer can see your engagement</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpectatorJoin;