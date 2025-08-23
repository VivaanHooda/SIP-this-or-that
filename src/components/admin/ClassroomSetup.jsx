import React, { useState } from 'react';
import { ArrowLeft, Plus, RefreshCw, Copy, Check } from 'lucide-react';
import { generateDebatePassword, generateDebateTopic } from '../../services/geminiService';
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
  const [copied, setCopied] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
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
  const handleGenerateTopic = async () => {
    const topic = await generateDebateTopic();
    setFormData(prev => ({ ...prev, topic: topic }));
  };

  const handleCopyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy password:', error);
    }
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter a classroom name');
      return false;
    }
    if (!formData.adminName.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.topic.trim()) {
      setError('Please enter a debate topic');
      return false;
    }
    if (!password) {
      setError('Please generate a session password');
      return false;
    }
    return true;
  };

  const handleCreateClassroom = async () => {
    if (!validateForm()) return;

    setIsCreating(true);
    setError('');

    try {
      await onClassroomCreated({
        ...formData,
        password: password,
      });
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
          <ArrowLeft size={20} />
          Back
        </button>
        <h2>Create New Classroom Session</h2>
        <p className="setup-description">
          Set up a new debate session for your students
        </p>
      </div>

      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <div className="setup-form">
        <div className="form-section">
          <h3>Classroom Details</h3>
          
          <div className="form-group">
            <label htmlFor="name">Classroom Name *</label>
            <input
              id="name"
              name="name"
              type="text"
              className="classroom-input"
              value={formData.name}
              onChange={handleInputChange}
              placeholder="e.g., CV 309"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="adminName">Your Name *</label>
            <input
              id="adminName"
              name="adminName"
              type="text"
              className="classroom-input"
              value={formData.adminName}
              onChange={handleInputChange}
              placeholder="e.g., Alice Johnson, John Doe"
              required
            />
          </div>

          <div className="form-group">
          <label htmlFor="topic">Initial Debate Topic *</label>
          
          {/* 👇 Wrap your textarea and the new button in this div 👇 */}
          <div className="input-with-button">
            <textarea
              id="topic"
              name="topic"
              className="classroom-input topic-input" // Your existing classes
              value={formData.topic}
              onChange={handleInputChange}
              placeholder="Enter an engaging debate topic..."
              rows={3}
              required
            />
            
            {/* 👇 Add the new button here 👇 */}
            <button type="button" className="generate-btn" onClick={handleGenerateTopic}>
              ✨ Generate
            </button>
          </div>
        </div>
        </div>

        <div className="form-section">
          <h3>Session Security</h3>
          
          <div className="password-section">
            <label>Session Password *</label>
            <div className="password-generator">
              <button
                type="button"
                className="generate-btn"
                onClick={handleGeneratePassword}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <div className="loading-spinner small"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <RefreshCw size={16} />
                    Generate Password
                  </>
                )}
              </button>
              
              {showPassword && password && (
                <div className="generated-password">
                  <span className="password-text">{password}</span>
                  <button 
                    type="button"
                    className="copy-btn" 
                    onClick={handleCopyPassword}
                    title="Copy to clipboard"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              )}
            </div>
            <p className="password-info">
              Students will use this password to join your debate session. 
              Make sure to share it with them once the session is created.
            </p>
          </div>
        </div>
      </div>

      <div className="setup-tips">
        <h3>💡 Setup Tips</h3>
        <ul>
          <li><strong>Classroom Name:</strong> Choose something students will recognize (e.g., "Period 3 English")</li>
          <li><strong>Password Security:</strong> The generated password is unique and easy to remember</li>
          <li><strong>Topic Selection:</strong> Pick controversial but appropriate topics that encourage debate</li>
          <li><strong>Team Management:</strong> You can add students to teams after creating the session</li>
        </ul>
      </div>

      <div className="setup-actions">
        <button
          className="create-classroom-btn"
          onClick={handleCreateClassroom}
          disabled={isCreating || !password || !formData.name.trim() || !formData.adminName.trim()}
        >
          {isCreating ? (
            <>
              <div className="loading-spinner small"></div>
              Creating Session...
            </>
          ) : (
            <>
              <Plus size={18} />
              Create Classroom Session
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default ClassroomSetup;
