import React, { Component } from "react";
import { GoogleApiWrapper } from "google-maps-react";
import "./App.css";
import MapContainer from "./MapContainer.js";

// import Google Maps API key from environment variable
const GM_API_KEY = `${process.env.REACT_APP_GM_API_KEY}`;

class App extends Component {
  render() {
    return (
      <div className="App">
        {/* Header */}
        <header className="main-header">
          <h1>My Neighborhood Map App</h1>
        </header>
        {/* Placelist & Map */}
        <MapContainer google={this.props.google} />
      </div>
    );
  }
}

export default GoogleApiWrapper({
  client: GM_API_KEY
})(App);
