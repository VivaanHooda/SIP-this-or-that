import React from 'react';
import { Users, UserCheck } from 'lucide-react';
import './LandingPage.css';

function LandingPage({ onRoleSelect }) {
  return (
    <div className="landing-page">
      <div className="landing-header">
        <h1>This Or That</h1>
        <p className="tagline">Speak. Listen. Convince.</p>
        <p className="description">
          An interactive debate platform for classrooms and educational settings
        </p>
      </div>

      <div className="role-selection">
        <div className="role-cards">
          {/* Spectator Card */}
          <div className="role-card spectator-card" onClick={() => onRoleSelect('spectator')}>
            <div className="card-icon">
              <Users size={48} />
            </div>
            <h3>Join as Student</h3>
            <p>
              Participate in live debates, vote on arguments, and engage in classroom discussions
            </p>
            <ul className="feature-list">
              <li>Join debates with a password</li>
              <li>Vote on team performance</li>
              <li>Real-time participation</li>
              <li>See live vote counts</li>
            </ul>
            <button className="role-btn btn-primary">
              Join Debate Session
            </button>
          </div>

          {/* Admin Card */}
          <div className="role-card admin-card" onClick={() => onRoleSelect('admin')}>
            <div className="card-icon">
              <UserCheck size={48} />
            </div>
            <h3>Login as Teacher</h3>
            <p>
              Create and manage debate sessions, organize teams, and moderate discussions
            </p>
            <ul className="feature-list">
              <li>Create debate sessions</li>
              <li>Manage student teams</li>
              <li>Set debate topics</li>
              <li>Control debate flow</li>
            </ul>
            <button className="role-btn btn-success">
              Volunteer Login
            </button>
          </div>
        </div>
      </div>

      <div className="landing-features">
        <div className="feature-grid">
          <div className="feature-item">
            <h4>🎯 Real-time Debates</h4>
            <p>Experience live, interactive debate sessions with instant feedback and voting</p>
          </div>
          <div className="feature-item">
            <h4>👥 Team Management</h4>
            <p>Organize students into debate teams with easy-to-use admin controls</p>
          </div>
          <div className="feature-item">
            <h4>📊 Live Analytics</h4>
            <p>Track participation, votes, and engagement in real-time</p>
          </div>
          <div className="feature-item">
            <h4>🔒 Secure Access</h4>
            <p>Password-protected sessions ensure only authorized participants can join</p>
          </div>
        </div>
      </div>

      <footer className="landing-footer">
        <p>Built for educators, designed for engagement</p>
      </footer>
    </div>
  );
}

export default LandingPage;
