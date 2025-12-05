import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./styles/dashboard.css";
import Sidebar from "../components/menu";

function Dashboard() {
  const [dashboardData, setDashboardData] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

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
    navigate("/map_screen");
  };

  const formatTime = (timeString) => {
    return new Date(timeString).toLocaleTimeString("en-US", {
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

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading</p>
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
      </div>
    );
  }

  const { dashboard } = dashboardData;
  const username = userProfile?.username || "Valued User";

  return (
    <>
      <Sidebar />
      <div className="getstarted-root font-display dark">
        <div
          className="background-image-layer"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDBsl5xKFUwyPrzFdU4NVm8dRNWS03SX5Grib5E2uh6fywyhhPB6pZepud0U9EeYRkCiU15Z1kopdk14Ju2tv1dNFiTl4rGHhEmlI5VE6nk3A6sdtAQ_1cMrkyqcdf4NfkWlS5tUtvD8_K_DlUTxk6UUBY6xhKpHM17z_hlwp4y9-tpRBePXJ3XNIpPCu5z6b7yvpNUMi-sw8ZxqeyvFdWWjBATzolqDH7ngUxB4f3V-zv07xOnwS3-UsqHSeDMOdQ8z8nyjPvl26s")',
          }}
        ></div>

        <div className="dashboard-container">

          {/* TOP ROW */}
          <div className="top-section">
            <div className="health-tip-card">
              <div className="tip-header">
                <div className="tip-icon">💡</div>
                <h3>Daily Health Tip</h3>
              </div>
              <div className="tip-content">
                <div className="tip-category">
                  {dashboard.health_tip_of_the_day.category.replace("_", " ")}
                </div>
                <p className="tip-text">{dashboard.health_tip_of_the_day.tip}</p>
                <div className="tip-priority">
                  <span
                    className={`priority-badge ${dashboard.health_tip_of_the_day.priority}`}
                  >
                    {dashboard.health_tip_of_the_day.priority} priority
                  </span>
                </div>
              </div>
            </div>

            <div className="quick-actions">
              <h3>Quick Actions</h3>
              <div className="actions-grid">
                <button className="action-btn" onClick={() => navigate("/chat")}>
                  <span className="action-icon">💬</span>
                  <span>Chat with Dr. Martin</span>
                </button>
                <button
                  className="action-btn"
                  onClick={() => navigate("/schedule")}
                >
                  <span className="action-icon">📅</span>
                  <span>View Schedule</span>
                </button>
                <button
                  className="action-btn"
                  onClick={() => navigate("/documents")}
                >
                  <span className="action-icon">📁</span>
                  <span>My Documents</span>
                </button>
                <button
                  className="action-btn"
                  onClick={() => navigate("/reports")}
                >
                  <span className="action-icon">📊</span>
                  <span>Health Reports</span>
                </button>
              </div>
            </div>
          </div>

          {/* MAIN CONTENT ROW */}
          <div className="main-row">
            <div className="welcome-section">
              <div className="welcome-content">
                <h1 className="welcome-greeting">
                  {getGreeting()}, <span className="username-highlight">{username}!</span>
                </h1>
                <p className="welcome-subtitle">Here's your health overview.</p>
                <div className="last-updated">
                  Last updated: {formatTime(dashboard.latest_time)}
                </div>
                <br />
              </div>

              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-content">
                    <h3>Total Number of chart</h3>
                    <p>{dashboard.total_charts}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-content">
                    <h3>location</h3>
                    <p>{dashboard.location}</p>
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-content">
                    <h3>Active Schedules</h3>
                    <p>{dashboard.number_of_schedules}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="map-card" onClick={handleMapClick}>
              <div className="map-background">
                <div className="map-overlay">
                  <div className="map-content">
                    <div className="map-icon">
                      <span className="material-symbols-outlined nav-icon">
                        map
                      </span>
                    </div>
                    <h3>Healthcare Map</h3>
                    <p>Find hospitals, clinics, and pharmacies near you</p>
                    <div className="map-cta">
                      <span>Explore Nearby Facilities →</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;
