import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./styles/login.css";

const API_BASE_URL = "http://127.0.0.1:8001/auth/v1/login";

function Login() {
  const [showPassword, setShowPassword] = React.useState(false);
  const [formData, setFormData] = React.useState({
    email: "",
    password: "",
  });
  const [isLoading, setIsLoading] = React.useState(false);
  const [message, setMessage] = React.useState({ type: "", text: "" });

  const { login, logout } = useAuth();
  const navigate = useNavigate();

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));

    if (message.text) {
      setMessage({ type: "", text: "" });
    }
  };

  const clearOldAuthData = () => {
   
    localStorage.removeItem("authToken");
    localStorage.removeItem("userData");
    localStorage.removeItem("user_id");
    sessionStorage.removeItem("authToken");
    sessionStorage.removeItem("userData");
  };

  
  const decodeJWT = (token) => {
    if (!token) return null;
    
    try {
      const payload = token.split('.')[1];
      const decodedPayload = atob(payload);
      return JSON.parse(decodedPayload);
    } catch (error) {
      console.error("Error decoding JWT token:", error);
      return null;
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: "", text: "" });

    try {
       
      clearOldAuthData();
      
      
      if (logout) {
        logout();
      }

      const response = await axios.post(
        API_BASE_URL,
        {
          email: formData.email,
          password: formData.password,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 30000,
        }
      );

     
      setMessage({ type: "success", text: response.data.message });

      
      const token = response.data.token;
      
      // Decode JWT token to get user data
      const decodedToken = decodeJWT(token);
      
      if (!decodedToken) {
        throw new Error("Failed to decode authentication token");
      }

 
      const userData = {
        user_id: decodedToken.user_id,  
        email: formData.email,
  
      };
      console.log(userData);
      console.log("Login successful - User data from JWT:", userData);
      console.log("Token received:", token);

    
      await login(token, userData);

      
      setTimeout(() => {
        navigate("/home", { replace: true });
      }, 1000);

    } catch (error) {
      console.error("Login failed:", error);

      // Clear any partial data that might have been stored
      clearOldAuthData();

      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "An unexpected error occurred during login";

      setMessage({ type: "error", text: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpRedirect = () => {
    navigate("/signup");
  };

  // Add body overflow hidden effect
  React.useEffect(() => {
    document.body.style.overflow = "hidden";
    
    // Optional: Clear old auth data when component mounts
    clearOldAuthData();
    
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  return (
    <div className="login-root font-display dark">
      {/* Background Image Layer */}
      <div
        className="background-image-layer"
        data-alt="A softly blurred background image of a doctor using a tablet, representing modern healthcare in Africa."
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDBsl5xKFUwyPrzFdU4NVm8dRNWS03SX5Grib5E2uh6fywyhhPB6pZepud0U9EeYRkCiU15Z1kopdk14Ju2tv1dNFiTl4rGHhEmlI5VE6nk3A6sdtAQ_1cMrkyqcdf4NfkWlS5tUtvD8_K_DlUTxk6UUBY6xhKpHM17z_hlwp4y9-tpRBePXJ3XNIpPCu5z6b7yvpNUMi-sw8ZxqeyvFdWWjBATzolqDH7ngUxB4f3V-zv07xOnwS3-UsqHSeDMOdQ8z8nyjPvl26s")',
        }}
      ></div>

      <div className="dark-overlay-layer"></div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p className="loading-text">Signing you in...</p>
          </div>
        </div>
      )}

      <div className="login-card">
        <div className="card-header">
          <div className="icon-container">
            <span className="material-symbols-outlined icon-primary">
              health_and_safety
            </span>
          </div>
          <h1 className="header-title">Welcome Back</h1>
          <p className="header-subtitle">Sign in to your account to continue</p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div
            className={`message-box ${
              message.type === "error" ? "error-message" : "success-message"
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={handleLoginSubmit}>
          {/* Email Input */}
          <div className="form-group">
            <label className="input-label">
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
          </div>

          {/* Password Input */}
          <div className="form-group">
            <label className="input-label">
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
            </label>
          </div>

          {/* Sign In Button */}
          <button
            className={`sign-in-button ${
              isLoading ? "sign-in-button-disabled" : ""
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="button-loading">
                <div className="button-spinner"></div>
                <span>Signing In...</span>
              </div>
            ) : (
              "Sign In"
            )}
          </button>

          {/* Sign Up Link */}
          <p
            className="signup-link-text"
            style={{
              textAlign: "center",
              color: "#92c9a9",
              fontSize: "0.95rem",
              margin: "1.5rem 0 0 0",
            }}
          >
            Don't have an account?{" "}
            <button
              className="signup-link"
              onClick={handleSignUpRedirect}
              disabled={isLoading}
              style={{
                background: "none",
                border: "none",
                color: "#13ec6d",
                cursor: isLoading ? "not-allowed" : "pointer",
                fontSize: "0.95rem",
                fontWeight: "600",
                textDecoration: "underline",
                padding: "0",
                opacity: isLoading ? 0.6 : 1,
              }}
            >
              Sign Up
            </button>
          </p>

      
          <p className="support-text">
            Need help?{" "}
            <a className="support-link" href="#">
              Contact Support
            </a>
          </p>
        </form>
      </div>

     
      <footer className="login-footer">
        <p className="footer-text">
          © 2025 TakenoLab AI Team. All rights reserved. |{" "}
        </p>
      </footer>
    </div>
  );
}

export default Login;