import React from 'react';
import Home from './Home';
import './App.css'
import PickWinner from './PickWinner';
import {BrowserRouter, Routes, Route, Link} from 'react-router-dom';

const App = () => {
  return (
    <BrowserRouter>
    <div>
      <nav>
       <ul>
        <li>
         <Link to="/">Home</Link> 
        </li>
        <li>
         <Link to="/PickWinner">PickWinner</Link> 
        </li>
        </ul> 
      </nav>

      <Routes>
        <Route path="/PickWinner" element={<PickWinner />}></Route>
        <Route path="/" element={<Home />}></Route>
      </Routes>
    </div>
    </BrowserRouter>
  )
}

export default App;