// src/components/FieldList.js
import React from "react";

const FieldList = ({ fields, onFieldSelect }) => {
  return (
    <div className="field-list">
      <h4>Your Fields</h4>
      {fields.length === 0 ? (
        <p>No fields available. Please draw a field.</p>
      ) : (
        <ul>
          {fields.map((field) => (
            <li key={field.id}>
              <button onClick={() => onFieldSelect(field)}>
                {field.plot_name || field.id}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FieldList;
