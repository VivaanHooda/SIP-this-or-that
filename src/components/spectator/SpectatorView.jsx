import React, { useState, useEffect } from 'react';
import { Users, Vote, Clock, Trophy, AlertCircle, User, Hash } from 'lucide-react';
import { useDebate } from '../../context/DebateContext';
import { submitVote, getDebateData, getTeams } from '../../services/debateService';
import VotePanel from './VotePanel';
import './SpectatorView.css';

function SpectatorView({ classroom, student }) {
  const { state, actions } = useDebate();
  const [hasVoted, setHasVoted] = useState(false);
  const [isSubmittingVote, setIsSubmittingVote] = useState(false);
  const [error, setError] = useState('');

  // Load initial data
  useEffect(() => {
    if (classroom?.id) {
      actions.setClassroom(classroom);
      loadDebateData();
    }
  }, [classroom?.id]);

  // Check if user has voted (stored in localStorage)
  useEffect(() => {
    if (classroom?.id) {
      const votedKey = `voted_${classroom.id}_${state.speakingFor}`;
      const hasVotedStored = localStorage.getItem(votedKey) === 'true';
      setHasVoted(hasVotedStored);
    }
  }, [classroom?.id, state.speakingFor]);

  const loadDebateData = async () => {
    try {
      actions.setLoading(true);
      
      const [debateData, teamsData] = await Promise.all([
        getDebateData(classroom.id),
        getTeams(classroom.id)
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

      actions.setLoading(false);
    } catch (error) {
      console.error('Error loading debate data:', error);
      actions.setError('Failed to load debate data');
    }
  };

  const handleVote = async (voteType) => {
    if (hasVoted || !classroom?.id) return;

    setIsSubmittingVote(true);
    setError('');

    try {
      await submitVote(classroom.id, voteType);
      
      // Mark as voted for this round
      const votedKey = `voted_${classroom.id}_${state.speakingFor}`;
      localStorage.setItem(votedKey, 'true');
      setHasVoted(true);
      
    } catch (error) {
      console.error('Error submitting vote:', error);
      setError('Failed to submit vote. Please try again.');
    } finally {
      setIsSubmittingVote(false);
    }
  };

  const getMyTeam = () => {
    if (!student) return null;
    return student.assignedTeam;
  };

  const isMyTeamSpeaking = () => {
    return getMyTeam() === state.speakingFor;
  };

  if (state.isLoading) {
    return (
      <div className="spectator-view">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading debate session...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="spectator-view">
      {error && (
        <div className="error-banner">
          <AlertCircle size={16} />
          {error}
          <button onClick={() => setError('')} className="error-close">×</button>
        </div>
      )}

      {/* Student Info Card */}
      {student && (
        <div className="student-info-card card">
          <div className="student-header">
            <div className="student-details">
              <h3>
                <User size={20} />
                Welcome, {student.name}!
              </h3>
              <div className="student-meta">
                <span className="admission-number">
                  <Hash size={14} />
                  {student.admissionNumber}
                </span>
                <span className={`team-assignment team-${student.assignedTeam?.toLowerCase()}`}>
                  You're on Team {student.assignedTeam}
                </span>
              </div>
            </div>
            {getMyTeam() && (
              <div className={`my-team-status ${isMyTeamSpeaking() ? 'speaking' : 'listening'}`}>
                {isMyTeamSpeaking() ? (
                  <div className="status-indicator active">
                    <div className="status-dot"></div>
                    Your Team is Speaking
                  </div>
                ) : (
                  <div className="status-indicator waiting">
                    <div className="status-dot"></div>
                    Your Team is Listening
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Debate Status */}
      <div className="debate-status-card card">
        <div className="status-header">
          <div className="status-info">
            <h2>Debate Status</h2>
            <div className={`status-indicator ${state.debateStarted ? 'active' : 'waiting'}`}>
              <div className="status-dot"></div>
              <span>{state.debateStarted ? 'Live Debate' : 'Waiting to Start'}</span>
            </div>
          </div>
          {state.debateStarted && (
            <div className="current-speaker">
              <span className="speaker-label">Speaking For:</span>
              <span className={`team-badge team-${state.speakingFor.toLowerCase()}`}>
                Team {state.speakingFor}
              </span>
            </div>
          )}
        </div>

        <div className="topic-display">
          <h3>📋 Current Topic</h3>
          <p className="topic-text">{state.topic}</p>
        </div>
      </div>

      {/* Teams Overview */}
      <div className="teams-overview">
        <div className={`team-card team-a ${getMyTeam() === 'A' ? 'my-team' : ''}`}>
          <div className="team-header">
            <h3>
              <Users size={20} />
              Team A
              {getMyTeam() === 'A' && <span className="my-team-badge">Your Team</span>}
            </h3>
            <span className="member-count">{state.teamA.length} members</span>
          </div>
          <div className="team-members">
            {state.teamA.length > 0 ? (
              state.teamA.map((member, index) => (
                <span 
                  key={member.admissionNumber || index} 
                  className={`member-badge ${student?.admissionNumber === member.admissionNumber ? 'me' : ''}`}
                >
                  {member.name || member}
                  {student?.admissionNumber === member.admissionNumber && <span className="me-indicator"> (You)</span>}
                </span>
              ))
            ) : (
              <p className="no-members">No members assigned yet</p>
            )}
          </div>
        </div>

        <div className="vs-divider">
          <div className="vs-text">VS</div>
        </div>

        <div className={`team-card team-b ${getMyTeam() === 'B' ? 'my-team' : ''}`}>
          <div className="team-header">
            <h3>
              <Users size={20} />
              Team B
              {getMyTeam() === 'B' && <span className="my-team-badge">Your Team</span>}
            </h3>
            <span className="member-count">{state.teamB.length} members</span>
          </div>
          <div className="team-members">
            {state.teamB.length > 0 ? (
              state.teamB.map((member, index) => (
                <span 
                  key={member.admissionNumber || index} 
                  className={`member-badge ${student?.admissionNumber === member.admissionNumber ? 'me' : ''}`}
                >
                  {member.name || member}
                  {student?.admissionNumber === member.admissionNumber && <span className="me-indicator"> (You)</span>}
                </span>
              ))
            ) : (
              <p className="no-members">No members assigned yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Voting Section */}
      {state.debateStarted && (
        <VotePanel
          votes={state.votes}
          onVote={handleVote}
          hasVoted={hasVoted}
          isSubmittingVote={isSubmittingVote}
          currentTeam={state.speakingFor}
          myTeam={getMyTeam()}
        />
      )}

      {/* Waiting State */}
      {!state.debateStarted && (
        <div className="waiting-state card">
          <div className="waiting-content">
            <Clock size={48} className="waiting-icon" />
            <h3>Waiting for Debate to Start</h3>
            <p>Your teacher will start the debate session when ready. Please wait...</p>
            
            {getMyTeam() && (
              <div className="my-team-waiting">
                <p>You're assigned to <strong>Team {getMyTeam()}</strong></p>
                <p>Get ready to support your team's arguments!</p>
              </div>
            )}
            
            {(state.teamA.length === 0 || state.teamB.length === 0) && (
              <div className="waiting-requirement">
                <p>Teams are still being organized. More students may join...</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Live Results */}
      {state.debateStarted && (
        <div className="live-results card">
          <h3>
            <Trophy size={20} />
            Live Vote Results
          </h3>
          <div className="results-grid">
            <div className="result-item switch">
              <div className="result-label">
                Switch to Team {state.speakingFor === 'A' ? 'B' : 'A'}
                {getMyTeam() === (state.speakingFor === 'A' ? 'B' : 'A') && 
                  <span className="my-team-note"> (Your Team)</span>
                }
              </div>
              <div className="result-bar">
                <div 
                  className="result-fill" 
                  style={{
                    width: `${(state.votes.switch / Math.max(state.votes.switch + state.votes.dontSwitch, 1)) * 100}%`
                  }}
                ></div>
              </div>
              <div className="result-count">{state.votes.switch} votes</div>
            </div>

            <div className="result-item stay">
              <div className="result-label">
                Keep Team {state.speakingFor}
                {getMyTeam() === state.speakingFor && 
                  <span className="my-team-note"> (Your Team)</span>
                }
              </div>
              <div className="result-bar">
                <div 
                  className="result-fill" 
                  style={{
                    width: `${(state.votes.dontSwitch / Math.max(state.votes.switch + state.votes.dontSwitch, 1)) * 100}%`
                  }}
                ></div>
              </div>
              <div className="result-count">{state.votes.dontSwitch} votes</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SpectatorView;