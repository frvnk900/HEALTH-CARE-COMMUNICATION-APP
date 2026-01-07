import React, { useState } from "react";
import { 
  FiTrash2,
  FiLock,
  FiDatabase,
  FiShield,
  FiCheck,
  FiX,
  FiAlertCircle,
  FiDownload,
  FiBarChart2,
  FiUserMinus,
  FiSettings,
  FiMessageSquare
} from "react-icons/fi";
import Sidebar from "../components/menu";
import "./styles/settings.css";

const Settings = () => {
  const [isDeletingChats, setIsDeletingChats] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deleteError, setDeleteError] = useState("");
  const [deleteSuccess, setDeleteSuccess] = useState("");

 
  const getUserId = () => {
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

 
  const deleteChatConversations = async () => {
    const user_id = getUserId();
    if (!user_id) {
      setDeleteError("User not authenticated");
      return;
    }

    if (deleteConfirm.toLowerCase() !== "delete") {
      setDeleteError("Please type 'delete' to confirm");
      return;
    }

    setIsDeletingChats(true);
    setDeleteError("");
    setDeleteSuccess("");

    try {
      const response = await fetch(
        `http://127.0.0.1:8001/user/delete/conversation?user_id=${user_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("authToken")}`
          }
        }
      );

      const data = await response.json();

      if (response.ok) {
        setDeleteSuccess(data.message || "All chat conversations deleted successfully");
        setDeleteConfirm("");
      } else {
        setDeleteError(data.error || "Failed to delete conversations");
      }
    } catch (error) {
      setDeleteError("Network error. Please try again.");
      console.error("Delete error:", error);
    } finally {
      setIsDeletingChats(false);
    }
  };

  // Disabled feature handler
  const handleDisabledFeature = (featureName) => {
    alert(`${featureName} is currently disabled. This feature will be available in a future update.`);
  };

  return (
    <div className="settings-page">
      <div className="settings-container">
        <Sidebar />
        
        {/* Main Content Area - Takes remaining space */}
        <main className="settings-main-content">
          {/* Settings Header */}
          <div className="settings-header-section">
            <div className="settings-title-wrapper">
              <FiSettings className="settings-title-icon" />
              <div>
                <h1 className="settings-title">Settings</h1>
                <p className="settings-subtitle">Manage your account preferences and data settings</p>
              </div>
            </div>
            
            <div className="settings-stats">
              <div className="stat-item">
                <FiMessageSquare />
                <div>
                  <span className="stat-value">Active</span>
                  <span className="stat-label">Status</span>
                </div>
              </div>
            </div>
          </div>

          {/* Settings Grid */}
          <div className="settings-grid-container">
            
            {/* Disabled Features Column */}
            <div className="settings-column">
              <h2 className="column-title">Account Management</h2>
              
              {/* Data Export - DISABLED */}
              <div className="setting-card disabled-card">
 
                <div className="card-content">
                  <h3 className="card-title">Export Data</h3>
                  <p className="card-description">Download a complete copy of your chat history and account information</p>
                </div>
                <button 
                  className="card-button disabled"
                  onClick={() => handleDisabledFeature("Data Export")}
                >
                  Coming Soon
                </button>
              </div>

              {/* Usage Statistics - DISABLED */}
              <div className="setting-card disabled-card">
 
                <div className="card-content">
                  <h3 className="card-title">Usage Statistics</h3>
                  <p className="card-description">View detailed analytics and insights about your app usage patterns</p>
                </div>
                <button 
                  className="card-button disabled"
                  onClick={() => handleDisabledFeature("Usage Statistics")}
                >
                  Coming Soon
                </button>
              </div>

              {/* Account Deletion - DISABLED */}
              <div className="setting-card disabled-card">
 
                <div className="card-content">
                  <h3 className="card-title">Delete Account</h3>
                  <p className="card-description">Permanently remove your account and all associated data from our systems</p>
                </div>
                <button 
                  className="card-button disabled"
                  onClick={() => handleDisabledFeature("Account Deletion")}
                >
                  Coming Soon
                </button>
              </div>
            </div>

            {/* Working Features Column */}
            <div className="settings-column">
              <h2 className="column-title">Privacy & Security</h2>
              
              {/* Delete Chat Conversations - WORKING */}
              <div className="setting-card working-card danger-card">
 
                <div className="card-content">
                  <h3 className="card-title">Delete Chat Conversations</h3>
                  <p className="card-description">Permanently delete all your chat history and conversations. This action cannot be undone and will remove all your messages.</p>
                  
                  <div className="delete-action-section">
                    <div className="confirmation-input-group">
                      <input
                        type="text"
                        placeholder="Type 'delete' to confirm this action"
                        value={deleteConfirm}
                        onChange={(e) => setDeleteConfirm(e.target.value)}
                        disabled={isDeletingChats}
                        className="confirmation-input"
                      />
                      <button
                        className="action-button danger"
                        onClick={deleteChatConversations}
                        disabled={isDeletingChats || deleteConfirm.toLowerCase() !== "delete"}
                      >
                        {isDeletingChats ? (
                          <>
                            <span className="button-spinner"></span>
                            Processing...
                          </>
                        ) : (
                          "Delete All Conversations"
                        )}
                      </button>
                    </div>

                    {deleteError && (
                      <div className="message error">
                        <FiX /> {deleteError}
                      </div>
                    )}

                    {deleteSuccess && (
                      <div className="message success">
                        <FiCheck /> {deleteSuccess}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Password Reset - DISABLED */}
              <div className="setting-card disabled-card">
 
                <div className="card-content">
                  <h3 className="card-title">Change Password</h3>
                  <p className="card-description">Update your account password for enhanced security and protection</p>
                </div>
                <button 
                  className="card-button disabled"
                  onClick={() => handleDisabledFeature("Password Change")}
                >
                  Coming Soon
                </button>
              </div>

              {/* Data Privacy - DISABLED */}
              <div className="setting-card disabled-card">
 
                <div className="card-content">
                  <h3 className="card-title">Privacy Settings</h3>
                  <p className="card-description">Manage your data privacy, sharing preferences, and visibility controls</p>
                </div>
                <button 
                  className="card-button disabled"
                  onClick={() => handleDisabledFeature("Privacy Settings")}
                >
                  Coming Soon
                </button>
              </div>
            </div>
          </div>

          {/* App Info Footer */}
          <div className="app-info-footer">
            <div className="app-info-content">
              <div className="app-version">
                <span className="version-label">App Version</span>
                <span className="version-value">1.0.0</span>
              </div>
              <div className="app-version">
                <span className="version-label">Last Updated</span>
                <span className="version-value">December 2025</span>
              </div>
              <div className="app-version">
                <span className="version-label">Developer</span>
                <span className="version-value">HealthCareAI Team</span>
              </div>
            </div>
            <p className="copyright-text">© 2025 HealthCareAI. All rights reserved.</p>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;