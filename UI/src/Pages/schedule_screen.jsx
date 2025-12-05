import React, { useState, useEffect } from "react";
import { io } from "socket.io-client";
import Sidebar from "../components/menu";
import "./styles/schedule.css";

function Schedule() {
  const [schedules, setSchedules] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState(null);
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  const [newSchedule, setNewSchedule] = useState({
    schedule_title: "",
    description: "",
    active: true,
    ends_on: "",
    calendar_data: Array(7)
      .fill()
      .map((_, index) => ({
        time: "",
        day: [
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
          "sunday",
        ][index],
        remind_me: false,
      })),
  });

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

  const fetchSchedules = async () => {
    const user_id = getUserIdFromToken();
    if (!user_id) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8001/schedule/v1/schedules?user_id=${user_id}`
      );
      const data = await response.json();

      if (data.success) {
        setSchedules(data.schedules);
      } else {
        console.error("Failed to fetch schedules:", data.message);
      }
    } catch (error) {
      console.error("Error fetching schedules:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Add new schedule
  const addSchedule = async () => {
    const user_id = getUserIdFromToken();
    if (!user_id) return;

    try {
      const response = await fetch(
        `http://127.0.0.1:8001/schedule/v1/new?user_id=${user_id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(newSchedule),
        }
      );

      const data = await response.json();

      if (data.success) {
        setShowAddForm(false);
        setNewSchedule({
          schedule_title: "",
          description: "",
          active: true,
          ends_on: "",
          calendar_data: Array(7)
            .fill()
            .map((_, index) => ({
              time: "",
              day: [
                "monday",
                "tuesday",
                "wednesday",
                "thursday",
                "friday",
                "saturday",
                "sunday",
              ][index],
              remind_me: false,
            })),
        });
        fetchSchedules();
      } else {
        alert("Failed to add schedule: " + data.message);
      }
    } catch (error) {
      console.error("Error adding schedule:", error);
    }
  };

  // Update schedule
  const updateSchedule = async (scheduleId, updates) => {
    const user_id = getUserIdFromToken();
    if (!user_id) return;

    try {
      const response = await fetch("http://127.0.0.1:8001/schedule/v1/update", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
          ...updates,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setEditingSchedule(null);
        fetchSchedules();
      } else {
        alert("Failed to update schedule: " + data.message);
      }
    } catch (error) {
      console.error("Error updating schedule:", error);
    }
  };

  // Handle time format conversion
  const formatTimeForDisplay = (time) => {
    if (!time) return "";
    return time;
  };

  const formatTimeForSubmit = (time) => {
    if (!time) return null;
    return time.toLowerCase().includes("am") ||
      time.toLowerCase().includes("pm")
      ? time
      : time + "am";
  };

  // Handle day time change
  const handleDayTimeChange = (dayIndex, field, value) => {
    const updatedCalendar = [...newSchedule.calendar_data];
    if (field === "time") {
      updatedCalendar[dayIndex].time = value;
    } else {
      updatedCalendar[dayIndex].remind_me = value;
    }
    setNewSchedule((prev) => ({ ...prev, calendar_data: updatedCalendar }));
  };

  useEffect(() => {
    fetchSchedules();

    // Socket connection - UPDATED
    const user_id = getUserIdFromToken();
    if (user_id) {
      const newSocket = io("http://127.0.0.1:8001", {
        transports: ["websocket", "polling"],
      });

      newSocket.on("connect", () => {
        console.log("Connected to schedule server");
        setIsConnected(true);
        // Register user with the server
        newSocket.emit("register", { user_id });
      });

      newSocket.on("registered", (data) => {
        console.log("Registered for monitoring:", data);
      });

      newSocket.on("schedule_alert", (data) => {
        console.log("Schedule alert:", data);
      });

      newSocket.on("disconnect", () => {
        setIsConnected(false);
      });

      setSocket(newSocket);

      return () => {
        if (newSocket) newSocket.close();
      };
    }
  }, []);

  return (
    <div className="schedule-root font-display dark">
      {/* Background Layers */}
      <div
        className="background-image-layer"
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAovHvPqau8CimngJH5F2Vs6tgVDFseLijm00uL0AJgEw1lKnuUrC9oY20EcsWgcL-ijBOBsG7o49JO-964fGBn4cp_R2FZGOVZylEdb8WakK1NpPSX8ghuhyozjzOZQv19sgH0EXsWRDrTtERG2fQbdYstbBxueIYs4CJvslTbY903lQpoLShLP4SREPoaF3ZSg5IyJ285pBjKVtlRVmC75fRT3wf2WA6r8-78fFEVuWbLGvBsJI0M1HMm-Pzd-Z6mxkK60U6NHxo")',
        }}
      ></div>
      <div className="background-overlay"></div>
      
      {/* Connection Status - UPDATED with Google Icons */}
      <div className={`connection-status ${isConnected ? "connected" : "disconnected"}`}>
        {isConnected ? (
          <>
            <span className="material-symbols-outlined">wifi</span>
            <span>Online</span>
          </>
        ) : (
          <>
            <span className="material-symbols-outlined">wifi_off</span>
            <span>Offline</span>
          </>
        )}
      </div>
      
      <div className="schedule-container">
        <Sidebar />

        <main className="main-content">
          <div className="content-wrapper">
            {/* Header */}
            <div className="schedule-header">
              <h1 className="schedule-title">Medication Schedule</h1>
              <p className="schedule-subtitle">
                Manage your medication reminders and schedules
              </p>
              <button
                className="add-schedule-btn"
                onClick={() => setShowAddForm(true)}
              >
                <span className="material-symbols-outlined">add</span>
                Add New Schedule
              </button>
            </div>

            {/* Schedules List */}
            <div className="schedules-container">
              {isLoading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p>Loading schedules...</p>
                </div>
              ) : schedules.length === 0 ? (
                <div className="empty-state">
                  <span className="material-symbols-outlined">schedule</span>
                  <h3>No schedules yet</h3>
                  <p>Create your first medication schedule to get started</p>
                </div>
              ) : (
                <div className="schedules-grid">
                  {schedules.map((schedule) => (
                    <div key={schedule.schedule_id} className="schedule-card">
                      <div className="schedule-header">
                        <h3 className="schedule-name">
                          {schedule.schedule_title}
                        </h3>
                        <div className="schedule-status">
                          <span
                            className={`status-badge ${
                              schedule.active ? "active" : "inactive"
                            }`}
                          >
                            {schedule.active ? "Active" : "Inactive"}
                          </span>
                        </div>
                      </div>

                      <p className="schedule-description">
                        {schedule.description}
                      </p>

                      <div className="schedule-details">
                        <div className="detail-item">
                          <span className="detail-label">Ends on:</span>
                          <span className="detail-value">
                            {schedule.ends_on}
                          </span>
                        </div>
                      </div>

                      <div className="schedule-days">
                        <h4>Scheduled Days:</h4>
                        {schedule.calendar_data
                          .filter((day) => day.time)
                          .map((day, index) => (
                            <div key={index} className="day-schedule">
                              <span className="day-name">{day.day}</span>
                              <span className="day-time">
                                {formatTimeForDisplay(day.time)}
                              </span>
                              {day.remind_me && (
                                <span className="reminder-indicator">
                                  <span className="material-symbols-outlined">notifications</span>
                                </span>
                              )}
                            </div>
                          ))}
                      </div>

                      <div className="schedule-actions">
                        <button
                          className="action-btn complete"
                          onClick={() =>
                            updateSchedule(schedule.schedule_id, {
                              new_active: !schedule.active,
                            })
                          }
                        >
                          {schedule.active ? "Mark Complete" : "Reactivate"}
                        </button>
                        <button
                          className="action-btn edit"
                          onClick={() => setEditingSchedule(schedule)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Add Schedule Modal - UPDATED ICONS */}
      {showAddForm && (
        <div className="modal-overlay">
          <div className="modal-content schedule-modal">
            <div className="modal-header">
              <div className="modal-title-section">
                <span className="modal-icon material-symbols-outlined">calendar_add_on</span>
                <div>
                  <h2>Create New Schedule</h2>
                  <p className="modal-subtitle">
                    Set up your medication reminders
                  </p>
                </div>
              </div>
              <button
                className="close-btn"
                onClick={() => setShowAddForm(false)}
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="modal-body">
              <div className="form-sections">
                {/* Basic Information Section */}
                <div className="form-section">
                  <div className="section-header">
                    <span className="section-icon material-symbols-outlined">description</span>
                    <h3>Basic Information</h3>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-text">Schedule Title</span>
                        <span className="label-required">*</span>
                      </label>
                      <input
                        type="text"
                        value={newSchedule.schedule_title}
                        onChange={(e) =>
                          setNewSchedule((prev) => ({
                            ...prev,
                            schedule_title: e.target.value,
                          }))
                        }
                        placeholder="e.g., Morning Medication"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <span className="label-text">End Date</span>
                        <span className="label-required">*</span>
                      </label>
                      <div className="date-input-container">
                        <input
                          type="text"
                          value={newSchedule.ends_on}
                          onChange={(e) =>
                            setNewSchedule((prev) => ({
                              ...prev,
                              ends_on: e.target.value,
                            }))
                          }
                          placeholder="mon/dd/yyyy"
                          className="form-input"
                        />
                        <span className="date-format">e.g., mon/12/2024</span>
                      </div>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      <span className="label-text">Description</span>
                      <span className="label-optional">(optional)</span>
                    </label>
                    <textarea
                      value={newSchedule.description}
                      onChange={(e) =>
                        setNewSchedule((prev) => ({
                          ...prev,
                          description: e.target.value,
                        }))
                      }
                      placeholder="Add any notes or instructions for this schedule..."
                      rows="3"
                      className="form-textarea"
                    />
                  </div>
                </div>

                {/* Schedule Settings Section */}
                <div className="form-section">
                  <div className="section-header">
                    <span className="section-icon material-symbols-outlined">settings</span>
                    <h3>Schedule Settings</h3>
                  </div>
                  <div className="toggle-group">
                    <label className="toggle-label">
                      <div className="toggle-info">
                        <span className="toggle-title">Active Schedule</span>
                        <span className="toggle-description">
                          Schedule will send reminders when active
                        </span>
                      </div>
                      <div className="toggle-switch">
                        <input
                          type="checkbox"
                          checked={newSchedule.active}
                          onChange={(e) =>
                            setNewSchedule((prev) => ({
                              ...prev,
                              active: e.target.checked,
                            }))
                          }
                          className="toggle-input"
                        />
                        <span className="toggle-slider"></span>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Daily Schedule Section */}
                <div className="form-section">
                  <div className="section-header">
                    <span className="section-icon material-symbols-outlined">schedule</span>
                    <h3>Daily Schedule</h3>
                    <span className="section-badge">
                      {
                        newSchedule.calendar_data.filter((day) => day.time)
                          .length
                      }{" "}
                      days set
                    </span>
                  </div>
                  <p className="section-description">
                    Set specific times for each day. Leave blank for days
                    without medication.
                  </p>

                  <div className="days-grid">
                    {newSchedule.calendar_data.map((day, index) => (
                      <div
                        key={day.day}
                        className={`day-card ${day.time ? "active" : ""}`}
                      >
                        <div className="day-header">
                          <span className="day-name">{day.day}</span>
                          <label className="reminder-toggle">
                            <input
                              type="checkbox"
                              checked={day.remind_me}
                              onChange={(e) =>
                                handleDayTimeChange(
                                  index,
                                  "remind_me",
                                  e.target.checked
                                )
                              }
                              disabled={!day.time}
                            />
                            <span className="reminder-dot"></span>
                          </label>
                        </div>

                        <div className="time-input-container">
                          <input
                            type="text"
                            placeholder="08:00AM"
                            value={day.time}
                            onChange={(e) =>
                              handleDayTimeChange(index, "time", e.target.value)
                            }
                            className="time-input"
                          />
                          {day.time && (
                            <button
                              type="button"
                              className="clear-time-btn"
                              onClick={() =>
                                handleDayTimeChange(index, "time", "")
                              }
                              title="Clear time"
                            >
                              <span className="material-symbols-outlined">
                                close
                              </span>
                            </button>
                          )}
                        </div>

                        {day.time && day.remind_me && (
                          <div className="reminder-indicator">
                            <span className="material-symbols-outlined">
                              notifications_active
                            </span>
                            Reminders on
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <div className="actions-left">
                <button
                  className="btn-secondary"
                  onClick={() => setShowAddForm(false)}
                >
                  <span className="material-symbols-outlined">close</span>
                  Cancel
                </button>
              </div>
              <div className="actions-right">
                <button
                  className="btn-outline"
                  onClick={() => {
                    setNewSchedule({
                      schedule_title: "",
                      description: "",
                      active: true,
                      ends_on: "",
                      calendar_data: Array(7)
                        .fill()
                        .map((_, index) => ({
                          time: "",
                          day: [
                            "monday",
                            "tuesday",
                            "wednesday",
                            "thursday",
                            "friday",
                            "saturday",
                            "sunday",
                          ][index],
                          remind_me: false,
                        })),
                    });
                  }}
                >
                  <span className="material-symbols-outlined">restart_alt</span>
                  Reset
                </button>
                <button
                  className="btn-primary"
                  onClick={addSchedule}
                  disabled={!newSchedule.schedule_title || !newSchedule.ends_on}
                >
                  <span className="material-symbols-outlined">check</span>
                  Create Schedule
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {editingSchedule && (
        <EditScheduleModal
          schedule={editingSchedule}
          onClose={() => setEditingSchedule(null)}
          onSave={updateSchedule}
        />
      )}
    </div>
  );
}

// Edit Schedule Modal Component - UPDATED
function EditScheduleModal({ schedule, onClose, onSave }) {
  const [editedSchedule, setEditedSchedule] = useState(schedule);

  const handleSave = () => {
    onSave(schedule.schedule_id, {
      new_end_on: editedSchedule.ends_on,
      new_active: editedSchedule.active,
    });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Edit Schedule</h2>
          <button className="close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Schedule Title</label>
            <input
              type="text"
              value={editedSchedule.schedule_title}
              onChange={(e) =>
                setEditedSchedule((prev) => ({
                  ...prev,
                  schedule_title: e.target.value,
                }))
              }
            />
          </div>

          <div className="form-group">
            <label>End Date (mon/dd/yyyy)</label>
            <input
              type="text"
              value={editedSchedule.ends_on}
              onChange={(e) =>
                setEditedSchedule((prev) => ({
                  ...prev,
                  ends_on: e.target.value,
                }))
              }
              placeholder="e.g., mon/12/2024"
            />
          </div>

          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={editedSchedule.active}
                onChange={(e) =>
                  setEditedSchedule((prev) => ({
                    ...prev,
                    active: e.target.checked,
                  }))
                }
              />
              <span className="material-symbols-outlined">toggle_on</span>
              Active Schedule
            </label>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
            Cancel
          </button>
          <button className="btn-primary" onClick={handleSave}>
            <span className="material-symbols-outlined">save</span>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

export default Schedule;