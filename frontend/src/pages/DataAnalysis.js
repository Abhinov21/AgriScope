import React, { useState } from "react";
import "../styles/dataAnalysis.css";

const cropData = {
  monsoon: {
    rice: {
      pros: ["Thrives in waterlogged soil", "High demand", "Multiple harvests possible"],
      cons: ["Needs a lot of water", "Labor-intensive", "Prone to diseases"],
    },
    maize: {
      pros: ["Fast-growing", "Versatile use", "Responds well to rainfall"],
      cons: ["Pest-prone", "High nutrient needs", "Not suitable for waterlogging"],
    },
    cotton: {
      pros: ["High market value", "Drought-tolerant", "Used in textile industry"],
      cons: ["Long growth period", "Prone to pests", "Needs dry weather during harvest"],
    },
    soybean: {
      pros: ["High protein", "Nitrogen fixer", "Short duration"],
      cons: ["Prone to diseases", "Needs well-drained soil", "Affected by heavy rain"],
    },
    pigeonpea: {
      pros: ["Drought resistant", "Improves soil fertility", "Good market"],
      cons: ["Long maturity period", "Sensitive to waterlogging", "Pest issues"],
    },
    greengram: {
      pros: ["Short growing cycle", "Rich in protein", "Fixes nitrogen"],
      cons: ["Not tolerant to excess rain", "Requires pest management", "Needs care at flowering"],
    },
    blackgram: {
      pros: ["Quick maturity", "Improves soil", "Suitable for intercropping"],
      cons: ["Susceptible to pests", "Not flood-tolerant", "Needs loose soil"],
    },
    groundnut: {
      pros: ["Oil-rich", "Fixes nitrogen", "Profitable cash crop"],
      cons: ["Needs sandy loam soil", "Prone to fungal diseases", "Labor-intensive harvesting"],
    },
    sesame: {
      pros: ["Drought-tolerant", "Low input", "High oil content"],
      cons: ["Sensitive to waterlogging", "Short harvesting window", "Pests like whitefly"],
    },
    castor: {
      pros: ["Tolerates dry conditions", "Used in lubricants and pharma", "Long shelf life"],
      cons: ["Long maturity", "Toxic seeds (non-edible)", "Sensitive to frost"],
    }
  },
  winter: {
    wheat: {
      pros: ["High yield", "Good market value", "Tolerates cool climates"],
      cons: ["Needs irrigation", "Prone to pests", "Requires good soil"],
    },
    mustard: {
      pros: ["Oil-rich", "Short duration", "Cold-tolerant"],
      cons: ["Needs dry weather during harvest", "Affected by frost", "Disease-prone"],
    },
    barley: {
      pros: ["Grows in poor soils", "Short duration", "Low input"],
      cons: ["Lower market demand", "Lodging issues", "Less industrial use"],
    },
    peas: {
      pros: ["High in protein", "Fixes nitrogen", "Short growing season"],
      cons: ["Sensitive to frost", "Needs staking support", "Prone to powdery mildew"],
    },
    chickpea: {
      pros: ["Rich in protein", "Drought tolerant", "Improves soil health"],
      cons: ["Affected by wilt and blight", "Sensitive to excess moisture", "Slow initial growth"],
    },
    linseed: {
      pros: ["Oil-rich", "Cold-tolerant", "Low water requirement"],
      cons: ["Less popular market", "Not suitable in sandy soils", "Moderate yield"],
    },
    oats: {
      pros: ["Good fodder crop", "Cold-tolerant", "Short growing period"],
      cons: ["Not high value", "Lodging in rains", "Needs timely sowing"],
    },
    garlic: {
      pros: ["High medicinal value", "Good market price", "Grows in small space"],
      cons: ["Needs proper curing", "Labor-intensive", "Sensitive to waterlogging"],
    },
    onion: {
      pros: ["Staple crop", "High demand", "Multiple harvest options"],
      cons: ["Needs storage facilities", "Prone to fungal rot", "Requires good soil"],
    },
    fenugreek: {
      pros: ["Short duration", "Used as spice/green manure", "Improves digestion"],
      cons: ["Not high yield", "Can bolt quickly", "Needs regular watering"],
    }
  },
  summer: {
    okra: {
      pros: ["Heat tolerant", "High demand", "Multiple harvests"],
      cons: ["Pest issues", "Needs regular picking", "Short shelf life"],
    },
    muskmelon: {
      pros: ["Short duration", "Juicy and profitable", "Tolerates high temp"],
      cons: ["Needs sandy soil", "Sensitive to humidity", "Short storage life"],
    },
    watermelon: {
      pros: ["Popular fruit", "Good market value", "Drought resistant"],
      cons: ["Requires spacing", "Susceptible to fruit fly", "Needs warm nights"],
    },
    brinjal: {
      pros: ["Long fruiting period", "Market stable", "Variety of types"],
      cons: ["Prone to pests", "Labor-intensive", "Sensitive to soil pH"],
    },
    tomato: {
      pros: ["High value", "Short duration", "Multiple uses"],
      cons: ["Needs staking", "Sensitive to temperature swings", "Prone to blight"],
    },
    amaranthus: {
      pros: ["Quick growth", "Nutritious", "High leaf yield"],
      cons: ["Short harvest period", "Requires good sunlight", "Lodging risk"],
    },
    cucumber: {
      pros: ["Fast growing", "Cooling veggie", "Short lifecycle"],
      cons: ["Prone to powdery mildew", "Needs trellis", "Water-sensitive"],
    },
    bittergourd: {
      pros: ["Nutritious", "Good market", "Resists many pests"],
      cons: ["Bitter taste not preferred by all", "Needs support to climb", "Slow initial growth"],
    },
    ridgegourd: {
      pros: ["High yield", "Climber – saves space", "Low maintenance"],
      cons: ["Needs frequent watering", "Pest risk", "Short shelf life"],
    },
    clusterbean: {
      pros: ["Drought resistant", "Used in gum production", "Improves soil"],
      cons: ["Not high value", "Prone to leaf spot", "Needs warm climate"],
    }
  },
  spring: {
    cabbage: {
      pros: ["Rich in nutrients", "Good price", "Multiple harvests"],
      cons: ["Prone to pests", "Bolting in heat", "Needs cool weather"],
    },
    cauliflower: {
      pros: ["Popular veggie", "Short cycle", "Good income"],
      cons: ["Sensitive to temp", "Bolting risk", "Fungal diseases"],
    },
    spinach: {
      pros: ["Nutritious", "Quick harvest", "Used widely"],
      cons: ["Bolts in heat", "Sensitive to soil salinity", "Short shelf life"],
    },
    carrot: {
      pros: ["High vitamin A", "Good yield", "Long shelf life"],
      cons: ["Needs deep loose soil", "Affected by root borer", "Slow maturity"],
    },
    beetroot: {
      pros: ["Iron-rich", "Short cycle", "Stable price"],
      cons: ["Staining during handling", "Root shape varies", "Sensitive to heat"],
    },
    lettuce: {
      pros: ["Used in salads", "Fast harvest", "Good price"],
      cons: ["Bolts in heat", "Short life post-harvest", "Needs good water management"],
    },
    radish: {
      pros: ["Quick growing", "Grows in small space", "High market demand"],
      cons: ["Pungent smell", "Cracks if overwatered", "Short harvest window"],
    },
    turnip: {
      pros: ["Root + leaves edible", "Short cycle", "Low maintenance"],
      cons: ["Needs sandy soil", "Can get fibrous if delayed", "Sensitive to warm weather"],
    },
    kale: {
      pros: ["Highly nutritious", "Cold hardy", "Low maintenance"],
      cons: ["Bitterness not preferred", "Pest issues", "Less market in rural areas"],
    },
    methi: {
      pros: ["Used in leaves and seeds", "Medicinal value", "Short cycle"],
      cons: ["Needs careful watering", "Not tolerant to heat", "Short harvesting time"],
    }
  }
};

