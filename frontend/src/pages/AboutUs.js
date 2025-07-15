// src/components/AboutUs.js
import React from 'react';
import '../styles/Aboutus.css';

const AboutUs = () => {
  return (
    <div className="about-section">
      <h1>About Us</h1>
      <p>
        Our project, <span className="highlight">Satellite Data Processing for Precision Agriculture</span>, is designed to revolutionize how farmers and agricultural experts make decisions by integrating real-time geospatial data with smart analytics. As agriculture faces growing challenges due to climate change, soil degradation, and resource constraints, our system empowers users with tools to optimize productivity in a sustainable way.
      </p>

      <p>
        The platform enables users to <span className="highlight">draw custom polygons on a map</span> representing specific agricultural plots. Once a region is selected, the system fetches and analyzes satellite-derived data such as <span className="highlight">NDVI (Normalized Difference Vegetation Index)</span>, <span className="highlight">soil moisture levels</span>, <span className="highlight">land surface temperature</span>, and other environmental indicators.
      </p>

      <p>
        We use data from open-access satellite sources like <span className="highlight">Sentinel-2 and MODIS</span>, processed through APIs to retrieve accurate and high-resolution imagery. The data pipeline is optimized to ensure timely updates and low latency for field-level monitoring.
      </p>

      <p>
        What makes our solution unique is its focus on <span className="highlight">actionable insights</span>. We don’t just display numbers — we interpret them. Our system maps the retrieved data to an internal crop suitability model, providing users with real-time suggestions based on local agro-climatic conditions.
      </p>

      <p>
        Whether you're a farmer looking to increase yield, an agronomist conducting research, or a policymaker focused on food security, our platform offers a powerful, accessible, and intelligent way to turn remote sensing data into impactful agricultural strategies.
      </p>

      <p>
        Join us in driving the future of smart farming with data, intelligence, and sustainability at the core.
      </p>
    </div>
  );
};

export default AboutUs;
