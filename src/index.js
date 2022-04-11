import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import  { AppFrame } from './AppFrame/App';
import reportWebVitals from './reportWebVitals';
import { GlobalContextProvider } from './base/GlobalContext';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Measure, } from './Pages/MeasureAdd';
import { Act } from './Pages/ActAdd';
import { Home } from './Pages/Home';
import { MyTrace } from './Pages/MyTrace';
import { AuthContextComponent } from './Auth/AuthContext';
import { GoalAndRisk } from './Pages/goalAdd';
import {MyGoals} from './Pages/goalList';
import { MyAct } from './Pages/ActMine';
import { MyMeasure } from './Pages/MeasureMine';

ReactDOM.render(
  <GlobalContextProvider>
    <AuthContextComponent>
    <React.StrictMode>
 
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AppFrame children={<Home/>} />} />
          
          <Route path="/MyTrace" element={<AppFrame children={<MyTrace/>} />} />

          <Route path="/Act" element={<AppFrame children={<Act/>} />} />
          <Route path="/Act/Mine" element={<AppFrame children={<MyAct/>} />} />
          
          <Route path="/Measure" element={<AppFrame children={<Measure/>} />} />
          <Route path="/Measure/Mine" element={<AppFrame children={<MyMeasure/>} />} />

          <Route path="/Goals" element={<AppFrame children={<GoalAndRisk/>} />} />
          <Route path="/Goals/Mine" element={<AppFrame children={<MyGoals/>} />} />
          
          {/* <Route path="/home" element={<App children={null} />} /> */}
          <Route path="*" element={<Navigate to={"/"} />} />
        </Routes>
      </BrowserRouter>


    </React.StrictMode>
    </AuthContextComponent>
  </GlobalContextProvider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
