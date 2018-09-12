import React, { Component } from "react";
import ReactDOM from "react-dom";

import neighborhoodData from "./Neighborhood-Places.js";

export default class MapContainer extends Component {
  state = {
    neighborhood: neighborhoodData.neighborhoodLoc, // center of the map
    allPlaces: neighborhoodData.allPlaces // all venues
  };

  componentDidMount() {
    this.loadMap();
  }

  loadMap() {
    if (this.props && this.props.google) {
      const { google } = this.props;
      const maps = google.maps;
      const mapRef = this.refs.map;
      const node = ReactDOM.findDOMNode(mapRef);
      const mapConfig = Object.assign(
        {},
        {
          center: this.state.neighborhood,
          zoom: 15,
          mapTypeId: "roadmap"
        }
      );
      this.map = new maps.Map(node, mapConfig);
    }
  }
  render() {
    return (
      <div className="main-container">
        <div className="place-list__container">
          <h2 className="place-list__title">Favorite places</h2>
          <p className="place-list__description">
            A list of my favorite places in Koreatown Los Angeles
          </p>
          <ul className="place-list__list">
            {this.state.allPlaces.map(place => (
              <li className="place-list__item">{place.name}</li>
            ))}
          </ul>
        </div>
        <div ref="map" className="map__container">
          Loading map...
        </div>
      </div>
    );
  }
}
