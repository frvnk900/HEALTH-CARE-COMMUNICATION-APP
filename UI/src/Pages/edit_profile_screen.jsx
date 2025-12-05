import React from "react";
import "./styles/edit_profile.css";

function EditProfile() {
  const [formData, setFormData] = React.useState({
    username: "",
    age: "",
    gender: "",
    email: "",
    phone: "",
    location: "",
  });
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [message, setMessage] = React.useState({ type: "", text: "" });
  const [userProfile, setUserProfile] = React.useState(null);
  
  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [currentField, setCurrentField] = React.useState("");
  const [currentValue, setCurrentValue] = React.useState("");
  const [fieldLabel, setFieldLabel] = React.useState("");

  // Get user_id from JWT token
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

  // Fetch user profile data
  const fetchUserProfile = async () => {
    const user_id = getUserIdFromToken();
    if (!user_id) {
      setMessage({ type: "error", text: "User not authenticated" });
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://127.0.0.1:8001/user/v1/profile/?user_id=${user_id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (data.user_profile) {
        setUserProfile(data.user_profile);
        setFormData({
          username: data.user_profile.username || "",
          age: data.user_profile.age || "",
          gender: data.user_profile.gender || "Female",
          email: data.user_profile.email || "",
          phone: data.user_profile.phone || "",
          location: data.user_profile.location || "",
        });
      } else {
        throw new Error(data.error || "Failed to fetch profile");
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      setMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Update user profile
  const updateUserProfile = async (updateData) => {
    const user_id = getUserIdFromToken();
    if (!user_id) {
      setMessage({ type: "error", text: "User not authenticated" });
      return false;
    }

    try {
      const response = await fetch("http://127.0.0.1:8001/user/v1/profile/", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: user_id,
          ...updateData,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return { success: true, message: data.message };
    } catch (error) {
      console.error("Error updating profile:", error);
      return { success: false, message: error.message };
    }
  };

  // Open edit dialog for a specific field
  const openEditDialog = (fieldName, currentValue, label) => {
    setCurrentField(fieldName);
    setCurrentValue(currentValue);
    setFieldLabel(label);
    setIsDialogOpen(true);
  };

  // Close edit dialog
  const closeEditDialog = () => {
    setIsDialogOpen(false);
    setCurrentField("");
    setCurrentValue("");
    setFieldLabel("");
  };

  // Save individual field
  const saveField = async () => {
    if (!currentField) return;

    setIsSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const updateData = {
        [currentField]: currentValue
      };

      const result = await updateUserProfile(updateData);

      if (result.success) {
        setMessage({ type: "success", text: result.message });
        // Update local state
        setFormData(prev => ({
          ...prev,
          [currentField]: currentValue
        }));
        setUserProfile(prev => ({
          ...prev,
          [currentField]: currentValue
        }));
        closeEditDialog();
      } else {
        setMessage({ type: "error", text: result.message });
      }
    } catch (error) {
      setMessage({ type: "error", text: "An unexpected error occurred" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setMessage({ type: "", text: "" });
    console.log("Changes cancelled");
  };

  const handleDeleteAccount = () => {
    console.log("Account deletion requested");
  };

  const handleBack = () => {
    window.history.back();
  };

  const handlePhotoChange = () => {
    console.log("Change photo clicked");
  };

  // Get profile image URL
  const getProfileImageUrl = () => {
    if (!userProfile || !userProfile.profile_image) {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuDVTGFi2eCg8_nobmGuq0yOprS4FU-rwO0bZX19WrB9hfPjyeo_mcsEHjnfyAo-HfnNf3vwyJ14PEM0Gd8B9NGb-_Va91_uI-9hcKQbbz7lvzBtiwvAc56kLKMevhaThE2NtOu8dLbt9iY6O6ia0BMRBy7RSUXrnoumOQm7PdksevVlVy43AKv_0TlMKKn_8vspzUJUNofi1HYi0hDoIIm3BtY-jPpWgKU1P7aUicH6Ish-QEcUk1gkTGWQJ1JA6o1E9nDJUmyhUu0";
    }

    if (userProfile.profile_image.startsWith("http")) {
      return userProfile.profile_image;
    } else {
      return `http://127.0.0.1:8001/uploads/${userProfile.profile_image}`;
    }
  };

  // Get user display name
  const getUserDisplayName = () => {
    if (!userProfile) return "Loading...";
    return userProfile.full_name || userProfile.username || userProfile.email?.split("@")[0] || "User";
  };

  React.useEffect(() => {
    fetchUserProfile();
  }, []);

  if (isLoading) {
    return (
      <div className="editprofile-root font-display dark">
        <div className="layout-container">
          <div className="toolbar-section">
            <button className="back-button" onClick={handleBack}>
              <span className="material-symbols-outlined back-icon">
                arrow_back
              </span>
              <span className="back-text">Back</span>
            </button>
          </div>
          <div className="content-container">
            <div className="content-wrapper">
              <div className="loading-container">
                <div className="loading-spinner-large"></div>
                <p>Loading profile...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="editprofile-root font-display dark">
      <div className="layout-container">
        {/* Toolbar with Back Button */}
        <div className="toolbar-section">
          <button className="back-button" onClick={handleBack}>
            <span className="material-symbols-outlined back-icon">
              arrow_back
            </span>
            <span className="back-text">Back</span>
          </button>
        </div>

        <div className="content-container">
          <div className="content-wrapper">
            {/* Page Heading */}
            <div className="page-heading">
              <h1 className="page-title">Edit Profile</h1>
            </div>

            {/* Message Display */}
            {message.text && (
              <div
                className={`message-box ${
                  message.type === "error"
                    ? "error-message"
                    : message.type === "success"
                    ? "success-message"
                    : "info-message"
                }`}
              >
                {message.text}
              </div>
            )}

            {/* Profile Header */}
            <div className="profile-header">
              <div className="profile-info-section">
                <div className="profile-avatar-section">
                  <div
                    className="profile-avatar"
                    data-alt="User profile avatar"
                    style={{
                      backgroundImage: `url("${getProfileImageUrl()}")`,
                    }}
                  ></div>
                  <div className="profile-details">
                    <p className="profile-name">{getUserDisplayName()}</p>
                    <p className="profile-upload-text">Upload New Photo</p>
                  </div>
                </div>
                <button
                  className="change-photo-button"
                  type="button"
                  onClick={handlePhotoChange}
                >
                  <span className="button-text">Change</span>
                </button>
              </div>
            </div>

            {/* Profile Information Cards */}
            <div className="profile-sections">
              {/* Personal Information Card */}
              <div className="profile-card">
                <div className="card-header">
                  <h3 className="card-title">Personal Information</h3>
                </div>
                <div className="card-content">
                  <div className="info-item">
                    <span className="info-label">Full Name</span>
                    <span className="info-value">{formData.username || "Not set"}</span>
                    <button 
                      className="edit-field-button"
                      onClick={() => openEditDialog("username", formData.username, "Full Name")}
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Age</span>
                    <span className="info-value">{formData.age || "Not set"}</span>
                    <button 
                      className="edit-field-button"
                      onClick={() => openEditDialog("age", formData.age, "Age")}
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Gender</span>
                    <span className="info-value">{formData.gender || "Not set"}</span>
                    <button 
                      className="edit-field-button"
                      onClick={() => openEditDialog("gender", formData.gender, "Gender")}
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Contact Information Card */}
              <div className="profile-card">
                <div className="card-header">
                  <h3 className="card-title">Contact Information</h3>
                </div>
                <div className="card-content">
                  <div className="info-item">
                    <span className="info-label">Email</span>
                    <span className="info-value">{formData.email || "Not set"}</span>
                    <button 
                      className="edit-field-button"
                      onClick={() => openEditDialog("email", formData.email, "Email")}
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                  
                  <div className="info-item">
                    <span className="info-label">Phone</span>
                    <span className="info-value">{formData.phone || "Not set"}</span>
                    <button 
                      className="edit-field-button"
                      onClick={() => openEditDialog("phone", formData.phone, "Phone Number")}
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Location Information Card */}
              <div className="profile-card">
                <div className="card-header">
                  <h3 className="card-title">Location Information</h3>
                </div>
                <div className="card-content">
                  <div className="info-item">
                    <span className="info-label">Location</span>
                    <span className="info-value">{formData.location || "Not set"}</span>
                    <button 
                      className="edit-field-button"
                      onClick={() => openEditDialog("location", formData.location, "Location")}
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Destructive Section */}
            <div className="destructive-section">
              <h4 className="destructive-title">Delete Account</h4>
              <p className="destructive-description">
                Once you delete your account, there is no going back. All of
                your medical data and profile information will be permanently
                removed. Please be certain.
              </p>
              <button className="delete-button" onClick={handleDeleteAccount}>
                <span className="button-text">Delete My Account</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Field Dialog */}
      {isDialogOpen && (
        <div className="dialog-overlay">
          <div className="dialog-container">
            <div className="dialog-header">
              <h3 className="dialog-title">Edit {fieldLabel}</h3>
              <button className="dialog-close" onClick={closeEditDialog}>
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            
            <div className="dialog-content">
              <div className="form-group">
                <label className="form-label">
                  <p className="label-text">{fieldLabel}</p>
                  {currentField === "gender" ? (
                    <select
                      className="form-select"
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)}
                    >
                      <option value="Female">Female</option>
                      <option value="Male">Male</option>
                      <option value="Other">Other</option>
                      <option value="Prefer not to say">Prefer not to say</option>
                    </select>
                  ) : currentField === "age" ? (
                    <input
                      className="form-input"
                      type="number"
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)}
                      placeholder={`Enter your ${fieldLabel.toLowerCase()}`}
                      min="1"
                      max="120"
                    />
                  ) : (
                    <input
                      className="form-input"
                      type={currentField === "email" ? "email" : "text"}
                      value={currentValue}
                      onChange={(e) => setCurrentValue(e.target.value)}
                      placeholder={`Enter your ${fieldLabel.toLowerCase()}`}
                    />
                  )}
                </label>
              </div>
            </div>
            
            <div className="dialog-actions">
              <button
                className="dialog-cancel"
                onClick={closeEditDialog}
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                className="dialog-save"
                onClick={saveField}
                disabled={isSaving}
              >
                {isSaving ? (
                  <div className="button-loading">
                    <div className="button-spinner"></div>
                    <span>Saving...</span>
                  </div>
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default EditProfile;