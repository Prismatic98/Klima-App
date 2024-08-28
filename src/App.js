import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './screens/Home.jsx';
import Settings from './screens/Settings.jsx';
import './App.css'; // Importiere die CSS-Datei

const App = () => {
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Router>
  );
};

export default App;
