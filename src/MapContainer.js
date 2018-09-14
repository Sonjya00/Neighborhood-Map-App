import React, { Component } from "react";
import ReactDOM from "react-dom";
import escapeRegExp from "escape-string-regexp";
import sortBy from "sort-by";

import PlaceList from "./PlaceList.js";
import neighborhoodData from "./Neighborhood-Places.js";

export default class MapContainer extends Component {
  state = {
    neighborhood: neighborhoodData.neighborhoodLoc, // center of the map
    allPlaces: neighborhoodData.allPlaces, // all venues
    showingPlaces: [],
    allMarkers: [],
    activeMarker: null,
    infowindow: null,
    query: ""
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
    const bounds = new google.maps.LatLngBounds();
    const allMarkers = [];

    const defaultIcon = this.makeMarkerIcon("AED8E5");

    this.state.allPlaces.forEach(place => {
      const marker = new maps.Marker({
        position: place.position,
        map: this.map,
        title: place.name,
        animation: maps.Animation.DROP,
        id: place.id,
        icon: defaultIcon
      });

      // When a marker is clicked, make it active, and color the item in the list
      marker.addListener("click", () => {
        this.colorPlaceList(place);
        this.setActiveMarker(marker);
      });

      bounds.extend(marker.position);
      allMarkers.push(marker);
    });

    // Store all markers in the state to retrieve later
    this.setState({
      allMarkers: allMarkers
    });
    this.map.fitBounds(bounds);
  };

  setActiveMarker = marker => {
    const { google } = this.props;
    const defaultIcon = this.makeMarkerIcon("AED8E5");
    // const hoveredIcon = this.makeMarkerIcon("00a2d3");
    const activeIcon = this.makeMarkerIcon("10637c");

    marker.setIcon(activeIcon);
    marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(() => marker.setAnimation(google.maps.Animation.NULL), 300);
    if (
      this.state.activeMarker !== null &&
      this.state.activeMarker !== marker
    ) {
      this.state.activeMarker.setIcon(defaultIcon);
    }
    this.setState({
      activeMarker: marker
    });
    this.populateInfoWindow(marker);
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

  selectPlaceFromList = place => {
    this.colorPlaceList(place);
    const selectedMarker = this.state.allMarkers.find(
      marker => marker.id === place.id
    );
    this.setActiveMarker(selectedMarker);
  };

  colorPlaceList = place => {
    document
      .querySelectorAll(".place-list__item")
      .forEach(li => li.classList.remove("selected-li"));
    document.getElementById(place.id).classList.add("selected-li");
  };

  queryFilter = query => {
    // variable to filter places and markers
    const match = new RegExp(escapeRegExp(query), "i");
    // close the infowindow if there is one open
    if (this.state.infowindow) {
      this.state.infowindow.close();
    }
    this.setState({
      query: query,
      infowindow: null,
      // filter the places
      showingPlaces: this.state.allPlaces.filter(place =>
        match.test(place.name)
      )
    });
    // filter the markers and show/hide them
    this.state.allMarkers.forEach(marker => {
      return match.test(marker.title)
        ? marker.setVisible(true)
        : marker.setVisible(false);
    });
  };

  render() {
    return (
      <div className="main-container">
        <PlaceList
          allPlaces={(this.state.query
            ? this.state.showingPlaces
            : this.state.allPlaces
          ).sort(sortBy("name"))}
          selectPlaceFromList={this.selectPlaceFromList}
          queryFilter={this.queryFilter}
        />
        <div className="map__container">
          <div ref="map" className="map">
            Loading map...
          </div>
        </div>
      </div>
    );
  }
}
