 import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import "./styles/notification.css";
import { useAuth } from '../context/AuthContext';

function Notification() {
  const [notifications, setNotifications] = useState([]);
  const [socket, setSocket] = useState(null);
  const { isAuthenticated } = useAuth();

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

  const addNotification = (title, type = "reminder") => {
    const newNotification = {
      id: Date.now(),
      title,
      type,
      timestamp: new Date(),
      read: false,
    };
    setNotifications((prev) => [newNotification, ...prev]);
  };

  const markAsComplete = (notificationId) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  const handleEdit = (notificationId) => {
    window.location.href = "/schedule";
  };

  // Socket effect - UPDATED
  useEffect(() => {
    if (!isAuthenticated) return;

    const user_id = getUserIdFromToken();
    if (!user_id) return;

    const newSocket = io("http://127.0.0.1:8001", {
      transports: ["websocket", "polling"],
    });

    newSocket.on("connect", () => {
      console.log("Connected to notification server");
      // Register user for reminder monitoring
      newSocket.emit("register", { user_id });
    });

    newSocket.on("registered", (data) => {
      console.log("Registered for reminders:", data.user_id);
    });

    newSocket.on("schedule_alert", (data) => {
      if (data.success && data.reminder_title) {
        addNotification(data.reminder_title, "reminder");
      }
    });

    newSocket.on("disconnect", () => {
      console.log("Disconnected from notification server");
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [isAuthenticated]);

  // Auto-remove notifications after 10 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setNotifications((prev) =>
        prev.filter((n) => Date.now() - n.timestamp.getTime() < 10000)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  if (!isAuthenticated || notifications.length === 0) return null;

  return (
    <div className="notification-container">
      {notifications.map((notification) => (
        <div key={notification.id} className={`notification ${notification.type}`}>
          <div className="notification-icon">
            {notification.type === "reminder" ? (
              <span className="material-symbols-outlined">notifications</span>
            ) : (
              <span className="material-symbols-outlined">info</span>
            )}
          </div>
          <div className="notification-content">
            <h4 className="notification-title">{notification.title}</h4>
            <p className="notification-time">
              {notification.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </p>
          </div>
          <div className="notification-actions">
            <button 
              className="action-btn complete" 
              onClick={() => markAsComplete(notification.id)} 
              title="Mark as complete"
            >
              <span className="material-symbols-outlined">check</span>
            </button>
            <button 
              className="action-btn edit" 
              onClick={() => handleEdit(notification.id)} 
              title="Edit schedule"
            >
              <span className="material-symbols-outlined">edit</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Notification;