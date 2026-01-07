import React from "react";
import { 
  FaMapMarkerAlt, 
  FaSearch, 
  FaFilter, 
  FaAmbulance, 
  FaDirections, 
  FaComments, 
  FaStethoscope,
  FaHospital,
  FaUserMd,
  FaQuestionCircle
} from "react-icons/fa";
import { GiHospitalCross } from "react-icons/gi";
import "./styles/help.css";
import Sidebar from "../components/menu";

const Help = () => {
  const features = [
    {
      icon: <FaMapMarkerAlt />,
      title: "Find Healthcare Facilities",
      description: "Use the interactive map to locate hospitals, clinics, and healthcare centers near you. Click on any marker to see details.",
      steps: [
        "Allow location access when prompted",
        "Zoom in/out to explore different areas",
        "Click on hospital markers for information"
      ]
    },
    {
      icon: <FaSearch />,
      title: "Search & Filter",
      description: "Quickly find specific facilities using search and filter options.",
      steps: [
        "Type in the search bar for names or addresses",
        "Use filters to show specific hospital types",
        "Adjust distance slider for nearby facilities"
      ]
    },
    {
      icon: <FaDirections />,
      title: "Get Directions",
      description: "Get turn-by-turn directions from your location to any healthcare facility.",
      steps: [
        "Click on a hospital marker",
        "Select 'Get Directions' in the popup",
        "Follow the route in Google Maps"
      ]
    },
    {
      icon: <FaAmbulance />,
      title: "Emergency Services",
      description: "Identify facilities with 24/7 emergency services for urgent care needs.",
      steps: [
        "Look for red emergency markers",
        "Check for '24/7 Emergency Services' badge",
        "Call the provided emergency numbers"
      ]
    },
    {
      icon: <FaComments />,
      title: "AI Health Assistant",
      description: "Chat with HealthCareAI for medical guidance and symptom analysis.",
      steps: [
        "Navigate to the chat section",
        "Describe your symptoms or questions",
        "Get AI-powered medical guidance"
      ]
    },
    {
      icon: <FaFilter />,
      title: "Advanced Filtering",
      description: "Narrow down results by hospital type, services, and distance.",
      steps: [
        "Click the filter button",
        "Select hospital types (public/private)",
        "Set maximum distance from your location"
      ]
    }
  ];

  const quickTips = [
    "Save your frequently visited hospitals for quick access",
    "Enable notifications for health alerts and updates",
    "Use satellite view for better geographical context",
    "Bookmark important hospital contact numbers",
    "Check operating hours before visiting",
    "Share location with family during emergencies"
  ];

  return (
    <div className="help-page">
      <div className="help-container">
         <Sidebar/>
        
        <main className="help-main-content">
          {/* Header Section */}
          <div className="help-header-section">
            <div className="help-title-wrapper">
              <FaQuestionCircle className="help-title-icon" />
              <div>
                <h1 className="help-title">How to Use HealthCareAI</h1>
                <p className="help-subtitle">
                  Your guide to navigating Africa's premier healthcare assistance platform
                </p>
              </div>
            </div>
            
            <div className="ai-badge">
              <FaStethoscope />
              <div>
                <span className="ai-name">HealthCareAI</span>
                <span className="ai-tag">Powered by AI</span>
              </div>
            </div>
          </div>

          {/* Introduction */}
          <div className="intro-section">
            <div className="intro-card">
              <h2>Welcome to HealthCareAI</h2>
              <p>
                HealthCareAI combines advanced artificial intelligence with comprehensive 
                healthcare mapping to provide you with intelligent medical assistance and 
                facility navigation across Africa.
              </p>
              <div className="intro-stats">
                <div className="stat">
                  <GiHospitalCross />
                  <div>
                    <span className="stat-number">500+</span>
                    <span className="stat-label">Healthcare Facilities</span>
                  </div>
                </div>
                <div className="stat">
                  <FaUserMd />
                  <div>
                    <span className="stat-number">24/7</span>
                    <span className="stat-label">AI Assistance</span>
                  </div>
                </div>
                <div className="stat">
                  <FaHospital />
                  <div>
                    <span className="stat-number">15+</span>
                    <span className="stat-label">African Countries</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Features Grid */}
          <div className="features-grid">
            <h2 className="section-title">Key Features Guide</h2>
            <p className="section-subtitle">Learn how to make the most of HealthCareAI's powerful tools</p>
            
            <div className="features-container">
              {features.map((feature, index) => (
                <div key={index} className="feature-card">
                  <div className="feature-icon">{feature.icon}</div>
                  <h3 className="feature-title">{feature.title}</h3>
                  <p className="feature-description">{feature.description}</p>
                  
                  <div className="steps-container">
                    <h4>How to use:</h4>
                    <ol className="steps-list">
                      {feature.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="step-item">{step}</li>
                      ))}
                    </ol>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Tips */}
          <div className="tips-section">
            <div className="tips-card">
              <h2 className="section-title">Pro Tips & Best Practices</h2>
              <p className="section-subtitle">Enhance your HealthCareAI experience with these suggestions</p>
              
              <div className="tips-grid">
                {quickTips.map((tip, index) => (
                  <div key={index} className="tip-item">
                    <div className="tip-number">{index + 1}</div>
                    <p className="tip-text">{tip}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Guide */}
          <div className="emergency-section">
            <div className="emergency-card">
              <div className="emergency-header">
                <FaAmbulance className="emergency-icon" />
                <div>
                  <h2>Emergency Protocol</h2>
                  <p>What to do in medical emergencies</p>
                </div>
              </div>
              
              <div className="emergency-steps">
                <div className="emergency-step">
                  <span className="step-number">1</span>
                  <div>
                    <h3>Locate Nearest Facility</h3>
                    <p>Use the map to find the closest hospital with emergency services</p>
                  </div>
                </div>
                <div className="emergency-step">
                  <span className="step-number">2</span>
                  <div>
                    <h3>Call Emergency Services</h3>
                    <p>Dial the emergency number provided in the hospital details</p>
                  </div>
                </div>
                <div className="emergency-step">
                  <span className="step-number">3</span>
                  <div>
                    <h3>Use HealthCareAI Chat</h3>
                    <p>Get immediate first-aid guidance from our AI assistant</p>
                  </div>
                </div>
                <div className="emergency-step">
                  <span className="step-number">4</span>
                  <div>
                    <h3>Share Your Location</h3>
                    <p>Use the share feature to send your location to emergency contacts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="faq-section">
            <h2 className="section-title">Frequently Asked Questions</h2>
            
            <div className="faq-list">
              <div className="faq-item">
                <h3>Is HealthCareAI a replacement for doctors?</h3>
                <p>
                  No, HealthCareAI is designed to assist and provide guidance, not replace 
                  professional medical care. Always consult healthcare professionals for diagnosis and treatment.
                </p>
              </div>
              
              <div className="faq-item">
                <h3>How accurate is the hospital information?</h3>
                <p>
                  We regularly update our database with verified information from healthcare 
                  authorities. However, always confirm details by contacting facilities directly.
                </p>
              </div>
              
 
              
              <div className="faq-item">
                <h3>Is my health data secure?</h3>
                <p>
                  Yes, we use end-to-end encryption and never share your personal health 
                  information with third parties without consent.
                </p>
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="support-section">
            <div className="support-card">
              <h2>Need More Help?</h2>
              <p>Our support team is here to assist you with any questions or issues.</p>
              
              <div className="support-options">
                <button className="support-option">
                  <FaComments />
                  <span>Chat with Support</span>
                </button>
                <button className="support-option">
                  <FaQuestionCircle />
                  <span>View Documentation</span>
                </button>
              </div>
              
              <p className="support-note">
                For medical emergencies, please contact emergency services directly.
              </p>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Help;