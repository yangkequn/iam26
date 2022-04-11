import './App.css';
import React from 'react';
import {Navigator } from './Navigator';
import { Redirector } from './Redirector';

export function AppFrame({ children }) {
  return (
    <div className="App" id="appFrame">
      <Navigator />
      <Redirector></Redirector>
      <header className="App-header">
        {children}
      </header>
    </div>
  );
}

