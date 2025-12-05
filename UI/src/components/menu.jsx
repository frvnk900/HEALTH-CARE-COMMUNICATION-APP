 import React from "react";
import "./styles/menu.css";

function Sidebar() {
  const [userProfile, setUserProfile] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState(null);
 
  const getUserIdFromToken = () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      console.error("No authentication token found");
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.user_id;
    } catch (error) {
      console.error("Error decoding token:", error);
      return null;
    }
  };

 
  const fetchUserProfile = async () => {
    const user_id = getUserIdFromToken();
    if (!user_id) {
      setError("User not authenticated");
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:8001/user/v1/profile/?user_id=${user_id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.user_profile) {
        setUserProfile(data.user_profile);
      } else {
        throw new Error(data.error || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

 
  const getProfileImageUrl = () => {
    if (!userProfile || !userProfile.profile_image) {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuCitvdvFaIgP7HWKefz-y3Hf-68h-Q14GCW5LHQnAekfC1Ys5Q7cW3eW5qa2hXMAgcL1PN3Ux1TjCc9fi-Kenf4cI3ZlJjletoipgQNnfS72tkWqceZe63pqJuIiRHldcaqCRUt0IK6YHlafC0BuvtgrYsSWeWIlOaMFFtrLmIa5u1Bomij0GLFRUuTANFk7ilXEvu7eapr4iGJyb7yCU0vYAlDi6ChmpQ8kW_4nJ5DAXnfQdCE63ly5wCdCYR57dik1aaWZTf0qVM";
    }

 
    if (userProfile.profile_image.startsWith("http")) {
      return userProfile.profile_image;
    } else {
      
      return `http://127.0.0.1:8001/uploads/${userProfile.profile_image}`;
    }
  };

 
  const getUserDisplayName = () => {
    if (!userProfile) return "User";

    if (userProfile.full_name) {
      return userProfile.full_name;
    } else if (userProfile.username) {
      return userProfile.username;
    } else {
      return userProfile.email?.split("@")[0] || "User";
    }
  };

 
  const getUserEmail = () => {
    if (!userProfile) return "user@example.com";
    return userProfile.email || "user@example.com";
  };

 
  const handleLogout = () => {
    try {
       
      localStorage.clear();
      
    
      sessionStorage.clear();
      
      console.log("All localStorage items cleared successfully");
      
      
      window.location.href = "/login";
      
    } catch (error) {
      console.error("Error during logout:", error);
  
      localStorage.removeItem("authToken");
      localStorage.removeItem("user_id");
      localStorage.removeItem("username");
      localStorage.removeItem("email");
      localStorage.removeItem("userProfile");
      
      
      window.location.href = "/login";
    }
  };

   
  const handleLogoutWithConfirmation = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      handleLogout();
    }
  };

  React.useEffect(() => {
    fetchUserProfile();
  }, []);

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <div className="sidebar-top">
          <div className="profile-section">
            {isLoading ? (
              <div className="profile-image loading">
                <div className="loading-spinner-small"></div>
              </div>
            ) : error ? (
              <div
                className="profile-image error"
                style={{
                  backgroundImage:
                    'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCitvdvFaIgP7HWKefz-y3Hf-68h-Q14GCW5LHQnAekfC1Ys5Q7cW3eW5qa2hXMAgcL1PN3Ux1TjCc9fi-Kenf4cI3ZlJjletoipgQNnfS72tkWqceZe63pqJuIiRHldcaqCRUt0IK6YHlafC0BuvtgrYsSWeWIlOaMFFtrLmIa5u1Bomij0GLFRUuTANFk7ilXEvu7eapr4iGJyb7yCU0vYAlDi6ChmpQ8kW_4nJ5DAXnfQdCE63ly5wCdCYR57dik1aaWZTf0qVM")',
                }}
              ></div>
            ) : (
              <div
                className="profile-image"
                data-alt={`Profile picture of ${getUserDisplayName()}`}
                style={{
                  backgroundImage: `url("${getProfileImageUrl()}")`,
                }}
              ></div>
            )}

            <div className="profile-info">
              {isLoading ? (
                <>
                  <p className="profile-name loading-text">Loading...</p>
                  <p className="profile-email loading-text">Loading...</p>
                </>
              ) : error ? (
                <>
                  <p className="profile-name">User</p>
                  <p className="profile-email error-text">
                    Failed to load profile
                  </p>
                </>
              ) : (
                <>
                  <p className="profile-name">{getUserDisplayName()}</p>
                  <p className="profile-email">{getUserEmail()}</p>
                </>
              )}
            </div>
          </div>

          <nav className="sidebar-nav">
            <a className="nav-item" href="/home">
              <span className="material-symbols-outlined nav-icon">home</span>
              <p className="nav-text">Home</p>
            </a>
            <a className="nav-item" href="/profile">
              <span className="material-symbols-outlined nav-icon">
                account_circle
              </span>
              <p className="nav-text">Profile</p>
            </a>
            <a className="nav-item" href="/dashboard">
              <span className="material-symbols-outlined nav-icon">
                dashboard
              </span>
              <p className="nav-text">Dashboard</p>
            </a>
            <a className="nav-item" href="/map">
              <span className="material-symbols-outlined nav-icon">map</span>
              <p className="nav-text">Map</p>
            </a>
            <a className="nav-item" href="/schedule">
              <span className="material-symbols-outlined nav-icon">
                calendar_month
              </span>
              <p className="nav-text">Schedule</p>
            </a>
            <a className="nav-item" href="/settings">
              <span className="material-symbols-outlined nav-icon">
                settings
              </span>
              <p className="nav-text">Settings</p>
            </a>
            <a className="nav-item" href="/team-contact">
              <span className="material-symbols-outlined nav-icon">group</span>
              <p className="nav-text">Team/Contact Us</p>
            </a>
            <a className="nav-item" href="/help">
              <span className="material-symbols-outlined nav-icon">help</span>
              <p className="nav-text">Help</p>
            </a>
          </nav>
        </div>

        <div className="sidebar-bottom">
          <button 
            className="nav-item logout-item" 
            onClick={handleLogoutWithConfirmation}
            title="Log out of your account"
          >
            <span className="material-symbols-outlined nav-icon">logout</span>
            <p className="nav-text">Logout</p>
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;