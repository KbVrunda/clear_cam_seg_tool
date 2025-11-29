import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import SegmentationDashboard from './components/SegmentationDashboard';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import ProfilePage from './components/ProfilePage';
import NavSidebar from './components/NavSidebar';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if user is logged in (in a real app, this would check a token)
    const auth = localStorage.getItem('clearcam_auth');
    if (auth === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = () => {
    localStorage.setItem('clearcam_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('clearcam_auth');
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            isAuthenticated ? (
              <Navigate to="/dashboard" replace />
            ) : (
              <LoginPage onLogin={handleLogin} />
            )
          }
        />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <ProtectedRoutes onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
      </Routes>
    </Router>
  );
}

function ProtectedRoutes({ onLogout }) {
  return (
    <div className="flex h-screen">
      <NavSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<SegmentationDashboard />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route
            path="/logout"
            element={<LogoutPage onLogout={onLogout} />}
          />
        </Routes>
      </div>
    </div>
  );
}

function LogoutPage({ onLogout }) {
  const navigate = useNavigate();
  
  useEffect(() => {
    onLogout();
    navigate('/login', { replace: true });
  }, [onLogout, navigate]);

  return null;
}

export default App;

