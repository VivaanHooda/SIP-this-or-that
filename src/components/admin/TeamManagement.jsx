// src/components/admin/TeamManagement.jsx
"use client";
import React, { useState } from 'react';
import { Users, Plus, X, Trash2 } from 'lucide-react';
import Modal from '../common/Modal';
import './TeamManagement.css';

function TeamManagement({ 
  teamA, 
  teamB, 
  onAddMember, 
  onRemoveMember, 
  onClearTeams,
  isLoading 
}) {
  const [newMember, setNewMember] = useState('');
  const [selectedTeam, setSelectedTeam] = useState('A');
  const [showClearModal, setShowClearModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newMember.trim()) return;

    setIsAdding(true);
    try {
      await onAddMember(selectedTeam, newMember.trim());
      setNewMember('');
    } catch (error) {
      console.error('Error adding member:', error);
    } finally {
      setIsAdding(false);
    }
  };

  const handleRemoveMember = async (team, index) => {
    try {
      await onRemoveMember(team, index);
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleClearTeams = async () => {
    try {
      await onClearTeams();
      setShowClearModal(false);
    } catch (error) {
      console.error('Error clearing teams:', error);
    }
  };

  const totalMembers = teamA.length + teamB.length;

  return (
    <div className="team-management card">
      <div className="team-header">
        <h3>
          <Users size={20} />
          Team Management
        </h3>
        <div className="team-stats">
          <span className="total-members">{totalMembers} students</span>
        </div>
      </div>

      {/* Add Member Form */}
      <form onSubmit={handleAddMember} className="add-member-form">
        <div className="form-row">
          <input
            type="text"
            placeholder="Enter student name..."
            value={newMember}
            onChange={(e) => setNewMember(e.target.value)}
            className="member-input form-input"
            disabled={isLoading}
            required
          />
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="team-select"
            disabled={isLoading}
          >
            <option value="A">Team A</option>
            <option value="B">Team B</option>
          </select>
          <button 
            type="submit" 
            className="add-btn btn-primary"
            disabled={isLoading || !newMember.trim() || isAdding}
          >
            {isAdding ? (
              <>
                <div className="loading-spinner small"></div>
                Adding...
              </>
            ) : (
              <>
                <Plus size={16} />
                Add
              </>
            )}
          </button>
        </div>
      </form>

      {/* Teams Display */}
      <div className="teams-display">
        <div className="team-section team-a-section">
          <div className="team-section-header">
            <h4>Team A</h4>
            <span className="member-count">{teamA.length} members</span>
          </div>
          <ul className="team-list">
            {teamA.length > 0 ? (
              teamA.map((member, index) => (
                <li key={index} className="team-member">
                  <span className="member-name">{member}</span>
                  <button 
                    onClick={() => handleRemoveMember('A', index)}
                    className="remove-btn"
                    disabled={isLoading}
                    title="Remove member"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))
            ) : (
              <li className="no-members">No members added yet</li>
            )}
          </ul>
        </div>

        <div className="team-section team-b-section">
          <div className="team-section-header">
            <h4>Team B</h4>
            <span className="member-count">{teamB.length} members</span>
          </div>
          <ul className="team-list">
            {teamB.length > 0 ? (
              teamB.map((member, index) => (
                <li key={index} className="team-member">
                  <span className="member-name">{member}</span>
                  <button 
                    onClick={() => handleRemoveMember('B', index)}
                    className="remove-btn"
                    disabled={isLoading}
                    title="Remove member"
                  >
                    <X size={14} />
                  </button>
                </li>
              ))
            ) : (
              <li className="no-members">No members added yet</li>
            )}
          </ul>
        </div>
      </div>

      {/* Team Actions */}
      {totalMembers > 0 && (
        <div className="team-actions">
          <button 
            onClick={() => setShowClearModal(true)}
            className="clear-btn btn-secondary"
            disabled={isLoading}
          >
            <Trash2 size={16} />
            Clear All Teams
          </button>
        </div>
      )}

      {/* Clear Confirmation Modal */}
      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear All Teams"
      >
        <div className="clear-confirmation">
          <p>Are you sure you want to remove all students from both teams?</p>
          <p className="warning-text">This action cannot be undone.</p>
          <div className="modal-actions">
            <button 
              onClick={() => setShowClearModal(false)}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button 
              onClick={handleClearTeams}
              className="btn-danger"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="loading-spinner small"></div>
                  Clearing...
                </>
              ) : (
                'Clear Teams'
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default TeamManagement;
