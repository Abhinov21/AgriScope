import React, { useEffect, useRef } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-draw/dist/leaflet.draw.css";
import "leaflet-draw";

const MapWithDraw = ({ setAoiCoordinates, drawingMode, setDrawingMode }) => {
  const map = useMap();
  const drawControlRef = useRef(null);
  const featureGroupRef = useRef(null);
  
  useEffect(() => {
    if (!map) return;
    
    // Create a FeatureGroup to store editable layers
    const featureGroup = new L.FeatureGroup();
    map.addLayer(featureGroup);
    featureGroupRef.current = featureGroup;
    
    // Initialize the draw control
    const drawControl = new L.Control.Draw({
      draw: {
        polyline: false,
        circle: false,
        circlemarker: false,
        marker: false,
        rectangle: false,
        polygon: {
          allowIntersection: false,
          drawError: {
            color: "#e1e100",
            message: "<strong>Error:</strong> Polygon edges cannot intersect!"
          },
          shapeOptions: {
            color: "#2dd4bf",
            weight: 3
          }
        }
      },
      edit: {
        featureGroup: featureGroup,
        edit: false,
        remove: true
      }
    });
    
    map.addControl(drawControl);
    drawControlRef.current = drawControl;
    
    // Listen for draw events
    map.on(L.Draw.Event.CREATED, function(e) {
      const layer = e.layer;
      featureGroup.addLayer(layer);
      
      // Extract coordinates from drawn polygon
      const coordinates = layer.getLatLngs()[0].map(latLng => [latLng.lng, latLng.lat]);
      setAoiCoordinates(coordinates);
    });
    
    // Listen for delete events
    map.on(L.Draw.Event.DELETED, function(e) {
      // If all layers are deleted, clear AOI
      if (featureGroup.getLayers().length === 0) {
        setAoiCoordinates(null);
      }
    });
    
    return () => {
      // Clean up on unmount
      map.removeLayer(featureGroup);
      map.removeControl(drawControl);
    };
  }, [map, setAoiCoordinates]);
  
  // Handle drawing mode changes
  useEffect(() => {
    if (!map || !drawControlRef.current) return;
    
    if (drawingMode) {
      // Clear existing layers when entering drawing mode
      if (featureGroupRef.current) {
        featureGroupRef.current.clearLayers();
      }
      
      // Start drawing a new polygon
      new L.Draw.Polygon(map, drawControlRef.current.options.draw.polygon).enable();
    }
  }, [drawingMode, map]);
  
  return null;
};

export default MapWithDraw;
