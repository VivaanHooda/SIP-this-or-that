import React, { useState } from 'react';
import { getClassroomByPassword } from '../services/geminiService';
import './PasswordEntry.css';

function PasswordEntry({ onPasswordValid, onBack }) {
  const [password, setPassword] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState('');

  const handlePasswordChange = (e) => {
    setPassword(e.target.value);
    setError(''); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Please enter a password.');
      return;
    }

    setIsValidating(true);
    setError('');

    try {
      const classroom = await getClassroomByPassword(password.trim());
      
      if (!classroom) {
        setError('Invalid password. Please check with your teacher.');
        return;
      }

      if (!classroom.isActive) {
        setError('This debate session is no longer active.');
        return;
      }

      // Store classroom info in localStorage for persistence
      localStorage.setItem('currentClassroom', JSON.stringify(classroom));
      
      onPasswordValid(classroom);
    } catch (error) {
      console.error('Password validation error:', error);
      setError('Failed to validate password. Please try again.');
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <div className="password-entry">
      <div className="entry-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Join Debate Session</h2>
        <p>Enter the password provided by your teacher</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="password-form">
        <div className="form-group">
          <label htmlFor="password">Classroom Password</label>
          <input
            type="text"
            id="password"
            className="password-input"
            placeholder="Enter password (e.g., rhetoric42)"
            value={password}
            onChange={handlePasswordChange}
            autoFocus
            required
          />
        </div>

        <div className="form-actions">
          <button
            type="submit"
            className="join-btn"
            disabled={isValidating || !password.trim()}
          >
            {isValidating ? 'Joining...' : 'Join Debate'}
          </button>
        </div>
      </form>

      <div className="entry-tips">
        <h3>💡 How to Join</h3>
        <ul>
          <li>Ask your teacher for the classroom password</li>
          <li>Enter the password exactly as provided</li>
          <li>You'll be able to see the debate topic and teams</li>
          <li>Vote on whether teams should switch sides</li>
        </ul>
      </div>
    </div>
  );
}

export default PasswordEntry;
