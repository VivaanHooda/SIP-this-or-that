import React, { useState } from 'react';
import { generateDebatePassword, createClassroom, validatePassword } from '../services/geminiService';
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
    // You could add a toast notification here
  };

  const handleCreateClassroom = async () => {
    if (!formData.name.trim() || !formData.adminName.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (!password) {
      setError('Please generate a password for the classroom.');
      return;
    }

    if (!validatePassword(password)) {
      setError('Password must be between 6 and 20 characters.');
      return;
    }

    setIsCreating(true);
    setError('');

    try {
      const classroomData = {
        name: formData.name.trim(),
        adminName: formData.adminName.trim(),
        topic: formData.topic.trim(),
        password: password
      };

      const classroom = await createClassroom(classroomData);
      
      // Store classroom info in localStorage for persistence
      localStorage.setItem('currentClassroom', JSON.stringify(classroom));
      
      onClassroomCreated(classroom);
    } catch (error) {
      setError(error.message || 'Failed to create classroom. Please try again.');
      console.error('Classroom creation error:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="classroom-setup">
      <div className="setup-header">
        <button className="back-btn" onClick={onBack}>
          ← Back
        </button>
        <h2>Create New Classroom</h2>
        <p>Set up a new debate session for your students</p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="setup-form">
        <div className="form-group">
          <label htmlFor="name">Classroom Name *</label>
          <input
            type="text"
            id="name"
            name="name"
            className="classroom-input"
            placeholder="e.g., English 101 - Period 3"
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="adminName">Admin Name *</label>
          <input
            type="text"
            id="adminName"
            name="adminName"
            className="classroom-input"
            placeholder="e.g., Ms. Johnson"
            value={formData.adminName}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="topic">Default Debate Topic</label>
          <input
            type="text"
            id="topic"
            name="topic"
            className="classroom-input"
            placeholder="e.g., Is technology making us less social?"
            value={formData.topic}
            onChange={handleInputChange}
          />
        </div>

        <div className="password-section">
          <label>Classroom Password *</label>
          <div className="password-generator">
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
