"use client";
import React, { useState, useEffect } from 'react'; // 👈 Add this line
import { DebateProvider } from '@/context/DebateContext.jsx';

// Components
import LandingPage from '@/components/common/LandingPage';
import AdminLogin from '@/components/admin/AdminLogin';
import AdminDashboard from '@/components/admin/AdminDashboard';
import SpectatorJoin from '@/components/spectator/SpectatorJoin';
import SpectatorView from '@/components/spectator/SpectatorView';
import Header from '@/components/common/Header';

// Styles
import '@/styles/App.css';


function AppShell() {
  const [userRole, setUserRole] = useState(null); // 'admin', 'spectator', or null
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentClassroom, setCurrentClassroom] = useState(null);
  const [currentStudent, setCurrentStudent] = useState(null); // Store student data
  const [isLoading, setIsLoading] = useState(true);

  // Safe localStorage wrapper to prevent errors
  const safeGetItem = (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        return localStorage.getItem(key);
      }
    } catch (error) {
      console.warn('localStorage access failed:', error);
    }
    return null;
  };

  const safeSetItem = (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(key, value);
      }
    } catch (error) {
      console.warn('localStorage write failed:', error);
    }
  };

  const safeRemoveItem = (key) => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn('localStorage remove failed:', error);
    }
  };

  // Check for existing session on load
  useEffect(() => {
    const checkSession = () => {
      try {
        const savedRole = safeGetItem('userRole');
        const savedClassroom = safeGetItem('currentClassroom');
        const savedStudent = safeGetItem('currentStudent');
        const savedAuth = safeGetItem('isAuthenticated');

        if (savedRole && savedAuth === 'true') {
          setUserRole(savedRole);
          setIsAuthenticated(true);
          
          if (savedClassroom) {
            try {
              const classroom = JSON.parse(savedClassroom);
              setCurrentClassroom(classroom);
            } catch (error) {
              console.warn('Failed to parse saved classroom:', error);
              // Clear corrupted data
              safeRemoveItem('currentClassroom');
            }
          }
          
          if (savedStudent) {
            try {
              const student = JSON.parse(savedStudent);
              setCurrentStudent(student);
            } catch (error) {
              console.warn('Failed to parse saved student:', error);
              // Clear corrupted data
              safeRemoveItem('currentStudent');
            }
          }
        }
      } catch (error) {
        console.error('Error checking session:', error);
        // Clear all data if there's an error
        handleLogout();
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Handle role selection from landing page
  const handleRoleSelect = (role) => {
    setUserRole(role);
  };

  // Handle admin authentication
  const handleAdminAuth = (adminData) => {
    try {
      setIsAuthenticated(true);
      safeSetItem('userRole', 'admin');
      safeSetItem('isAuthenticated', 'true');
      safeSetItem('adminData', JSON.stringify(adminData));
    } catch (error) {
      console.error('Error setting admin auth:', error);
    }
  };

  // Handle spectator classroom join with student registration
  const handleSpectatorJoin = (classroom, studentData) => {
    try {
      setIsAuthenticated(true);
      setCurrentClassroom(classroom);
      setCurrentStudent(studentData);
      safeSetItem('userRole', 'spectator');
      safeSetItem('isAuthenticated', 'true');
      safeSetItem('currentClassroom', JSON.stringify(classroom));
      safeSetItem('currentStudent', JSON.stringify(studentData));
      safeSetItem(`student_details_${classroom.id}`, JSON.stringify(studentData));
    } catch (error) {
      console.error('Error setting spectator session:', error);
    }
  };

  // Handle logout/back to landing
  const handleLogout = () => {
    setUserRole(null);
    setIsAuthenticated(false);
    setCurrentClassroom(null);
    setCurrentStudent(null);
    
    // Clear localStorage safely
    const keysToRemove = [
      'userRole',
      'isAuthenticated', 
      'currentClassroom',
      'currentStudent',
      'adminData'
    ];
    
    keysToRemove.forEach(key => {
      safeRemoveItem(key);
    });
    
    // Clear any voting history
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('voted_')) {
            safeRemoveItem(key);
          }
        });
      }
    } catch (error) {
      console.warn('Error clearing vote history:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="app-container">
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

// In AppShell.jsx, replace the entire return statement with this:

return (
    <DebateProvider>
      <div className="app-container">
        <Header 
          userRole={userRole}
          currentClassroom={currentClassroom}
          currentStudent={currentStudent}
          onLogout={handleLogout}
        />
        
        {/* Simplified conditional rendering based on your existing logic */}
        {(() => {
          if (isAuthenticated) {
            if (userRole === 'admin') {
              return <AdminDashboard />;
            }
            if (userRole === 'spectator') {
              return <SpectatorView classroom={currentClassroom} student={currentStudent} />;
            }
          }

          if (userRole === 'admin') {
            return <AdminLogin onAuth={handleAdminAuth} onBack={handleLogout} />;
          }

          if (userRole === 'spectator') {
            return <SpectatorJoin onJoin={handleSpectatorJoin} onBack={handleLogout} />;
          }

          // Default view if no role is selected
          return <LandingPage onRoleSelect={handleRoleSelect} />;
        })()}
        
      </div>
    </DebateProvider>
  );
}

export default AppShell;