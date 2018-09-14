import React, { Component } from "react";

class PlaceList extends Component {
  handleClick(place) {
    this.props.selectPlaceFromList(place);
  }

  updateQuery(query) {
    this.props.queryFilter(query.trim());
  }
  render() {
    return (
      <div className="place-list__container">
        <h2 className="place-list__title">Favorite places</h2>
        <p className="place-list__description">
          A list of my favorite places in Koreatown Los Angeles
        </p>
        <input
          type="text"
          placeholder="Search for name"
          className="search-places"
          onChange={e => this.updateQuery(e.target.value)}
        />
        <ul className="place-list__list">
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
