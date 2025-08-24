// src/app/test/page.jsx

"use client";
import React, { useState } from 'react';
import { generateDebateTopic } from '@/services/geminiService';

export default function TestPage() {
  const [topic, setTopic] = useState('Click the button to generate a topic.');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateTopic = async () => {
    setIsLoading(true);
    setError('');
    try {
      const newTopic = await generateDebateTopic();
      setTopic(newTopic);
    } catch (err) {
      console.error(err);
      setError('An error occurred. Check the console.');
      // Check if the error is the 429 error
      if (err.message.includes('429')) {
        setError('Error 429: Too many requests. API rate limit was hit.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif' }}>
      <h1>API Button Isolation Test</h1>
      <p>This page tests the "Generate Topic" button completely separately from the rest of your application.</p>
      
      <button 
        onClick={handleGenerateTopic} 
        disabled={isLoading}
        style={{ padding: '10px 20px', fontSize: '1rem', cursor: 'pointer' }}
      >
        {isLoading ? 'Generating...' : '✨ Generate Topic'}
      </button>

      <hr style={{ margin: '20px 0' }} />

      <h2>Generated Topic:</h2>
      <p style={{ fontWeight: 'bold' }}>{topic}</p>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}