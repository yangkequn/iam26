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
      <div style={{height:"10px",width:"100%",display:"block",fontSize:"12px"}}>闽ICP备2022003454号</div>
    </div>
  );
}

