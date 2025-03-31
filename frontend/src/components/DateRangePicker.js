// src/components/DateRangePicker.js
import React from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DateRangePicker = ({ startDate, endDate, onStartChange, onEndChange }) => {
  return (
    <div className="date-range-picker">
      <div>
        <label>Start Date</label>
        <DatePicker
          selected={startDate}
          onChange={(date) => onStartChange(date)}
          dateFormat="yyyy-MM-dd"
        />
      </div>
      <div>
        <label>End Date</label>
        <DatePicker
          selected={endDate}
          onChange={(date) => onEndChange(date)}
          dateFormat="yyyy-MM-dd"
        />
      </div>
    </div>
  );
};

export default DateRangePicker;
