import React from 'react';
import { Vote, Check, RotateCcw, Square } from 'lucide-react';
import './VotePanel.css';

function VotePanel({ votes, onVote, hasVoted, isSubmittingVote, currentTeam }) {
  const totalVotes = votes.switch + votes.dontSwitch;

  const handleVote = (voteType) => {
    if (hasVoted || isSubmittingVote) return;
    onVote(voteType);
  };

  return (
    <div className="vote-panel card">
      <div className="vote-header">
        <h3>
          <Vote size={20} />
          Cast Your Vote
        </h3>
        <p className="vote-instruction">
          Should the debate switch to the other team, or continue with Team {currentTeam}?
        </p>
      </div>

      <div className="vote-options">
        <button
          className={`vote-option switch-vote ${hasVoted ? 'disabled' : ''}`}
          onClick={() => handleVote('switch')}
          disabled={hasVoted || isSubmittingVote}
        >
          <div className="vote-icon">
            <RotateCcw size={24} />
          </div>
          <div className="vote-content">
            <h4>Switch Sides</h4>
            <p>Let Team {currentTeam === 'A' ? 'B' : 'A'} present their argument</p>
          </div>
          <div className="vote-count">
            {votes.switch}
          </div>
        </button>

        <button
          className={`vote-option stay-vote ${hasVoted ? 'disabled' : ''}`}
          onClick={() => handleVote('dontSwitch')}
          disabled={hasVoted || isSubmittingVote}
        >
          <div className="vote-icon">
            <Square size={24} />
          </div>
          <div className="vote-content">
            <h4>Continue Current</h4>
            <p>Keep Team {currentTeam} presenting their case</p>
          </div>
          <div className="vote-count">
            {votes.dontSwitch}
          </div>
        </button>
      </div>

      {hasVoted && (
        <div className="vote-confirmation">
          <Check size={16} />
          <span>Thank you for voting! Your vote has been recorded.</span>
        </div>
      )}

      {isSubmittingVote && (
        <div className="vote-submitting">
          <div className="loading-spinner small"></div>
          <span>Submitting your vote...</span>
        </div>
      )}

      <div className="vote-summary">
        <div className="summary-header">
          <span>Total Votes: {totalVotes}</span>
          <span>Participation: Live</span>
        </div>
        
        {totalVotes > 0 && (
          <div className="vote-breakdown">
            <div className="breakdown-item">
              <div className="breakdown-bar">
                <div 
                  className="breakdown-fill switch"
                  style={{ width: `${(votes.switch / totalVotes) * 100}%` }}
                ></div>
                <div 
                  className="breakdown-fill stay"
                  style={{ width: `${(votes.dontSwitch / totalVotes) * 100}%` }}
                ></div>
              </div>
              <div className="breakdown-labels">
                <span className="switch-label">
                  Switch: {Math.round((votes.switch / totalVotes) * 100)}%
                </span>
                <span className="stay-label">
                  Stay: {Math.round((votes.dontSwitch / totalVotes) * 100)}%
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default VotePanel;