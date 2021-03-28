import React from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'

const App = () => {
  return (
    <MapContainer id="container" center={[-33.865143, 151.209900]} zoom={13} scrollWheelZoom={true} >
      <TileLayer attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap </a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Marker position={[-33.865143, 151.209900]}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer >
  );
}

export default App;
