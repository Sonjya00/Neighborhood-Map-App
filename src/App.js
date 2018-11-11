import React, { Component } from "react";
import { GoogleApiWrapper } from "google-maps-react";
import "./App.css";
import MapContainer from "./components/MapContainer.js";
import HamburgerButton from "./components/HamburgerButton.js";

// import Google Maps API key from environment variable
const GM_API_KEY = `${process.env.REACT_APP_GM_API_KEY}`;

// Add event listener to check if there's an error while loading the Google Maps API script
document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("root");
  // Get the script that loads Google Maps API
  const scriptTag = document.getElementsByTagName("SCRIPT").item(1);
  // In case there is an error, the "Loading..." message is deleted,
  // and instead, an error message is displayed both in the dom and in the console
  scriptTag.onerror = () => {
    console.log(
      `Something went wrong. This page didn't load Google Maps API correctly.`
    );
    root.removeChild(root.childNodes[0]);
    const errorMsg = document.createElement("div");
    errorMsg.innerHTML = `<div class="error-msg">Something went wrong. This page didn't load Google Maps API correctly.</div>`;
    root.appendChild(errorMsg);
  };
});

class App extends Component {
  state = {
    menuOpen: false // modified by the hamburger component
  };

  // The menu is open or closed from the start depending on the
  // viewport width
  componentDidMount() {
    this.setState(() => ({
      menuOpen: window.innerWidth < 550 ? false : true
    }));
  }

  // Open and close the menu. Triggered by the hamburger,
  // and by clicking on a list item (only if the menu takes up 100% of the viewport)
  toggleMenu = () => {
    this.setState(prevState => ({
      menuOpen: !prevState.menuOpen
    }));
  };

  render() {
    return (
      <div className="App">
        {/* Header */}
        <header className="main-header">
          <h1>My Neighborhood Map</h1>
          <HamburgerButton toggleMenu={this.toggleMenu} />
        </header>
        {/* Placelist & Map */}
        <MapContainer
          google={this.props.google}
          menuOpen={this.state.menuOpen}
          toggleMenu={this.toggleMenu}
        />
        {/* Footer */}
        <footer className="footer" role="contentinfo">
          © 2018 - Sonia Gorla
          <img
            alt="Powered by Foursquare"
            className="foursquare-attribution"
            src={require("./img/powered-by-foursquare-grey.svg")}
          />
        </footer>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  client: GM_API_KEY
})(App);
