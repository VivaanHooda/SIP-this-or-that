import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { subscribeToDebate, subscribeToTeams } from '../services/debateService';

const DebateContext = createContext();

// Initial state
const initialState = {
  topic: "Is technology making us less social?",
  votes: { switch: 0, dontSwitch: 0 },
  speakingFor: 'A',
  teamA: [],
  teamB: [],
  debateStarted: false,
  currentClassroom: null,
  isLoading: false,
  error: null,
  hasVoted: false
};

// Action types
const ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_ERROR: 'SET_ERROR',
  SET_TOPIC: 'SET_TOPIC',
  SET_VOTES: 'SET_VOTES',
  SET_SPEAKING_FOR: 'SET_SPEAKING_FOR',
  SET_TEAMS: 'SET_TEAMS',
  SET_DEBATE_STARTED: 'SET_DEBATE_STARTED',
  SET_CLASSROOM: 'SET_CLASSROOM',
  SET_HAS_VOTED: 'SET_HAS_VOTED',
  UPDATE_DEBATE_DATA: 'UPDATE_DEBATE_DATA',
  RESET_STATE: 'RESET_STATE'
};

// Reducer
function debateReducer(state, action) {
  switch (action.type) {
    case ACTIONS.SET_LOADING:
      return { ...state, isLoading: action.payload };
    case ACTIONS.SET_ERROR:
      return { ...state, error: action.payload, isLoading: false };
    case ACTIONS.SET_TOPIC:
      return { ...state, topic: action.payload };
    case ACTIONS.SET_VOTES:
      return { ...state, votes: action.payload };
    case ACTIONS.SET_SPEAKING_FOR:
      return { ...state, speakingFor: action.payload };
    case ACTIONS.SET_TEAMS:
      return { 
        ...state, 
        teamA: action.payload.teamA, 
        teamB: action.payload.teamB 
      };
    case ACTIONS.SET_DEBATE_STARTED:
      return { ...state, debateStarted: action.payload };
    case ACTIONS.SET_CLASSROOM:
      return { ...state, currentClassroom: action.payload };
    case ACTIONS.SET_HAS_VOTED:
      return { ...state, hasVoted: action.payload };
    case ACTIONS.UPDATE_DEBATE_DATA:
      return { 
        ...state, 
        ...action.payload,
        isLoading: false,
        error: null 
      };
    case ACTIONS.RESET_STATE:
      return { ...initialState };
    default:
      return state;
  }
}

// Provider component
export function DebateProvider({ children }) {
  const [state, dispatch] = useReducer(debateReducer, initialState);

  // Subscribe to real-time updates when classroom is set
  useEffect(() => {
    if (!state.currentClassroom?.id) return;

    const unsubscribeDebate = subscribeToDebate(state.currentClassroom.id, (debateData) => {
      if (debateData) {
        dispatch({
          type: ACTIONS.UPDATE_DEBATE_DATA,
          payload: {
            topic: debateData.topic,
            votes: debateData.votes || state.votes,
            speakingFor: debateData.speakingFor,
            debateStarted: debateData.debateStarted
          }
        });
      }
    });

    const unsubscribeTeams = subscribeToTeams(state.currentClassroom.id, (teamsData) => {
      if (teamsData) {
        dispatch({
          type: ACTIONS.SET_TEAMS,
          payload: {
            teamA: teamsData.teamA || [],
            teamB: teamsData.teamB || []
          }
        });
      }
    });

    return () => {
      unsubscribeDebate();
      unsubscribeTeams();
    };
  }, [state.currentClassroom?.id]);

  // Action creators
  const actions = {
    setLoading: (loading) => dispatch({ type: ACTIONS.SET_LOADING, payload: loading }),
    setError: (error) => dispatch({ type: ACTIONS.SET_ERROR, payload: error }),
    setTopic: (topic) => dispatch({ type: ACTIONS.SET_TOPIC, payload: topic }),
    setVotes: (votes) => dispatch({ type: ACTIONS.SET_VOTES, payload: votes }),
    setSpeakingFor: (side) => dispatch({ type: ACTIONS.SET_SPEAKING_FOR, payload: side }),
    setTeams: (teams) => dispatch({ type: ACTIONS.SET_TEAMS, payload: teams }),
    setDebateStarted: (started) => dispatch({ type: ACTIONS.SET_DEBATE_STARTED, payload: started }),
    setClassroom: (classroom) => dispatch({ type: ACTIONS.SET_CLASSROOM, payload: classroom }),
    setHasVoted: (voted) => dispatch({ type: ACTIONS.SET_HAS_VOTED, payload: voted }),
    resetState: () => dispatch({ type: ACTIONS.RESET_STATE })
  };

  const value = {
    state,
    actions
  };

  return (
    <DebateContext.Provider value={value}>
      {children}
    </DebateContext.Provider>
  );
}

// Custom hook to use the context
export function useDebate() {
  const context = useContext(DebateContext);
  if (!context) {
    throw new Error('useDebate must be used within a DebateProvider');
  }
  return context;
}

export default DebateContext;
