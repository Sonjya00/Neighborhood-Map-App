import React, { Component } from "react";
import ReactDOM from "react-dom";

import neighborhoodData from "./Neighborhood-Places.js";

export default class MapContainer extends Component {
  state = {
    neighborhood: neighborhoodData.neighborhoodLoc, // center of the map
    allPlaces: neighborhoodData.allPlaces, // all venues
    infowindow: null
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
      this.makeMarkers();
    }
  }
  makeMarkers = () => {
    const { google } = this.props;
    const maps = google.maps;
    this.state.allPlaces.forEach((place, index) => {
      const marker = new maps.Marker({
        position: place.position,
        map: this.map,
        title: place.name,
        animation: maps.Animation.DROP,
        id: index
      });
      marker.addListener("click", () => {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(google.maps.Animation.NULL));
        this.populateInfoWindow(marker);
      });
    });
  };

  populateInfoWindow = marker => {
    const infowindow = new this.props.google.maps.InfoWindow();
    if (infowindow.marker !== marker) {
      if (this.state.infowindow !== null) {
        this.state.infowindow.close();
      }
      infowindow.marker = marker;
      infowindow.setContent(`<h3>${marker.title}</h3>`);
      infowindow.addListener("closeclick", () => {
        // infowindow.marker = null;
        this.setState({
          infowindow: null
        });
      });
      infowindow.open(this.map, marker);
      this.setState({
        infowindow: infowindow
      });
    }
  };

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
              <li key={place.id} className="place-list__item">
                {place.name}
              </li>
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
