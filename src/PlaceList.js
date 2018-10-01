import React, { Component } from "react";

class PlaceList extends Component {
  state = {
    cursor: null
  };

  // if the user clicks on a list item with the mouse
  handleClick(place, index) {
    this.setState({
      cursor: index
    });
    this.props.selectPlaceFromList(place);
  }

  // if the user shifts the focus on the listbox, and there isn't a selected item,
  // the first item of the list is automatically selected
  handleFocus = e => {
    setTimeout(() => {
      const { cursor } = this.state;
      if (cursor === null) {
        this.setState({
          cursor: 0
        });
        this.props.selectLiWithKeyboard(0);
      }
    }, 200);
  };

  // moves the cursor up and down according to the arrow keys pressed
  handleKeyDown = e => {
    const { cursor } = this.state;
    if (e.keyCode === 38 && cursor > 0) {
      e.preventDefault();
      this.setState(prevState => ({
        cursor: prevState.cursor - 1
      }));
      this.props.selectLiWithKeyboard(cursor - 1);
    } else if (
      e.keyCode === 40 &&
      cursor < this.props.showingPlaces.length - 1
    ) {
      e.preventDefault();
      this.setState(prevState => ({
        cursor: prevState.cursor + 1
      }));
      this.props.selectLiWithKeyboard(cursor + 1);
    }
  };

  updateQuery(query) {
    this.props.queryFilter(query.trim());
  }

  render() {
    return (
      <nav
        id="drawer"
        className={this.props.classList}
        role="complementary"
        aria-labelledby="listboxTitle"
      >
        <h2 id="listboxTitle" className="place-list__title">
          Favorite places
        </h2>
        <p className="place-list__description">
          A list of my favorite places in Koreatown, Los Angeles.
        </p>
        <input
          type="text"
          placeholder="Search for name"
          className="search-places"
          onChange={e => this.updateQuery(e.target.value)}
          aria-label="Search"
          tabIndex={this.props.menuOpen ? "0" : "-1"}
        />
        <ul
          className="place-list__list"
          role="listbox"
          aria-label="Places list"
          aria-activedescendant={
            this.props.activeMarker ? this.props.activeMarker.id : "none"
          }
          tabIndex={this.props.menuOpen ? "0" : "-1"}
          onKeyDown={this.handleKeyDown}
          onFocus={this.handleFocus}
        >
          {this.props.allPlaces.map((place, index) => (
            <li
              key={index}
              id={place.id}
              className={
                this.props.activeMarker &&
                this.props.activeMarker.id === place.id
                  ? "place-list__item selected-li"
                  : "place-list__item"
              }
              onClick={() => this.handleClick(place, index)}
              role="option"
              aria-selected={
                this.props.activeMarker &&
                this.props.activeMarker.id === place.id
                  ? true
                  : false
              }
            >
              {place.name}
            </li>
          ))}
        </ul>
      </nav>
    );
  }
}

export default PlaceList;
