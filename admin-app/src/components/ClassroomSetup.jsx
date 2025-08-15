// admin-app/src/components/ClassroomSetup.jsx
import React, { useState } from 'react';
import { generateDebatePassword, createClassroom } from '../services/geminiService';
import './ClassroomSetup.css';

function ClassroomSetup({ onClassroomCreated, onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    adminName: '',
    topic: 'Is technology making us less social?'
  });
  const [password, setPassword] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user types
  };

  const handleGeneratePassword = async () => {
    setIsGenerating(true);
    setError('');
    
    try {
      const generatedPassword = await generateDebatePassword();
      setPassword(generatedPassword);
      setShowPassword(true);
    } catch (error) {
      setError('Failed to generate password. Please try again.');
      console.error('Password generation error:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(password);
    alert('Password copied to clipboard!');
  };

  const handleCreateClassroom = async () => {
    setIsCreating(true);
    setError('');

    try {
      const newClassroom = await createClassroom({
        ...formData,
        password: password,
      });
      onClassroomCreated(newClassroom);
    } catch (error) {
      setError('Failed to create classroom. Please try again.');
      console.error('Classroom creation error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="classroom-setup">
      <div className="setup-header">
        <button onClick={onBack} className="back-btn">
          ← Back
        </button>
        <h2>Create a New Classroom</h2>
        <p className="setup-description">
          Fill in the details to start your debate session
        </p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="setup-form">
        <div className="form-group">
          <label htmlFor="name">Classroom Name</label>
          <input
            id="name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="e.g., Debate 101"
          />
        </div>
        <div className="form-group">
          <label htmlFor="adminName">Your Name</label>
          <input
            id="adminName"
            name="adminName"
            type="text"
            value={formData.adminName}
            onChange={handleInputChange}
            placeholder="e.g., Jane Doe"
          />
        </div>
        <div className="form-group">
          <label htmlFor="topic">Debate Topic</label>
          <textarea
            id="topic"
            name="topic"
            value={formData.topic}
            onChange={handleInputChange}
            placeholder="Enter the debate topic..."
          />
        </div>
        <div className="form-group">
          <label>Session Password</label>
          <div className="password-controls">
            <button
              className="generate-btn"
              onClick={handleGeneratePassword}
              disabled={isGenerating}
            >
              {isGenerating ? 'Generating...' : 'Generate Password'}
            </button>
            
            {showPassword && password && (
              <div className="generated-password">
                <span className="password-text">{password}</span>
                <button className="copy-btn" onClick={handleCopyPassword}>
                  📋
                </button>
              </div>
            )}
          </div>
          <p className="password-info">
            Students will use this password to join your debate session
          </p>
        </div>
      </div>

      <div className="setup-tips">
        <h3>💡 Setup Tips</h3>
        <ul>
          <li>Share the generated password with your students</li>
          <li>Each classroom has its own unique debate session</li>
          <li>You can manage teams and topics after creating the classroom</li>
          <li>Students can only access the debate with the correct password</li>
        </ul>
      </div>

      <div className="setup-actions">
        <button
          className="create-classroom-btn"
          onClick={handleCreateClassroom}
          disabled={isCreating || !password}
        >
          {isCreating ? 'Creating Classroom...' : 'Create Classroom'}
        </button>
      </div>
    </div>
  );
}

export default ClassroomSetup;