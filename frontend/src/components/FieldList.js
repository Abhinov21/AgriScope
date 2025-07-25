// src/components/FieldList.js
import React, { useState } from "react";
import "../styles/FieldList.css";

const FieldList = ({ fields, selectedField, onFieldSelect, onFieldDelete, onFieldRename, compact = false }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [editingField, setEditingField] = useState(null);
  const [newFieldName, setNewFieldName] = useState("");
  
  // Filter fields based on search term
  const filteredFields = fields.filter(field => 
    (field.plot_name || field.id || "").toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Handle rename field
  const handleRenameClick = (field, e) => {
    e.stopPropagation(); // Prevent field selection when clicking rename
    setEditingField(field.id || field._id);
    setNewFieldName(field.plot_name || "");
  };

  // Submit rename
  const handleRenameSubmit = (e) => {
    e.preventDefault();
    if (newFieldName.trim() && editingField) {
      onFieldRename(editingField, newFieldName.trim());
      setEditingField(null);
      setNewFieldName("");
    }
  };

  // Handle delete confirmation
  const handleDeleteClick = (field, e) => {
    e.stopPropagation(); // Prevent field selection when clicking delete
    if (window.confirm(`Are you sure you want to delete "${field.plot_name || field.id || "Unnamed Field"}"?`)) {
      onFieldDelete(field.id || field._id);
    }
  };
  
  return (
    <div className={`field-list ${compact ? 'compact' : ''}`}>
      <h3 className="field-list-title">{compact ? "Select Field" : "Your Fields"}</h3>
      
      <div className="search-box">
        <input
          type="text"
          placeholder="Search fields..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>
      
      {fields.length === 0 ? (
        <p className="no-fields-msg">No fields available. Please draw a field.</p>
      ) : filteredFields.length === 0 ? (
        <p className="no-fields-msg">No fields match your search.</p>
      ) : (
        <ul className="fields-list">
          {filteredFields.map((field) => (
            <li 
              key={field.id || field._id} 
              className={`field-item ${selectedField && (selectedField.id === field.id || selectedField._id === field._id) ? 'selected' : ''}`}
              onClick={() => onFieldSelect(field)}
            >
              {editingField === (field.id || field._id) ? (
                <form onSubmit={handleRenameSubmit} className="field-rename-form">
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    autoFocus
                    className="field-rename-input"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <div className="field-actions">
                    <button 
                      type="submit" 
                      className="field-action-btn save-rename-btn"
                      onClick={(e) => e.stopPropagation()}
                    >
                      Save
                    </button>
                    <button 
                      type="button" 
                      className="field-action-btn cancel-rename-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingField(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="field-info">
                    <span className="field-name">{field.plot_name || field.id || "Unnamed Field"}</span>
                    {field.area && (
                      <span className="field-area">{(field.area || 0).toFixed(2)} ha</span>
                    )}
                    {field.created_at && (
                      <span className="field-date">Created: {formatDate(field.created_at)}</span>
                    )}
                  </div>
                  <div className="field-actions">
                    {!compact && (
                      <>
                        <button 
                          className="field-action-btn rename-btn" 
                          onClick={(e) => handleRenameClick(field, e)}
                          title="Rename field"
                        >
                          ✏️
                        </button>
                        <button 
                          className="field-action-btn delete-btn" 
                          onClick={(e) => handleDeleteClick(field, e)}
                          title="Delete field"
                        >
                          🗑️
                        </button>
                      </>
                    )}
                    <div className="field-arrow">›</div>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
      <p className="field-count">Total fields: {fields.length}</p>
    </div>
  );
};

export default FieldList;
