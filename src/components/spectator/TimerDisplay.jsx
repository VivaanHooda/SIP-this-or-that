import React, { useState, useEffect } from 'react';
import { useDebate } from '../../context/DebateContext';
import { Clock } from 'lucide-react';
import './TimerDisplay.css'; 

function TimerDisplay() {
  const { state } = useDebate();

  const { timer = 60, isTimerRunning = false } = state;

  const [displayTime, setDisplayTime] = useState(timer);

  useEffect(() => {
    setDisplayTime(timer);
  }, [timer]);

  useEffect(() => {
    let interval = null;

    if (isTimerRunning && displayTime > 0) {
      interval = setInterval(() => {
        setDisplayTime(prevTime => prevTime - 1);
      }, 1000);
    } else if (!isTimerRunning || displayTime === 0) {
      clearInterval(interval);
    }

    return () => clearInterval(interval);
  }, [isTimerRunning, displayTime]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="timer-display card">
      <Clock size={24} />
      <h3>Debate Timer</h3>
      <div className="time">{formatTime(displayTime)}</div>
      <div className={`status ${isTimerRunning && displayTime > 0 ? 'running' : 'paused'}`}>
        {isTimerRunning && displayTime > 0 ? 'Running' : 'Paused'}
      </div>
    </div>
  );
}

export default TimerDisplay;