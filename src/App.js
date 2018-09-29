import React, { Component } from "react";
import { GoogleApiWrapper } from "google-maps-react";
import "./App.css";
import MapContainer from "./MapContainer.js";
import Hamburger from "./Hamburger.js";

// import Google Maps API key from environment variable
const GM_API_KEY = `${process.env.REACT_APP_GM_API_KEY}`;

class App extends Component {
  state = {
    menuOpen: false // modified by the hamburger component
  };

  // open and close the menu, triggered by the hamburger,
  // and clicking a marker, if the menu takes up 100% of the viewport
  toggleMenu = () => {
    this.setState({
      menuOpen: !this.state.menuOpen
    });
  };

  render() {
    return (
      <div className="App">
        {/* Header */}
        <header className="main-header">
          <h1>My Neighborhood Map</h1>
          <Hamburger toggleMenu={this.toggleMenu} />
        </header>
        {/* Placelist & Map */}
        <MapContainer
          google={this.props.google}
          menuOpen={this.state.menuOpen}
          toggleMenu={this.toggleMenu}
        />
        {/* Footer */}
        <footer class="footer">2018 © - Coded by Sonia Gorla</footer>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  client: GM_API_KEY
})(App);
