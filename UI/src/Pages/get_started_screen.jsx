import React from "react";
import "./styles/getstarted.css";

function GetStarted() {
  const handleGetStarted = () => {
    window.location.href = "/login";
  };

  return (
    <div className="getstarted-root font-display dark">
      <div
        className="background-image-layer"
        data-alt="A softly blurred background image of a doctor using a tablet, representing modern healthcare in Africa."
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDBsl5xKFUwyPrzFdU4NVm8dRNWS03SX5Grib5E2uh6fywyhhPB6pZepud0U9EeYRkCiU15Z1kopdk14Ju2tv1dNFiTl4rGHhEmlI5VE6nk3A6sdtAQ_1cMrkyqcdf4NfkWlS5tUtvD8_K_DlUTxk6UUBY6xhKpHM17z_hlwp4y9-tpRBePXJ3XNIpPCu5z6b7yvpNUMi-sw8ZxqeyvFdWWjBATzolqDH7ngUxB4f3V-zv07xOnwS3-UsqHSeDMOdQ8z8nyjPvl26s")',
        }}
      ></div>

      <div className="dark-overlay-layer"></div>

      <div className="getstarted-container">
        <div className="getstarted-card">
          <div className="header-section">
            <div className="logo-container">
              <h1 className="logo-text">HealthCareAI</h1>
            </div>
            <h2 className="main-title">Revolutionizing Healthcare in Africa</h2>
            <p className="main-subtitle">
              AI-powered medical assistance designed for African healthcare
              needs. Get instant symptom analysis, treatment guidance, and
              connect with healthcare professionals.
            </p>
          </div>

          <div className="cta-section">
            <h3 className="cta-title">
              Ready to Transform Your Healthcare Experience?
            </h3>
            <p className="cta-subtitle">
              Join thousands of users who trust MoyoAI for their healthcare needs
            </p>
            
            <div className="actions-buttons">
              <div className="ac-btn">
                <button className="get-started-btn" onClick={handleGetStarted}>
                  <span className="button-text">Get Started Now</span>
                </button>
              </div>
            </div>

            <div className="benefits-list">
              <div className="benefit-item">
                <span className="material-symbols-outlined benefit-icon">
                  check_circle
                </span>
                <span>No credit card required</span>
              </div>
              <div className="benefit-item">
                <span className="material-symbols-outlined benefit-icon">
                  check_circle
                </span>
                <span>Free forever for basic features</span>
              </div>
              <div className="benefit-item">
                <span className="material-symbols-outlined benefit-icon">
                  check_circle
                </span>
                <span>Setup in under 2 minutes</span>
              </div>
            </div>
          </div>

          <footer className="getstarted-footer">
            <p className="footer-text">
              © 2025 HealthCareAI. All rights reserved. |
              <a className="footer-link" href="#">
                {" "}
                Privacy Policy
              </a>{" "}
              |
              <a className="footer-link" href="#">
                {" "}
                Terms of Service
              </a>
            </p>
          </footer>
        </div>
      </div>
    </div>
  );
}

export default GetStarted;