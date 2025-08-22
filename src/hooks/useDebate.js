// src/hooks/useDebate.js
import { useState, useEffect, useCallback } from 'react';
import { useDebate as useDebateContext } from '../context/DebateContext';
import {
  updateTopic,
  startDebate,
  switchSides,
  updateTeams,
  submitVote
} from '../services/debateService';

export const useDebate = (classroomId = null) => {
  const { state, actions } = useDebateContext();
  const [localLoading, setLocalLoading] = useState(false);

  // Enhanced voting functionality
  const [voteHistory, setVoteHistory] = useState([]);
  const [hasVotedInCurrentRound, setHasVotedInCurrentRound] = useState(false);

  // Check voting status when speaking side changes
  useEffect(() => {
    if (classroomId && state.speakingFor) {
      const votedKey = `voted_${classroomId}_${state.speakingFor}`;
      const hasVoted = localStorage.getItem(votedKey) === 'true';
      setHasVotedInCurrentRound(hasVoted);
    }
  }, [classroomId, state.speakingFor]);

  // Admin functions
  const updateDebateTopic = useCallback(async (newTopic) => {
    if (!classroomId) throw new Error('Classroom ID required');
    
    setLocalLoading(true);
    try {
      await updateTopic(classroomId, newTopic);
      actions.setTopic(newTopic);
      return true;
    } catch (error) {
      actions.setError('Failed to update topic');
      throw error;
    } finally {
      setLocalLoading(false);
    }
  }, [classroomId, actions]);

  const startDebateSession = useCallback(async () => {
    if (!classroomId) throw new Error('Classroom ID required');
    
    setLocalLoading(true);
    try {
      await startDebate(classroomId);
      actions.setDebateStarted(true);
      actions.setVotes({ switch: 0, dontSwitch: 0 });
      return true;
    } catch (error) {
      actions.setError('Failed to start debate');
      throw error;
    } finally {
      setLocalLoading(false);
    }
  }, [classroomId, actions]);

  const switchDebateSides = useCallback(async () => {
    if (!classroomId) throw new Error('Classroom ID required');
    
    setLocalLoading(true);
    try {
      await switchSides(classroomId);
      const newSide = state.speakingFor === 'A' ? 'B' : 'A';
      actions.setSpeakingFor(newSide);
      actions.setVotes({ switch: 0, dontSwitch: 0 });
      
      // Clear voting status for new round
      if (classroomId) {
        const votedKey = `voted_${classroomId}_${newSide}`;
        localStorage.removeItem(votedKey);
        setHasVotedInCurrentRound(false);
      }
      
      return true;
    } catch (error) {
      actions.setError('Failed to switch sides');
      throw error;
    } finally {
      setLocalLoading(false);
    }
  }, [classroomId, state.speakingFor, actions]);

  const addTeamMember = useCallback(async (team, memberName) => {
    if (!classroomId) throw new Error('Classroom ID required');
    
    setLocalLoading(true);
    try {
      const newTeamA = team === 'A' 
        ? [...state.teamA, memberName]
        : state.teamA;
      const newTeamB = team === 'B' 
        ? [...state.teamB, memberName]
        : state.teamB;

      await updateTeams(classroomId, newTeamA, newTeamB);
      actions.setTeams({ teamA: newTeamA, teamB: newTeamB });
      return true;
    } catch (error) {
      actions.setError('Failed to add team member');
      throw error;
    } finally {
      setLocalLoading(false);
    }
  }, [classroomId, state.teamA, state.teamB, actions]);

  const removeTeamMember = useCallback(async (team, index) => {
    if (!classroomId) throw new Error('Classroom ID required');
    
    setLocalLoading(true);
    try {
      const newTeamA = team === 'A' 
        ? state.teamA.filter((_, i) => i !== index)
        : state.teamA;
      const newTeamB = team === 'B' 
        ? state.teamB.filter((_, i) => i !== index)
        : state.teamB;

      await updateTeams(classroomId, newTeamA, newTeamB);
      actions.setTeams({ teamA: newTeamA, teamB: newTeamB });
      return true;
    } catch (error) {
      actions.setError('Failed to remove team member');
      throw error;
    } finally {
      setLocalLoading(false);
    }
  }, [classroomId, state.teamA, state.teamB, actions]);

  const clearAllTeams = useCallback(async () => {
    if (!classroomId) throw new Error('Classroom ID required');
    
    setLocalLoading(true);
    try {
      await updateTeams(classroomId, [], []);
      actions.setTeams({ teamA: [], teamB: [] });
      return true;
    } catch (error) {
      actions.setError('Failed to clear teams');
      throw error;
    } finally {
      setLocalLoading(false);
    }
  }, [classroomId, actions]);

  // Spectator functions
  const castVote = useCallback(async (voteType) => {
    if (!classroomId) throw new Error('Classroom ID required');
    if (hasVotedInCurrentRound) throw new Error('Already voted in this round');
    
    setLocalLoading(true);
    try {
      await submitVote(classroomId, voteType);
      
      // Mark as voted for this round
      const votedKey = `voted_${classroomId}_${state.speakingFor}`;
      localStorage.setItem(votedKey, 'true');
      setHasVotedInCurrentRound(true);
      
      // Add to vote history
      const voteRecord = {
        type: voteType,
        team: state.speakingFor,
        timestamp: new Date().toISOString()
      };
      setVoteHistory(prev => [...prev, voteRecord]);
      
      return true;
    } catch (error) {
      actions.setError('Failed to submit vote');
      throw error;
    } finally {
      setLocalLoading(false);
    }
  }, [classroomId, state.speakingFor, hasVotedInCurrentRound, actions]);

  // Utility functions
  const getVotePercentages = useCallback(() => {
    const total = state.votes.switch + state.votes.dontSwitch;
    if (total === 0) return { switch: 0, dontSwitch: 0 };
    
    return {
      switch: Math.round((state.votes.switch / total) * 100),
      dontSwitch: Math.round((state.votes.dontSwitch / total) * 100)
    };
  }, [state.votes]);

  const canStartDebate = useCallback(() => {
    return state.teamA.length > 0 && state.teamB.length > 0;
  }, [state.teamA, state.teamB]);

  const getTeamBalance = useCallback(() => {
    const total = state.teamA.length + state.teamB.length;
    if (total === 0) return { balanced: true, difference: 0 };
    
    const difference = Math.abs(state.teamA.length - state.teamB.length);
    return {
      balanced: difference <= 1,
      difference,
      recommendation: difference > 1 ? 'Consider balancing team sizes' : null
    };
  }, [state.teamA, state.teamB]);

  return {
    // State
    ...state,
    isLoading: state.isLoading || localLoading,
    hasVotedInCurrentRound,
    voteHistory,
    
    // Admin functions
    updateDebateTopic,
    startDebateSession,
    switchDebateSides,
    addTeamMember,
    removeTeamMember,
    clearAllTeams,
    
    // Spectator functions
    castVote,
    
    // Utility functions
    getVotePercentages,
    canStartDebate,
    getTeamBalance,
    
    // Actions
    ...actions
  };
};
