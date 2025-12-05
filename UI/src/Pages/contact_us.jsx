import React from "react";
import "./styles/contact.css";

function Team() {
  // Dictionary of team members
  const teamMembers = [
    {
      id: 1,
      name: "Frank ",
      role: "Lead AI Developer & Webmaster",
      icon: "psychology",
      description:
        "Specializes in healthcare AI and machine learning algorithms and web management.",
    },
    {
      id: 2,
      name: "Amani",
      role: "Project Manager",
      icon: "code",
      description: "Insured every aspect of project delivery",
    },
    {
      id: 3,
      name: "Queen",
      role: "Data Analyst & Researcher",
      icon: "data_usage",
      description: "Data collection and analysis for healthcare insights",
    },
    {
      id: 4,
      name: "ishimwe",
      role: "Medical Data Analyst",
      icon: "medical_information",
      description: "Health consultant specializing in medical data",
    },
    {
      id: 6,
      name: "Dalphine",
      role: "Web Designer",
      icon: "design_services",
      description:
        "Designs user-friendly and visually appealing healthcare interfaces",
    },
    {
      id: 7,
      name: "Grace",
      role: "Application Tester",
      icon: "done",
      description:
        "Focused on testing and bringing out every detail to ensure quality",
    },
    {
      id: 8,
      name: "Cedrick",
      role: "Operations Manager",
      icon: "group",
      description: "Manages day-to-day operations and ensures smooth workflow",
    },
    {
      id: 9,
      name: "Groria M.",
      role: "Prompt Engineer",
      icon: "terminal",
      description: "Design...........",
    },
  ];

  return (
    <div className="team-root font-display dark">

         

      
      <div
        className="background-image-layer"
        data-alt="A softly blurred background image of a doctor using a tablet, representing modern healthcare in Africa."
        style={{
          backgroundImage:
            'url("https://lh3.googleusercontent.com/aida-public/AB6AXuDBsl5xKFUwyPrzFdU4NVm8dRNWS03SX5Grib5E2uh6fywyhhPB6pZepud0U9EeYRkCiU15Z1kopdk14Ju2tv1dNFiTl4rGHhEmlI5VE6nk3A6sdtAQ_1cMrkyqcdf4NfkWlS5tUtvD8_K_DlUTxk6UUBY6xhKpHM17z_hlwp4y9-tpRBePXJ3XNIpPCu5z6b7yvpNUMi-sw8ZxqeyvFdWWjBATzolqDH7ngUxB4f3V-zv07xOnwS3-UsqHSeDMOdQ8z8nyjPvl26s")',
        }}
      ></div>

      <div className="dark-overlay-layer"></div>

      <div className="team-container">
        <div className="team-content">
          <div className="team-header">
            <h1 className="team-title">Our Team</h1>
            <p className="team-subtitle">
              Meet the talented individuals behind MoyoAI who are passionate
              about revolutionizing healthcare through technology and
              innovation.
            </p>
          </div>

          {/* Team Grid */}
          <div className="team-grid">
            {teamMembers.map((member) => (
              <div key={member.id} className="team-card">
                <div className="card-icon">
                  <span className="material-symbols-outlined">
                    {member.icon}
                  </span>
                </div>
                <div className="card-content">
                  <h3 className="member-name">{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                  <p className="member-description">{member.description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Action */}
          <div className="team-cta">
            <h2 className="cta-title">Join Our Mission</h2>
            <p className="cta-subtitle">
              We're always looking for passionate individuals to join us in
              transforming healthcare across Africa.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Team;
