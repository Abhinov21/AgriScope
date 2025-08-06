import React, { useState, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import '../styles/LocationSearch.css';

const LocationSearch = ({ onLocationSelect }) => {
  const map = useMap(); // Get map instance from react-leaflet context
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef(null);
  const debounceRef = useRef(null);

  const searchLocation = async (searchQuery) => {
    if (!searchQuery.trim() || searchQuery.length < 3) {
      setSuggestions([]);
      setShowDropdown(false);
      return;
    }

    setIsLoading(true);
    try {
      // Hardcoded institutes that might not be found in OSM
      const hardcodedInstitutes = [
        {
          id: 'hardcoded_iiitdm_jabalpur',
          display_name: 'IIITDM Jabalpur, Madhya Pradesh, India',
          lat: 23.1758267,
          lon: 80.0224215,
          type: 'university',
          importance: 0.9
        },
        {
          id: 'hardcoded_iiit_jabalpur',
          display_name: 'IIIT Jabalpur, Madhya Pradesh, India',
          lat: 23.1758267,
          lon: 80.0224215,
          type: 'university',
          importance: 0.9
        },
        {
          id: 'hardcoded_pdpm_iiitdm',
          display_name: 'PDPM IIITDM Jabalpur, Madhya Pradesh, India',
          lat: 23.1758267,
          lon: 80.0224215,
          type: 'university',
          importance: 0.9
        },
        {
          id: 'hardcoded_iit_delhi',
          display_name: 'IIT Delhi, New Delhi, India',
          lat: 28.5453106,
          lon: 77.1929678,
          type: 'university',
          importance: 0.9
        },
        {
          id: 'hardcoded_iit_bombay',
          display_name: 'IIT Bombay, Mumbai, Maharashtra, India',
          lat: 19.1334300,
          lon: 72.9132800,
          type: 'university',
          importance: 0.9
        },
        {
          id: 'hardcoded_nit_bhopal',
          display_name: 'NIT Bhopal, Madhya Pradesh, India',
          lat: 23.2156000,
          lon: 77.4059000,
          type: 'university',
          importance: 0.8
        }
      ];

      // Check for hardcoded matches first
      const hardcodedMatches = hardcodedInstitutes.filter(institute => 
        institute.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        searchQuery.toLowerCase().includes('iiitdm') ||
        searchQuery.toLowerCase().includes('iiit') ||
        searchQuery.toLowerCase().includes('pdpm') ||
        searchQuery.toLowerCase().includes('jabalpur')
      );

      // Create multiple search variations for better results
      const searchVariations = [
        searchQuery,
        // Handle common institute abbreviations
        searchQuery.replace(/IIITDM/gi, 'IIIT'),
        searchQuery.replace(/IIITDM/gi, 'Indian Institute of Information Technology'),
        searchQuery.replace(/IIT/gi, 'Indian Institute of Technology'),
        searchQuery.replace(/NIT/gi, 'National Institute of Technology'),
        searchQuery.replace(/AIIMS/gi, 'All India Institute of Medical Sciences'),
        // Add common location terms
        searchQuery + ' college',
        searchQuery + ' university',
        searchQuery + ' institute'
      ];

      // Remove duplicates and empty strings
      const uniqueSearches = [...new Set(searchVariations)].filter(term => term.trim());
      
      let allResults = [];
      
      // Try each search variation
      for (const variation of uniqueSearches.slice(0, 3)) { // Limit to 3 variations to avoid too many requests
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
              variation
            )}&limit=3&addressdetails=1&countrycodes=IN`
          );
          
          if (response.ok) {
            const data = await response.json();
            allResults = [...allResults, ...data];
          }
        } catch (error) {
          console.warn(`Error with search variation "${variation}":`, error);
        }
        
        // Small delay between requests to be respectful to the API
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Remove duplicates based on place_id and format results
      const uniqueResults = allResults.reduce((acc, current) => {
        const exists = acc.find(item => item.place_id === current.place_id);
        if (!exists) {
          acc.push(current);
        }
        return acc;
      }, []).slice(0, 5); // Limit to 5 API results to make room for hardcoded

      const apiSuggestions = uniqueResults.map(item => ({
        id: item.place_id,
        display_name: item.display_name,
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon),
        type: item.type,
        importance: item.importance
      }));

      // Combine hardcoded matches with API results, prioritizing hardcoded
      const combinedSuggestions = [
        ...hardcodedMatches,
        ...apiSuggestions
      ].slice(0, 8); // Limit total to 8 results
        
      setSuggestions(combinedSuggestions);
      setShowDropdown(combinedSuggestions.length > 0);
    } catch (error) {
      console.error('Error searching location:', error);
      setSuggestions([]);
      setShowDropdown(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Debounce search
    debounceRef.current = setTimeout(() => {
      searchLocation(value);
    }, 300);
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.display_name);
    setShowDropdown(false);
    
    // Zoom to location on map
    if (map) {
      map.setView([suggestion.lat, suggestion.lon], 13);
      
      // Add a temporary marker at the location
      const marker = L.marker([suggestion.lat, suggestion.lon])
        .addTo(map)
        .bindPopup(suggestion.display_name)
        .openPopup();
      
      // Remove marker after 5 seconds
      setTimeout(() => {
        map.removeLayer(marker);
      }, 5000);
    }
    
    // Call callback if provided
    if (onLocationSelect) {
      onLocationSelect(suggestion);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setShowDropdown(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clean up debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="location-search-container" ref={searchRef}>
      <div className="search-input-wrapper">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search for cities, colleges, landmarks... (e.g., IIIT Jabalpur)"
          className="location-search-input"
          onFocus={() => suggestions.length > 0 && setShowDropdown(true)}
        />
        
        {isLoading && (
          <div className="search-loading">
            <span className="loading-spinner">⟳</span>
          </div>
        )}
        
        {query && (
          <button onClick={handleClear} className="clear-search-btn">
            ×
          </button>
        )}
      </div>

      {showDropdown && suggestions.length > 0 && (
        <div className="search-dropdown">
          {suggestions.map((suggestion) => (
            <div
              key={suggestion.id}
              className="search-suggestion"
              data-hardcoded={suggestion.id.toString().startsWith('hardcoded_')}
              onClick={() => handleSuggestionClick(suggestion)}
            >
              <div className="suggestion-main">
                <span className="suggestion-name">
                  {suggestion.display_name.split(',')[0]}
                  {suggestion.id.toString().startsWith('hardcoded_') && ' 🏫'}
                </span>
                <span className="suggestion-type">
                  {suggestion.type}
                </span>
              </div>
              <div className="suggestion-address">
                {suggestion.display_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationSearch;
