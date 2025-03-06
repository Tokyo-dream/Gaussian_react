import React from 'react';
import './App.css';
import MainCanvas from './components/Main/MainCanvas';
import OverlayCanvas from './components/Overlay/OverlayCanvas';

function App() {
  return (
    <div>
      <OverlayCanvas />
      <MainCanvas />
      
    </div>
  );
}

export default App;