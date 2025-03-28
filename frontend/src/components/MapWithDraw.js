import { useMap, useMapEvent } from 'react-leaflet';
import { FeatureGroup } from 'react-leaflet';
import { EditControl } from 'react-leaflet-draw';

const MapWithDraw = ({ setAoiCoordinates }) => {
  const map = useMap();

  useMapEvent('draw:created', (e) => {
    const { layer } = e;
    if (layer) {
      const coordinates = layer
        .getLatLngs()[0]
        .map((latlng) => [latlng.lng, latlng.lat]);

      console.log('AOI Coordinates:', coordinates);
      setAoiCoordinates(coordinates);
    }
  });

  return (
    <FeatureGroup>
      <EditControl
        position="topright"
        draw={{
          rectangle: false,
          circle: false,
          marker: false,
          circlemarker: false,
          polygon: true,
          polyline: false,
        }}
        edit={{
          remove: true,
        }}
      />
    </FeatureGroup>
  );
};

export default MapWithDraw;
