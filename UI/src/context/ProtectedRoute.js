import { useAuth } from './AuthContext';
import { Navigate } from 'react-router-dom';


 
export function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-border"></div>
        <div className="loading-spinner-large"></div>
        <p>Verifying your session...</p>
        <div className="loading-dots">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
        <div className="loading-logo">
          <h1>Garden<span>Sync</span></h1>
          <p>Your personal garden assistant</p>
        </div>
      </div>
    );
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="loading-screen">
        <div className="loading-border"></div>
        <div className="loading-spinner-large"></div>
        <p>Loading application...</p>
        <div className="loading-dots">
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
          <div className="loading-dot"></div>
        </div>
        <div className="loading-logo">
          <h1>Garden<span>Sync</span></h1>
          <p>Your personal garden assistant</p>
        </div>
      </div>
    );
  }
  
  return !isAuthenticated ? children : <Navigate to="/home" />;
}