import React, { Component } from "react";
import "./App.css";

class Hamburger extends Component {
  // function that checks which key has been pressed
  // while the hamburger menu icon is selected
  handleKeyDown = e => {
    // if the key pressed is either enter or the space bar
    if (e.keyCode === 13 || e.keyCode === 32) {
      e.preventDefault();
      this.props.toggleMenu();
    }
  };
  render() {
    return (
      <a
        id="menu"
        role="button"
        aria-label="Toggle Menu"
        onClick={() => this.props.toggleMenu()}
        onKeyDown={this.handleKeyDown}
      >
        <svg
          tabIndex="0"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
        >
          <path d="M2 6h20v3H2zm0 5h20v3H2zm0 5h20v3H2z" />
        </svg>
      </a>
    );
  }
}

export default Hamburger;
