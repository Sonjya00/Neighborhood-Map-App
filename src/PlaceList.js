import React, { Component } from "react";

class PlaceList extends Component {
  state = {};

  handleClick(place) {
    this.props.selectPlaceFromList(place);
  }
  render() {
    return (
      <div className="place-list__container">
        <h2 className="place-list__title">Favorite places</h2>
        <p className="place-list__description">
          A list of my favorite places in Koreatown Los Angeles
        </p>
        <ul className="place-list__list">
          {this.props.allPlaces.map((place, index) => (
            <li
              key={index}
              id={index}
              className="place-list__item"
              onClick={() => this.handleClick(place)}
            >
              {place.name}
            </li>
          ))}
        </ul>
      </div>
    );
  }
}

export default PlaceList;