const DataAnalysis = () => {
  const [selectedSeason, setSelectedSeason] = useState("");
  const [selectedCrop, setSelectedCrop] = useState("");
  const [cropInfo, setCropInfo] = useState(null);

  const handleSeasonChange = (e) => {
    const season = e.target.value;
    setSelectedSeason(season);
    setSelectedCrop("");
    setCropInfo(null);
  };

  const handleCropChange = (e) => {
    const crop = e.target.value;
    setSelectedCrop(crop);
    setCropInfo(cropData[selectedSeason][crop]);
  };

  return (
    <div className="analysis-container">
      <h2>Crop Pros & Cons by Season</h2>

      <label>Select a Season:</label>
      <select value={selectedSeason} onChange={handleSeasonChange}>
        <option value="">--Select Season--</option>
        <option value="monsoon">Monsoon</option>
        <option value="summer">Summer</option>
        <option value="winter">Winter</option>
        <option value="spring">Spring</option>
      </select>

      {selectedSeason && (
        <>
          <label>Select a Crop:</label>
          <select value={selectedCrop} onChange={handleCropChange}>
            <option value="">--Select Crop--</option>
            {Object.keys(cropData[selectedSeason]).map((crop) => (
              <option key={crop} value={crop}>
                {crop.charAt(0).toUpperCase() + crop.slice(1)}
              </option>
            ))}
          </select>
        </>
      )}

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
  );
};

export default DataAnalysis;
