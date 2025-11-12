// src/pages/AboutUs.js
import React from 'react';
import '../styles/Aboutus.css';

const AboutUs = () => {
  const teamMembers = [
    {
      name: "Abhinov Singh",
      role: "Project Lead & Full-Stack Developer",
      description: "Leading the project development with expertise in React, Node.js, and system architecture. Responsible for overall project coordination and technical decisions.",
      skills: ["React", "Node.js", "System Architecture", "Project Management"],
      github: "Abhinov21"
    },
    {
      name: "Prudhvi Raj ",
      role: "Backend Developer & AI Specialist",
      description: "Specializes in Flask backend development, Google Earth Engine integration, and AI-powered crop recommendation systems using machine learning.",
      skills: ["Python", "Flask", "Google Earth Engine", "Machine Learning"],
      github: "#"
    },
    {
      name: "Saiteja Reddy Namala",
      role: "Frontend Developer & UI/UX Designer",
      description: "Creates intuitive user interfaces and ensures excellent user experience. Expert in React components, responsive design, and modern web technologies.",
      skills: ["React", "CSS", "UI/UX Design", "Responsive Design"],
      github: "#"
    },
    {
      name: "Sohel",
      role: "Data Engineer & Satellite Analytics",
      description: "Handles satellite data processing, NDVI calculations, and geospatial analysis. Ensures accurate and timely processing of agricultural data.",
      skills: ["Python", "Satellite Data", "GIS", "Data Processing"],
      github: "#"
    },
    {
      name: "Tauseef Khan Pathan",
      role: "DevOps Engineer & Quality Assurance",
      description: "Manages deployment pipelines, ensures system reliability, and maintains high code quality through comprehensive testing strategies.",
      skills: ["DevOps", "CI/CD", "Testing", "Cloud Deployment"],
      github: "#"
    }
  ];

  return (
    <div className="about-page">
      {/* Hero Section */}
      <div className="about-hero">
        <h1>About AgriScope Team</h1>
        <p>Revolutionizing agriculture through satellite data processing and precision farming solutions</p>
      </div>

      {/* Project Description */}
      <div className="project-description">
        <div className="description-content">
          <h2>Our Mission</h2>
          <p>
            Our project, <span className="highlight">AgriScope</span>, is designed to revolutionize how farmers and agricultural experts make decisions by integrating real-time geospatial data with smart analytics. We empower users with tools to optimize productivity in a sustainable way.
          </p>
          <div className="features-grid">
            <div className="feature">
              <h3>🛰️ Satellite Integration</h3>
              <p>Real-time data from Sentinel-2 and MODIS satellites</p>
            </div>
            <div className="feature">
              <h3>🗺️ Interactive Mapping</h3>
              <p>Custom polygon drawing for precise field analysis</p>
            </div>
            <div className="feature">
              <h3>🤖 AI-Powered Insights</h3>
              <p>Smart crop recommendations based on data analysis</p>
            </div>
            <div className="feature">
              <h3>📊 Advanced Analytics</h3>
              <p>NDVI, soil moisture, and environmental monitoring</p>
            </div>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="team-section">
        <h2>Meet Our Team</h2>
        <p className="team-intro">
          We are a passionate team of five developers dedicated to bringing cutting-edge technology to agriculture.
        </p>
        
        <div className="team-grid">
          {teamMembers.map((member, index) => (
            <div key={index} className="team-card">
              <div className="team-card-header">
                <div className="member-avatar">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="member-info">
                  <h3>{member.name}</h3>
                  <p className="member-role">{member.role}</p>
                </div>
              </div>
              <div className="member-description">
                <p>{member.description}</p>
              </div>
              <div className="member-skills">
                {member.skills.map((skill, skillIndex) => (
                  <span key={skillIndex} className="skill-tag">{skill}</span>
                ))}
              </div>
              {member.github !== "#" && (
                <div className="member-links">
                  <a href={`https://github.com/${member.github}`} target="_blank" rel="noopener noreferrer">
                    GitHub Profile
                  </a>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Mentor Appreciation */}
      <div className="mentor-section">
        <div className="mentor-content">
          <h2>Special Thanks</h2>
          <div className="mentor-card">
            <div className="mentor-info">
              <h3>🎓 Prof. Akshay Pandey Sir</h3>
              <p>
                We extend our heartfelt gratitude to our mentor for providing invaluable guidance, technical expertise, 
                and unwavering support throughout this project. Their mentorship has been instrumental in shaping 
                AgriScope into a comprehensive agricultural technology solution.
              </p>
              <p className="mentor-quote">
                "Innovation in agriculture requires not just technology, but the vision to apply it meaningfully."
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tech Stack */}
      <div className="tech-section">
        <h2>Technologies We Use</h2>
        <div className="tech-grid">
          <div className="tech-category">
            <h4>Frontend</h4>
            <div className="tech-tags">
              <span>React</span>
              <span>JavaScript</span>
              <span>CSS3</span>
              <span>Leaflet</span>
            </div>
          </div>
          <div className="tech-category">
            <h4>Backend</h4>
            <div className="tech-tags">
              <span>Python</span>
              <span>Flask</span>
              <span>Node.js</span>
              <span>Express</span>
            </div>
          </div>
          <div className="tech-category">
            <h4>Data & Analytics</h4>
            <div className="tech-tags">
              <span>Google Earth Engine</span>
              <span>Satellite Data</span>
              <span>Machine Learning</span>
              <span>GIS</span>
            </div>
          </div>
          <div className="tech-category">
            <h4>Deployment</h4>
            <div className="tech-tags">
              <span>Vercel</span>
              <span>Render</span>
              <span>CI/CD</span>
              <span>Docker</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
