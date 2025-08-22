// src/components/common/Loading.jsx
import React from 'react';
import './Loading.css';

function Loading({ message = "Loading...", size = "default" }) {
  return (
    <div className={`loading ${size === "small" ? "loading-small" : ""}`}>
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default Loading;
