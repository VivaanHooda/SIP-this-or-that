import React, { useState } from 'react';
import { ArrowLeft, Shield, User, Building } from 'lucide-react';
import './AdminLogin.css';

function AdminLogin({ onAuth, onBack }) {
  const [formData, setFormData] = useState({
    name: '',
    schoolName: '',
    accessCode: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('Please enter your name');
      return false;
    }
    if (!formData.schoolName.trim()) {
      setError('Please enter your school/organization name');
      return false;
    }
    if (!formData.accessCode.trim()) {
      setError('Please enter the admin access code');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      // Simple access code validation
      // In a real app, this would be validated against a backend
      const validCodes = ['TEACHER2024', 'ADMIN123', 'EDUCATOR'];
      
      if (!validCodes.includes(formData.accessCode.toUpperCase())) {
        setError('Invalid access code. Please check with your administrator.');
        return;
      }

      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      const adminData = {
        name: formData.name.trim(),
        schoolName: formData.schoolName.trim(),
        accessCode: formData.accessCode.toUpperCase(),
        loginTime: new Date().toISOString()
      };

      onAuth(adminData);
    } catch (error) {
      console.error('Admin login error:', error);
      setError('Login failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="admin-login">
      <div className="login-container card">
        <div className="login-header">
          <button className="back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
            Back
          </button>
          
          <div className="login-title">
            <div className="title-icon">
              <Shield size={32} />
            </div>
            <h2>Volunteer Login</h2>
            <p>Access the admin dashboard to manage debate sessions</p>
          </div>
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              <User size={16} />
              Your Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="e.g., Ms. Johnson"
              value={formData.name}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="schoolName" className="form-label">
              <Building size={16} />
              School/Organization
            </label>
            <input
              type="text"
              id="schoolName"
              name="schoolName"
              className="form-input"
              placeholder="e.g., Lincoln High School"
              value={formData.schoolName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="accessCode" className="form-label">
              <Shield size={16} />
              Admin Access Code
            </label>
            <input
              type="password"
              id="accessCode"
              name="accessCode"
              className="form-input"
              placeholder="Enter your access code"
              value={formData.accessCode}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              className="login-btn btn-success"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner small"></div>
                  Authenticating...
                </>
              ) : (
                'Login as Voluneteer'
              )}
            </button>
          </div>
        </form>

        <div className="login-help">
          <div className="help-section">
            <h4>Demo Access Codes</h4>
            <div className="demo-codes">
              <code>TEACHER2024</code>
              <code>ADMIN123</code>
              <code>EDUCATOR</code>
            </div>
          </div>
          
          <div className="help-section">
            <h4>Need Help?</h4>
            <p>
              Contact your administrator to get an access code for volunteer login.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
