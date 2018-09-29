import React, { Component } from "react";
import "./App.css";

class Hamburger extends Component {
  render() {
    return (
      <a id="menu" onClick={() => this.props.toggleMenu()}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
          <path d="M2 6h20v3H2zm0 5h20v3H2zm0 5h20v3H2z" />
        </svg>
      </a>
    );
  }
}

export default Hamburger;
