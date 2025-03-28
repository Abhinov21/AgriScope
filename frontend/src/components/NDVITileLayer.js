import { TileLayer } from 'react-leaflet';

const NDVITileLayer = ({ ndviUrl }) => {
  return ndviUrl ? (
    <TileLayer className="ndvi-tile-layer" url={ndviUrl} opacity={0.6} />
  ) : null;
};

export default NDVITileLayer;
