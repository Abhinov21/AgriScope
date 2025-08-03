// src/components/DateRangePicker.js
import React, { useState, useEffect } from "react";
import "../styles/DateRangePicker.css";

const DateRangePicker = ({ startDate, endDate, onStartChange, onEndChange }) => {
  const [range, setRange] = useState("custom");
  
  // Format date to YYYY-MM-DD for input fields
  const formatDateForInput = (date) => {
    try {
      if (!date || isNaN(date.getTime())) {
        return '';
      }
      return date.toISOString().split("T")[0];
    } catch (error) {
      console.error('Error formatting date:', error);
      return '';
    }
  };
  
  // Calculate date difference in days
  const calculateDateDifference = () => {
    try {
      if (!startDate || !endDate || isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        return 0;
      }
      const diffTime = Math.abs(endDate - startDate);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    } catch (error) {
      console.error('Error calculating date difference:', error);
      return 0;
    }
  };
  
  // Apply quick range presets - adjusted to exclude last 5 days
  const applyQuickRange = (preset) => {
    // Use today minus 5 days as the latest available data point
    const today = new Date();
    const latestReliableDate = new Date(today);
    latestReliableDate.setDate(today.getDate() - 5);
    
    let newStartDate, newEndDate;
    
    switch(preset) {
      case "7days":
        newEndDate = new Date(latestReliableDate);
        newStartDate = new Date(latestReliableDate);
        newStartDate.setDate(newEndDate.getDate() - 7);
        break;
      case "30days":
        newEndDate = new Date(latestReliableDate);
        newStartDate = new Date(latestReliableDate);
        newStartDate.setDate(newEndDate.getDate() - 30);
        break;
      case "90days":
        newEndDate = new Date(latestReliableDate);
        newStartDate = new Date(latestReliableDate);
        newStartDate.setDate(newEndDate.getDate() - 90);
        break;
      case "thisMonth":
        newEndDate = new Date(latestReliableDate);
        newStartDate = new Date(today.getFullYear(), today.getMonth(), 1);
        // If start of month is after our reliable date, use previous month
        if (newStartDate > newEndDate) {
          newStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        }
        break;
      case "lastMonth":
        newStartDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        newEndDate = new Date(today.getFullYear(), today.getMonth(), 0);
        // If end of last month is after our reliable date, adjust end date
        if (newEndDate > latestReliableDate) {
          newEndDate = new Date(latestReliableDate);
        }
        break;
      case "thisYear":
        newEndDate = new Date(latestReliableDate);
        newStartDate = new Date(today.getFullYear(), 0, 1);
        break;
      default:
        return;
    }
    
    onStartChange(newStartDate);
    onEndChange(newEndDate);
    setRange(preset);
  };
  
  // Update range state when dates change
  useEffect(() => {
    setRange("custom");
  }, [startDate, endDate]);
  
  // Warn if selected end date is too recent
  const isEndDateTooRecent = () => {
    try {
      if (!endDate || isNaN(endDate.getTime())) {
        return false;
      }
      const today = new Date();
      const fiveDaysAgo = new Date(today);
      fiveDaysAgo.setDate(today.getDate() - 5);
      return endDate > fiveDaysAgo;
    } catch (error) {
      console.error('Error checking date validity:', error);
      return false;
    }
  };
  
  return (
    <div className="date-range-picker">
      <h3 className="date-range-title">Select Date Range</h3>
      
      <div className="date-inputs">
        <div className="date-field">
          <label className="date-label" htmlFor="start-date">Start Date:</label>
          <input
            id="start-date"
            type="date"
            className="date-input"
            value={formatDateForInput(startDate)}
            onChange={(e) => {
              const dateValue = e.target.value;
              if (dateValue) {
                const newDate = new Date(dateValue + 'T00:00:00');
                if (!isNaN(newDate.getTime())) {
                  onStartChange(newDate);
                }
              }
            }}
            max={formatDateForInput(endDate)}
          />
        </div>
        
        <div className="date-field">
          <label className="date-label" htmlFor="end-date">End Date:</label>
          <input
            id="end-date"
            type="date"
            className="date-input"
            value={formatDateForInput(endDate)}
            onChange={(e) => {
              const dateValue = e.target.value;
              if (dateValue) {
                const newDate = new Date(dateValue + 'T00:00:00');
                if (!isNaN(newDate.getTime())) {
                  onEndChange(newDate);
                }
              }
            }}
            min={formatDateForInput(startDate)}
          />
        </div>
      </div>
      
      <div className="quick-range-buttons">
        <button 
          className={`quick-range-btn ${range === "7days" ? "active" : ""}`}
          onClick={() => applyQuickRange("7days")}
        >
          Last 7 days
        </button>
        <button 
          className={`quick-range-btn ${range === "30days" ? "active" : ""}`}
          onClick={() => applyQuickRange("30days")}
        >
          Last 30 days
        </button>
        <button 
          className={`quick-range-btn ${range === "90days" ? "active" : ""}`}
          onClick={() => applyQuickRange("90days")}
        >
          Last 90 days
        </button>
        <button 
          className={`quick-range-btn ${range === "thisMonth" ? "active" : ""}`}
          onClick={() => applyQuickRange("thisMonth")}
        >
          This Month
        </button>
        <button 
          className={`quick-range-btn ${range === "lastMonth" ? "active" : ""}`}
          onClick={() => applyQuickRange("lastMonth")}
        >
          Last Month
        </button>
        <button 
          className={`quick-range-btn ${range === "thisYear" ? "active" : ""}`}
          onClick={() => applyQuickRange("thisYear")}
        >
          This Year
        </button>
      </div>
      
      <div className="date-range-info">
        Current selection: {calculateDateDifference()} days
      </div>
      
      {isEndDateTooRecent() && (
        <div className="date-range-warning">
          <span className="warning-icon">⚠️</span> Weather data may be incomplete for the last 5 days. Consider selecting an earlier end date.
        </div>
      )}
      
      <div className="date-range-note">
        Note: NASA POWER API weather data is typically delayed by 4-5 days.
      </div>
    </div>
  );
};

export default DateRangePicker;
