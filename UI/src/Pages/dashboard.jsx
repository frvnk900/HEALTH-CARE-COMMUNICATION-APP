import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/dashboard.css";
import Sidebar from "../components/menu";

function ModernDashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Mock data for demonstration
  const [appointments] = useState([
    { id: 1, type: "doctor", title: "Annual Physical", time: "Tomorrow, 10:00 AM", icon: "👨‍⚕️" },
    { id: 2, type: "lab", title: "Blood Work", time: "Dec 15, 2:30 PM", icon: "💉" },
    { id: 3, type: "therapy", title: "Physical Therapy", time: "Dec 18, 4:00 PM", icon: "🧘‍♂️" }
  ]);

  const [healthMetrics] = useState([
    { id: 1, name: "Heart Rate", value: "72", unit: "BPM", trend: "down", change: "-2", icon: "❤️" },
    { id: 2, name: "Blood Pressure", value: "120/80", unit: "mmHg", trend: "stable", change: "0", icon: "🩸" },
    { id: 3, name: "Sleep", value: "7h 30m", unit: "", trend: "up", change: "+45m", icon: "😴" },
    { id: 4, name: "Steps", value: "8,542", unit: "", trend: "up", change: "+12%", icon: "👣" }
  ]);

  const [recentActivities] = useState([
    { id: 1, action: "Medication reminder completed", time: "2 hours ago", icon: "💊" },
    { id: 2, action: "Updated health profile", time: "Yesterday", icon: "📝" },
    { id: 3, action: "New lab results available", time: "2 days ago", icon: "📊" }
  ]);

  // Fix scrolling on mount
  useEffect(() => {
    // Enable scrolling for dashboard
    document.body.classList.add('dashboard-page-active');
    
    return () => {
      document.body.classList.remove('dashboard-page-active');
    };
  }, []);

  const getUserIdFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

  const fetchUserProfile = async (user_id) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8001/user/v1/profile/?user_id=${user_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch user profile");
      }

      const data = await response.json();
      setUserProfile(data.user_profile);
    } catch (err) {
      console.error("Error fetching user profile:", err);
    }
  };

  const fetchDashboardData = async (user_id) => {
    try {
      const response = await fetch(
        `http://127.0.0.1:8001/user/v1/dashboard/${user_id}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const data = await response.json();
      setDashboardData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const user_id = getUserIdFromToken();
        if (!user_id) {
          setError("User not authenticated");
          setLoading(false);
          return;
        }

        await Promise.all([
          fetchDashboardData(user_id),
          fetchUserProfile(user_id),
        ]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleMapClick = () => {
    navigate("/map");
  };

  const formatTime = (timeString) => {
    const date = new Date(timeString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }) + " • " + date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const getPriorityClass = (priority) => {
    switch(priority?.toLowerCase()) {
      case 'high': return 'priority-high';
      case 'medium': return 'priority-medium';
      case 'low': return 'priority-low';
      default: return 'priority-low';
    }
  };

  const getTrendIcon = (trend) => {
    switch(trend) {
      case 'up': return '↗';
      case 'down': return '↘';
      default: return '→';
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading-elegant">
        <div className="loading-spinner-elegant"></div>
        <p style={{ color: 'var(--color-text-secondary)' }}>Loading your dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <h3>Unable to load dashboard</h3>
        <p>{error}</p>
        <button
          className="retry-button"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="dashboard-error">
        <h3>No data available</h3>
        <p>Unable to load dashboard information</p>
        <button
          className="retry-button"
          onClick={() => navigate("/login")}
        >
          Return to Login
        </button>
      </div>
    );
  }

  const { dashboard } = dashboardData;
  const username = userProfile?.username || "Valued User";

  return (
    <>
      <Sidebar />
      <div className="dashboard-elegant-root font-display dark">
        <div className="dashboard-background-layer"></div>
        <div className="dashboard-grid-overlay"></div>
        
        <div className="dashboard-elegant-container">
          
          {/* Welcome Section */}
          <section className="dashboard-welcome-section">
            <div className="welcome-header">
              <h1 className="welcome-title">
                {getGreeting()}, <span className="welcome-title-highlight">{username}!</span>
              </h1>
              <p className="welcome-subtitle">
                Welcome to your health dashboard. Here's everything you need to know about your wellness journey.
              </p>
              <div className="welcome-meta">
                <div className="meta-item">
                  <span className="material-symbols-outlined meta-icon">update</span>
                  <span>updated: {formatTime(dashboard.latest_time)}</span>
                </div>
                <div className="meta-item">
                  <span className="material-symbols-outlined meta-icon">location_on</span>
                  <span>{dashboard.location || "Location not set"}</span>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="dashboard-stats-grid">
              <div className="stat-card-elegant">
                <div className="stat-icon">
                  <span className="material-symbols-outlined">folder</span>
                </div>
                <div className="stat-content">
                  <div className="stat-title">Conversation with HealthcareAi</div>
                  <div className="stat-value">{dashboard.total_charts}</div>
                  <div className="stat-trend trend-positive">
                    
                  </div>
                </div>
              </div>

              <div className="stat-card-elegant">
                <div className="stat-icon">
                  <span className="material-symbols-outlined">schedule</span>
                </div>
                <div className="stat-content">
                  <div className="stat-title">Schedules</div>
                  <div className="stat-value">{dashboard.number_of_schedules}</div>
                  <div className="stat-trend trend-positive">
                    
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* Main Content Grid */}
          <div className="dashboard-main-grid">
            {/* Left Column */}
            <div className="dashboard-left-column">
              {/* Health Tip Card */}
              <div className="health-tip-elegant">
                <div className="tip-header-elegant">
                  <div className="tip-icon-container">
                    <span className="material-symbols-outlined">lightbulb</span>
                  </div>
                  <h2 className="tip-title">Daily Health Insight</h2>
                </div>
                
                <div className="tip-category-elegant">
                  {dashboard.health_tip_of_the_day?.category?.replace("_", " ") || "General Wellness"}
                </div>
                
                <p className="tip-content-elegant">
                  {dashboard.health_tip_of_the_day?.tip || "Stay hydrated throughout the day for optimal body function."}
                </p>
                
                <div className={`tip-priority-elegant ${getPriorityClass(dashboard.health_tip_of_the_day?.priority)}`}>
                  <div className="priority-dot"></div>
                  <span>{dashboard.health_tip_of_the_day?.priority || "low"} priority</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="quick-actions-elegant">
                <h2 className="actions-title">Quick Actions</h2>
                <div className="actions-grid-elegant">
                  <button 
                    className="action-button-elegant"
                    onClick={() => navigate("/home")}
                    aria-label="Chat with healthcare AI"
                  >
                    <div className="action-icon-elegant">
                      <span className="material-symbols-outlined">chat</span>
                    </div>
                    <span className="action-text">Chat with HealthcareAI</span>
                    <span className="material-symbols-outlined action-arrow">arrow_forward</span>
                  </button>

                  <button 
                    className="action-button-elegant"
                    onClick={() => navigate("/schedule")}
                    aria-label="View appointments and schedule"
                  >
                    <div className="action-icon-elegant">
                      <span className="material-symbols-outlined">calendar_month</span>
                    </div>
                    <span className="action-text">View Appointments</span>
                    <span className="material-symbols-outlined action-arrow">arrow_forward</span>
                  </button>
 
                </div>
              </div>
            </div>

            {/* Right Column - Map Card */}
            <div className="map-card-elegant" onClick={handleMapClick} role="button" tabIndex={0}>
              <div className="map-background-elegant"></div>
              <div className="map-content-elegant">
                <div className="map-icon-elegant">
                  <span className="material-symbols-outlined">map</span>
                </div>
                <h3 className="map-title-elegant">Healthcare Navigator</h3>
                <p className="map-description">
                  Discover hospitals, clinics, and pharmacies near you with real-time availability and reviews.
                </p>
                <div className="map-cta-elegant">
                  <span>Explore Nearby</span>
                  <span className="material-symbols-outlined">arrow_forward</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ModernDashboard;