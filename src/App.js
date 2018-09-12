import React, { Component } from "react";
import "./App.css";
import MapContainer from "./MapContainer.js";
import { GoogleApiWrapper } from "google-maps-react";

const API_KEY = `${process.env.REACT_APP_API_KEY}`;

class App extends Component {
  render() {
    return (
      <div className="App">
        {/* Header */}
        <header className="main-header">
          <h1>My Neighborhood Map App</h1>
        </header>
        <MapContainer google={this.props.google} />
      </div>
    );
  }
}

export default GoogleApiWrapper({
  client: API_KEY
})(App);
