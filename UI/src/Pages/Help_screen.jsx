import React from "react";
import Sidebar from "../components/menu";
import "./styles/help.css";

function Help() {
  const features = [
    {
      icon: "💬",
      title: "AI Health Assistant",
      description: "Get instant responses to your health questions and symptom concerns from our AI assistant.",
      usage: "Type your symptoms or health questions in the chat to get educated guidance."
    },
    {
      icon: "📅",
      title: "Medication Scheduler",
      description: "Set up personalized medication reminders and track your treatment schedule.",
      usage: "Create schedules with specific times for each day and get reminder notifications."
    },
    {
      icon: "🏥",
      title: "Healthcare Facility Finder",
      description: "Locate nearby hospitals, clinics, and healthcare centers on an interactive map.",
      usage: "Use the map to find medical facilities near your current location with contact information."
    },
    {
      icon: "📋",
      title: "Health Profile",
      description: "Maintain your personal health information and medical history securely.",
      usage: "Keep your profile updated with essential health information for better care."
    },
    {
      icon: "📁",
      title: "Document Upload",
      description: "Upload medical reports and documents for the AI to analyze and reference.",
      usage: "Attach PDF or text files containing your medical reports when chatting with the AI."
    },
    {
      icon: "🔔",
      title: "Smart Reminders",
      description: "Receive timely notifications for medication schedules and health check-ups.",
      usage: "Set reminders and get alerts when it's time to take your medication or schedule appointments."
    }
  ];

  const gettingStartedSteps = [
    {
      step: 1,
      title: "Complete Your Profile",
      description: "Fill in your health information, allergies, and medical history for personalized assistance."
    },
    {
      step: 2,
      title: "Set Up Medication Schedules",
      description: "Create reminders for your regular medications with specific times for each day."
    },
    {
      step: 3,
      title: "Chat with AI Assistant",
      description: "Ask health-related questions, describe symptoms, or upload medical reports for analysis."
    },
    {
      step: 4,
      title: "Use the Healthcare Map",
      description: "Find nearby medical facilities and get directions when you need in-person care."
    },
    {
      step: 5,
      title: "Manage Your Health Data",
      description: "Regularly update your profile and review your medication schedules."
    }
  ];

  const tips = [
    "Be specific when describing symptoms to the AI assistant for more accurate guidance",
    "Set medication reminders with buffer time to ensure you never miss a dose",
    "Upload medical reports in PDF format for the AI to provide better insights",
    "Use the map feature to save favorite healthcare facilities for quick access",
    "Keep your profile updated with current medications and health conditions",
    "Set recurring schedules for regular medications to maintain consistency"
  ];

  return (
    <div className="help-root font-display dark">
      {/* Background Layers */}
      <div
        className="background-image-layer"
        style={{
          backgroundImage: 'url("https://lh3.googleusercontent.com/aida-public/AB6AXuAovHvPqau8CimngJH5F2Vs6tgVDFseLijm00uL0AJgEw1lKnuUrC9oY20EcsWgcL-ijBOBsG7o49JO-964fGBn4cp_R2FZGOVZylEdb8WakK1NpPSX8ghuhyozjzOZQv19sgH0EXsWRDrTtERG2fQbdYstbBxueIYs4CJvslTbY903lQpoLShLP4SREPoaF3ZSg5IyJ285pBjKVtlRVmC75fRT3wf2WA6r8-78fFEVuWbLGvBsJI0M1HMm-Pzd-Z6mxkK60U6NHxo")'
        }}
      ></div>
      <div className="background-overlay"></div>

      <div className="help-container">
        <Sidebar />
        
        <main className="main-content">
          <div className="content-wrapper">
            {/* Header Section */}
            <div className="help-header">
              <div className="header-content">
                <h1 className="help-title">Help & Guidance</h1>
                <p className="help-subtitle">
                  Learn how to make the most of MoyoAI for your healthcare needs
                </p>
              </div>
              <div className="header-icon">💡</div>
            </div>

            {/* Core Purpose Section */}
            <div className="purpose-section">
              <div className="section-header">
                <h2>Our Mission</h2>
                <div className="accent-line"></div>
              </div>
              <div className="purpose-card">
                <div className="purpose-content">
                  <h3>Empowering Your Health Journey</h3>
                  <p>
                    MoyoAI is designed to be your personal health companion, providing 
                    intelligent assistance for medication management, symptom understanding, 
                    and healthcare navigation. We bridge the gap between medical knowledge 
                    and everyday health decisions.
                  </p>
                  <div className="purpose-features">
                    <div className="feature-tag">🤖 AI-Powered Guidance</div>
                    <div className="feature-tag">💊 Medication Management</div>
                    <div className="feature-tag">🏥 Facility Locator</div>
                    <div className="feature-tag">🔔 Smart Reminders</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Features Section */}
            <div className="features-section">
              <div className="section-header">
                <h2>Key Features</h2>
                <div className="accent-line"></div>
              </div>
              <div className="features-grid">
                {features.map((feature, index) => (
                  <div key={index} className="feature-card">
                    <div className="feature-icon">{feature.icon}</div>
                    <h3 className="feature-title">{feature.title}</h3>
                    <p className="feature-description">{feature.description}</p>
                    <div className="usage-tip">
                      <span className="tip-label">How to use:</span>
                      <span className="tip-text">{feature.usage}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Getting Started Section */}
            <div className="getting-started-section">
              <div className="section-header">
                <h2>Getting Started</h2>
                <div className="accent-line"></div>
              </div>
              <div className="steps-container">
                {gettingStartedSteps.map((step, index) => (
                  <div key={index} className="step-card">
                    <div className="step-number">{step.step}</div>
                    <div className="step-content">
                      <h3 className="step-title">{step.title}</h3>
                      <p className="step-description">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips & Best Practices */}
            <div className="tips-section">
              <div className="section-header">
                <h2>Tips for Best Results</h2>
                <div className="accent-line"></div>
              </div>
              <div className="tips-grid">
                {tips.map((tip, index) => (
                  <div key={index} className="tip-card">
                    <span className="tip-bullet">💡</span>
                    <span className="tip-text">{tip}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Important Notes */}
            <div className="notes-section">
              <div className="notes-card">
                <div className="notes-header">
                  <span className="notes-icon">⚠️</span>
                  <h3>Important Information</h3>
                </div>
                <div className="notes-content">
                  <p>
                    <strong>MoyoAI is a health assistant, not a replacement for professional medical care.</strong> 
                    Always consult healthcare professionals for diagnoses and treatment decisions. 
                    Use this app as a supportive tool for medication management and health information.
                  </p>
                  <div className="emergency-notice">
                    <span className="emergency-icon">🚨</span>
                    <span className="emergency-text">
                      For medical emergencies, contact your local emergency services immediately.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Support Contact */}
            <div className="support-section">
              <div className="support-card">
                <h3>Need More Help?</h3>
                <p>Our support team is here to assist you with any questions or issues.</p>
                <div className="support-actions">
                  <button className="support-btn primary">
                    <span className="material-symbols-outlined">mail</span>
                    Contact Support
                  </button>
                  <button className="support-btn secondary">
                    <span className="material-symbols-outlined">group</span>
                    Meet the Team
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default Help;