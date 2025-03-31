import React, { useState } from "react";
import "../styles/dataAnalysis.css";

const cropData = {
  wheat: {
    pros: ["High yield", "Good market value", "Resistant to cold"],
    cons: ["Requires proper irrigation", "Vulnerable to pests", "Soil depletion risk"],
  },
  rice: {
    pros: ["Grows well in wet conditions", "High demand", "Multiple harvests possible"],
    cons: ["Needs a lot of water", "Labor-intensive", "Prone to diseases"],
  },
  corn: {
    pros: ["Fast growth", "Used in multiple industries", "Drought-resistant varieties available"],
    cons: ["Requires rich soil", "Needs pest control", "Can be affected by weather changes"],
  },
};

const DataAnalysis = () => {
  const [selectedCrop, setSelectedCrop] = useState("");
  const [cropInfo, setCropInfo] = useState(null);

  const handleCropSelection = (e) => {
    const crop = e.target.value.toLowerCase();
    setSelectedCrop(crop);
    setCropInfo(cropData[crop] || null);
  };

  return (
    <div>
      <div className="analysis-container">
        <h2>Crop Data Analysis</h2>
        
        <label>Select a Crop:</label>
        <select value={selectedCrop} onChange={handleCropSelection}>
          <option value="">--Select--</option>
          <option value="wheat">Wheat</option>
          <option value="rice">Rice</option>
          <option value="corn">Corn</option>
        </select>

        {cropInfo && (
          <div className="crop-info">
            <h3>Pros & Cons of {selectedCrop.charAt(0).toUpperCase() + selectedCrop.slice(1)}</h3>
            
            <div className="pros-cons">
              <div className="pros">
                <h4>Pros:</h4>
                <ul>
                  {cropInfo.pros.map((pro, index) => (
                    <li key={index}>✅ {pro}</li>
                  ))}
                </ul>
              </div>
              
              <div className="cons">
                <h4>Cons:</h4>
                <ul>
                  {cropInfo.cons.map((con, index) => (
                    <li key={index}>❌ {con}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DataAnalysis;
