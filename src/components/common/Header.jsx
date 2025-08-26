"use client";
import React from 'react';
import { LogOut, Users, User, Hash } from 'lucide-react';
import './Header.css';

function Header({ userRole, currentClassroom, currentStudent, onLogout }) {
  // Don't show header on landing page
  if (!userRole) return null;

  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-left">
          <h1 className="app-title">This Or That</h1>
          <span className="app-tagline">Speak. Listen. Convince.</span>
        </div>

        <div className="header-center">
          {userRole === 'admin' && (
            <div className="admin-info">
              <span className="role-badge admin">
                Admin Dashboard
              </span>
              {currentClassroom && (
                <div className="classroom-info">
                  <span className="classroom-name">{currentClassroom.name}</span>
                  <span className="classroom-password">
                    Password: <strong>{currentClassroom.password}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {userRole === 'spectator' && currentClassroom && (
            <div className="spectator-info">
              <span className="role-badge spectator">
                <Users size={16} />
                Student View
              </span>
              <div className="session-details">
                <div className="classroom-info">
                  <span className="classroom-name">{currentClassroom.name}</span>
                  <span className="session-status">Live Session</span>
                </div>
                {currentStudent && (
                  <div className="student-info">
                    <div className="student-name">
                      <User size={14} />
                      {currentStudent.name}
                    </div>
                    <div className="student-details">
                      <span className="admission-number">
                        <Hash size={12} />
                        {currentStudent.admissionNumber}
                      </span>
                      {currentStudent.assignedTeam && (
                        <span className={`team-indicator team-${currentStudent.assignedTeam.toLowerCase()}`}>
                          Team {currentStudent.assignedTeam}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="header-right">
          <button 
            className="logout-btn btn-danger"
            onClick={onLogout}
            title={userRole === 'admin' ? 'End Session' : 'Leave Session'}
          >
            <LogOut size={18} />
            {userRole === 'admin' ? 'End Session' : 'Leave'}
          </button>
        </div>
      </div>
    </header>
  );
}

export default Header;