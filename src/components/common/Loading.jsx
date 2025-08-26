// src/components/common/Loading.jsx
"use client";
import React from 'react';

function Loading({ message = "Loading...refresh if it takes too long!", size = "default" }) {
  return (
    <div className={`loading ${size === "small" ? "loading-small" : ""}`}>
      <div className="loading-spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default Loading;
