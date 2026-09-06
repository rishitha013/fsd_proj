import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import NewApplication from './pages/NewApplication';
import Decision from './pages/Decision';
import History from './pages/History';

function LayoutWrapper() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  if (isLanding) {
    return <Landing />;
  }

  return (
    <div className="flex bg-[#030712] min-h-screen text-slate-100 font-sans">
      <Sidebar />
      <div className="flex-1 ml-64 min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/apply" element={<NewApplication />} />
            <Route path="/decision/:id" element={<Decision />} />
            <Route path="/history" element={<History />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <LayoutWrapper />
    </Router>
  );
}

export default App;