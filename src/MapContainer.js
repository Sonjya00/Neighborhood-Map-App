import React, { Component } from "react";
import ReactDOM from "react-dom";

import neighborhoodData from "./Neighborhood-Places.js";

export default class MapContainer extends Component {
  state = {
    neighborhood: neighborhoodData.neighborhoodLoc, // center of the map
    allPlaces: neighborhoodData.allPlaces, // all venues
    activeMarker: null,
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
    const defaultIcon = this.makeMarkerIcon("AED8E5");
    const highlightedIcon = this.makeMarkerIcon("00a2d3");

    this.state.allPlaces.forEach((place, index) => {
      const marker = new maps.Marker({
        position: place.position,
        map: this.map,
        title: place.name,
        animation: maps.Animation.DROP,
        id: index,
        icon: defaultIcon
      });
      marker.addListener("click", () => {
        marker.setIcon(highlightedIcon);
        marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(() => marker.setAnimation(google.maps.Animation.NULL), 300);
        if (this.state.activeMarker !== null) {
          this.state.activeMarker.setIcon(defaultIcon);
        }
        this.setState({
          activeMarker: marker
        });
        this.populateInfoWindow(marker);
      });
    });
  };

  makeMarkerIcon = markerColor => {
    const { google } = this.props;
    const markerImage = new google.maps.MarkerImage(
      "http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|" +
        markerColor +
        "|40|_|%E2%80%A2",
      // new this.props.google.maps.Size(21, 34),
      // new this.props.google.maps.Point(0, 0),
      // new this.props.google.maps.Point(10, 34),
      null,
      null,
      null,
      new google.maps.Size(25, 42)
    );
    return markerImage;
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
