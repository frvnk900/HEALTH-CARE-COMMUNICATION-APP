import React from "react";
import "./styles/getstarted.css";

function GetStarted() {
  const handleGetStarted = () => {
    window.location.href = "/login";
  };

  const handleLearnMore = () => {
    window.location.href = "/about";
  };

  return (
    <div className="getstarted-root">
      {/* Background Image Layer */}
      <div
        className="background-image-layer"
        data-alt="A softly blurred background image of a doctor using a tablet, representing modern healthcare in Africa."
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDBsl5xKFUwyPrzFdU4NVm8dRNWS03SX5Grib5E2uh6fywyhhPB6pZepud0U9EeYRkCiU15Z1kopdk14Ju2tv1dNFiTl4rGHhEmlI5VE6nk3A6sdtAQ_1cMrkyqcdf4NfkWlS5tUtvD8_K_DlUTxk6UUBY6xhKpHM17z_hlwp4y9-tpRBePXJ3XNIpPCu5z6b7yvpNUMi-sw8ZxqeyvFdWWjBATzolqDH7ngUxB4f3V-zv07xOnwS3-UsqHSeDMOdQ8z8nyjPvl26s")',
        }}
      ></div>

      {/* Content Container */}
      <div className="content-container">
        {/* Logo */}
        <div className="logo-container">
          <div className="logo-icon">
            <span className="material-symbols-outlined">medical_services</span>
          </div>
          <div className="logo-text">
            <span className="highlight">Moyo</span>Ai
          </div>
        </div>

        <h1 className="main-heading">
          Transforming Healthcare
          <span className="heading-gradient"> Across Africa</span>
        </h1>
        <p className="subheading">
          Connecting patients, doctors, and clinics with secure, accessible, and
          innovative digital health solutions.
        </p>

        <div className="cta-section">
          <button className="btn-primary" onClick={handleGetStarted}>
            Get Started Free
            <span className="material-symbols-outlined btn-icon">
              arrow_forward
            </span>
          </button>
          <button className="btn-secondary" onClick={handleLearnMore}>
            Learn More
          </button>
        </div>
      </div>
    </div>
  );
}

export default GetStarted;
