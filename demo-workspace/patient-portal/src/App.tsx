import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ClaimForm from './components/ClaimForm';
import PatientList from './components/PatientList';

const App: React.FC = () => {
  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <h1>Patient Portal</h1>
            <ul className="nav-links">
              <li><Link to="/">Dashboard</Link></li>
              <li><Link to="/claims">Submit Claim</Link></li>
              <li><Link to="/patients">Patient List</Link></li>
            </ul>
          </div>
        </nav>
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/claims" element={<ClaimForm />} />
            <Route path="/patients" element={<PatientList />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
};

export default App;
