import React, { Component } from "react";

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
          width="54"
          height="54"
          viewBox="0 0 18 18"
        >
          <path d="M2 13.5h14V12H2v1.5zm0-4h14V8H2v1.5zM2 4v1.5h14V4H2z" />
        </svg>
      </a>
    );
  }
}

export default Hamburger;
