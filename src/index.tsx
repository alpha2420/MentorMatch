/**
 * index.tsx - React Application Entry Point
 * Mount the MentorMatch app to the DOM
 */
 
import React from 'react';
import ReactDOM from 'react-dom/client';
import MentorMatch from './App';
 
const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
 
root.render(
  <React.StrictMode>
    <MentorMatch />
  </React.StrictMode>
);
 
export default MentorMatch;
