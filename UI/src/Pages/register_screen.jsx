import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./styles/register.css";

const API_BASE_URL = "http://127.0.0.1:8001/auth/v1/register-user";

function Signup() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    age: "",
    gender: "",
    password: "",
    location: "",
    agreeToTerms: false,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [isLoading, setIsLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === "file") {
      const file = files[0];
      setProfileImage(file);

      // Create preview URL
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setProfilePreview(e.target.result);
        };
        reader.readAsDataURL(file);
      } else {
        setProfilePreview(null);
      }
    } else {
      setFormData((prevState) => ({
        ...prevState,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleImageClick = () => {
    document.getElementById("profile-image-input").click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage({ type: "", text: "" });

    if (!profileImage) {
      setMessage({ type: "error", text: "Please upload a profile image." });
      return;
    }

    setIsLoading(true);

    const data = new FormData();
    data.append("username", formData.username);
    data.append("gender", formData.gender);
    data.append("email", formData.email);
    data.append("password", formData.password);
    data.append("phone", formData.phone);
    data.append("age", formData.age);
    data.append("location", formData.location);
    data.append("profile_image", profileImage);

    try {
      const response = await axios.post(API_BASE_URL, data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 30000,
      });

      setMessage({ type: "success", text: response.data.message });
      console.log("Registration successful:", response.data);

      // Auto-login after successful registration
      if (response.data.token) {
        const userData = {
          user_id: response.data.user_id || extractUserIdFromToken(response.data.token),
          email: formData.email,
          username: formData.username
        };
        
        login(response.data.token, userData);
        
        // Redirect to home after a brief delay to show success message
        setTimeout(() => {
          navigate('/home');
        }, 1500);
      } else {
        // If no token is returned, redirect to login
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      }

      // Reset form on success
      setFormData({
        username: "",
        email: "",
        phone: "",
        age: "",
        gender: "",
        password: "",
        location: "",
        agreeToTerms: false,
      });
      setProfileImage(null);
      setProfilePreview(null);

    } catch (error) {
      const errorMsg =
        error.response?.data?.error ||
        error.message ||
        "An unknown error occurred during registration.";
      setMessage({ type: "error", text: errorMsg });
      console.error("Registration failed:", error.response || error);
    } finally {
      setIsLoading(false);
    }
  };

  const extractUserIdFromToken = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.user_id;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  return (
    <div className="signup-root font-display dark">
      <div
        className="background-image-layer"
        data-alt="A blurred background image of a doctor using a tablet, conveying healthcare and technology."
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDBsl5xKFUwyPrzFdU4NVm8dRNWS03SX5Grib5E2uh6fywyhhPB6pZepud0U9EeYRkCiU15Z1kopdk14Ju2tv1dNFiTl4rGHhEmlI5VE6nk3A6sdtAQ_1cMrkyqcdf4NfkWlS5tUtvD8_K_DlUTxk6UUBY6xhKpHM17z_hlwp4y9-tpRBePXJ3XNIpPCu5z6b7yvpNUMi-sw8ZxqeyvFdWWjBATzolqDH7ngUxB4f3V-zv07xOnwS3-UsqHSeDMOdQ8z8nyjPvl26s")',
        }}
      ></div>

      <div className="background-overlay"></div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p className="loading-text">Creating your account...</p>
          </div>
        </div>
      )}

      <div className="signup-container">
        <div className="signup-card">
          <div className="card-header">
            {/* Profile Image Upload at Top */}
            <div className="profile-upload-section">
              <div className="profile-image-container" onClick={handleImageClick}>
                {profilePreview ? (
                  <img
                    src={profilePreview}
                    alt="Profile preview"
                    className="profile-image-preview"
                  />
                ) : (
                  <div className="profile-image-placeholder">
                    <span className="material-symbols-outlined">add_a_photo</span>
                  </div>
                )}
                <div className="profile-image-overlay">
                  <span className="material-symbols-outlined">photo_camera</span>
                </div>
              </div>
              <input
                id="profile-image-input"
                type="file"
                name="profile_image"
                accept="image/*"
                onChange={handleInputChange}
                required
                disabled={isLoading}
                style={{ display: "none" }}
              />
              <p className="profile-upload-text">Click to upload profile photo</p>
            </div>

            <div className="icon-container">
              <svg
                className="icon-primary"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15v-4H8l4-5v4h3l-4 5z"></path>
              </svg>
            </div>
            <h1 className="header-title">Create Your Account</h1>
            <p className="header-subtitle">
              Join us to manage your health with modern AI
            </p>
          </div>

          <form className="signup-form" onSubmit={handleSubmit}>
            <label className="form-label">
              <p className="label-text">Username</p>
              <input
                className="form-input"
                placeholder="Enter your username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </label>

            <label className="form-label">
              <p className="label-text">Email Address</p>
              <input
                className="form-input"
                placeholder="Enter your email address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </label>

            <div className="form-row">
              <label className="form-label flex-1">
                <p className="label-text">Phone Number</p>
                <div className="phone-input-wrapper">
                  <span className="phone-prefix"></span>
                  <input
                    className="form-input phone-input"
                    placeholder="+265"
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                </div>
              </label>

              <label className="form-label age-label">
                <p className="label-text">Age</p>
                <input
                  className="form-input"
                  placeholder="e.g. 34"
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
              </label>
            </div>

            <label className="form-label">
              <p className="label-text">Location</p>
              <input
                className="form-input"
                placeholder="Enter your current location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
            </label>

            <div className="gender-section">
              <p className="label-text">Gender</p>
              <div className="gender-options">
                <label className="gender-option">
                  <input
                    className="gender-radio"
                    name="gender"
                    type="radio"
                    value="male"
                    checked={formData.gender === "male"}
                    onChange={handleInputChange}
                    required
                    disabled={isLoading}
                  />
                  <span className="gender-label">Male</span>
                </label>
                <label className="gender-option">
                  <input
                    className="gender-radio"
                    name="gender"
                    type="radio"
                    value="female"
                    checked={formData.gender === "female"}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <span className="gender-label">Female</span>
                </label>
                <label className="gender-option">
                  <input
                    className="gender-radio"
                    name="gender"
                    type="radio"
                    value="other"
                    checked={formData.gender === "other"}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                  <span className="gender-label">Other</span>
                </label>
              </div>
            </div>

            <label className="form-label">
              <p className="label-text">Password</p>
              <div className="password-wrapper">
                <input
                  className="form-input password-input"
                  placeholder="Enter your password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  disabled={isLoading}
                />
                <button
                  className="password-toggle-button"
                  type="button"
                  onClick={togglePasswordVisibility}
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
              <p className="password-hint">
                Must be at least 8 characters long.
              </p>
            </label>

            <div className="terms-section">
              <input
                className="terms-checkbox"
                id="terms-checkbox"
                name="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                required
                disabled={isLoading}
              />
              <label className="terms-label" htmlFor="terms-checkbox">
                I agree to the{" "}
                <a className="terms-link" href="#">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a className="terms-link" href="#">
                  Privacy Policy
                </a>
                .
              </label>
            </div>

            {message.text && (
              <div
                className={`message-box ${
                  message.type === "error" ? "error-message" : "success-message"
                }`}
              >
                {message.text}
              </div>
            )}

            <button
              className={`signup-button ${
                !formData.agreeToTerms || isLoading
                  ? "signup-button-disabled"
                  : ""
              }`}
              type="submit"
              disabled={!formData.agreeToTerms || isLoading}
            >
              {isLoading ? (
                <div className="button-loading">
                  <div className="button-spinner"></div>
                  <span>Processing...</span>
                </div>
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <p className="login-link-text">
            Already have an account?{" "}
            <button className="login-link" onClick={handleLoginRedirect}>
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Signup;