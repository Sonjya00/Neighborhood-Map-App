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
    showingPlaces: [], // filtered places based on current query
    allMarkers: [], // all markers for all venues
    activeMarker: null, // currently selected marker
    infowindow: null, // pop up window
    query: "" // query from the search bar
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

    // Make all markers
    this.state.allPlaces.forEach(place => {
      const marker = new maps.Marker({
        position: place.position,
        map: this.map,
        title: place.name,
        animation: maps.Animation.DROP,
        id: place.id,
        icon: defaultIcon
      });
      // When a marker is clicked, it is animated and becomes active,
      // replacing any previously selected marker
      marker.addListener("click", () => {
        this.handleActiveMarker(marker);
      });
      bounds.extend(marker.position);
      allMarkers.push(marker);
    });
    // Store all markers in the state to retrieve later
    this.setState({
      allMarkers: allMarkers
    });
    // Adjust map to fit all the markers
    this.map.fitBounds(bounds);
  };

  handleActiveMarker = marker => {
    const { google } = this.props;
    const defaultIcon = this.makeMarkerIcon("AED8E5");
    const activeIcon = this.makeMarkerIcon("10637c");
    // set to default icon previously selected marker.
    if (
      this.state.activeMarker !== null &&
      this.state.activeMarker !== marker
    ) {
      this.state.activeMarker.setIcon(defaultIcon);
    }
    // if a valid marker is passed, set it to activeMarker
    if (marker && marker !== this.state.activeMarker) {
      marker.setIcon(activeIcon);
      marker.setAnimation(google.maps.Animation.BOUNCE);
      setTimeout(() => marker.setAnimation(google.maps.Animation.NULL), 300);
      this.setState({
        activeMarker: marker
      });
      this.populateInfoWindow(marker);
    }
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
    // if there's an open infowindow in the state, close it.
    // In any case, associate the infowindow with the currently selected marker,
    // Set its content, add the listener to close it, then open it.
    // Lastly, set this infowindow to be the current one in the state.

    // if (infowindow.marker !== marker) {
    if (this.state.infowindow !== null) {
      this.state.infowindow.close();
    }
    infowindow.marker = marker;

    infowindow.addListener("closeclick", () => {
      // infowindow.marker = null;
      this.setState({
        infowindow: null
      });
    });

    // FETCH REQUEST
    // constants needed for the fetch request
    const clientID = "M3R0LNMQQVYUJO4XVCHJZQYA0BGGUEGL203MKA230F05D3UC";
    const clientSecret = "MZ41VN0DEUT0MJ0ICKAVY1A3RP4QEETSMP2Y024J31KV1ZNW";
    const lat = 34.0587;
    const lng = -118.305;

    let placeInfo = null;
    let photoURL = null;

    ////////// STREETVIEW CODE
    const { google } = this.props;
    const streetViewService = new google.maps.StreetViewService();
    const radius = 50;
    // In case the panoramic is found and the status is OK,
    // compute the position of the streetview image, then calculate the heading,
    //then get a panorama from that and set the options
    function getStreetView(data, status) {
      if (status == google.maps.StreetViewStatus.OK) {
        const nearStreetViewLocation = data.location.latLng;
        const heading = google.maps.geometry.spherical.computeHeading(
          nearStreetViewLocation,
          marker.position
        );
        infowindow.setContent(
          `<div>
          <h3 class="infowindow-title">${marker.title}</h3>
          <div id="pano"></div></div>`
        );
        const panoramaOptions = {
          position: nearStreetViewLocation,
          pov: {
            heading: heading,
            pitch: 10
          }
        };
        const panorama = new google.maps.StreetViewPanorama(
          document.getElementById("pano"),
          panoramaOptions
        );
      } else {
        infowindow.setContent(
          `<div> ${marker.title} </div><div>No Street View Found</div>`
        );
      }
    }
    //use streetview service to get the closest streetview image within
    // 50 meters of the markers position
    streetViewService.getPanoramaByLocation(
      marker.position,
      radius,
      getStreetView
    );

    /////// END OF STREETVIEW CODE

    // // fetch the venue ID
    // fetch(
    //   `https://api.foursquare.com/v2/venues/search?ll=${lat},${lng}&v=20180518&query=${
    //     marker.title
    //   }&limit=1&client_id=${clientID}&client_secret=${clientSecret}`
    // )
    //   .then(response => response.json())
    //   .then(data => {
    //     const venueID = data.response.venues[0].id;
    //     placeInfo = data.response.venues[0];
    //     // fetch the photo
    //     fetch(
    //       `https://api.foursquare.com/v2/venues/${venueID}/photos?v=20180518&client_id=${clientID}&client_secret=${clientSecret}`
    //     )
    //       .then(response => response.json())
    //       .then(data => {
    //         // if (data.response.photos.items) {
    //         //   photoURL = data.response.photos.items;
    //         // }
    //         // this.setInfowindowContent(infowindow, marker, placeInfo, photoURL);
    //         console.log(placeInfo);
    //       });
    //   })
    //   // show errors of the first fetch request
    //   .catch(error => console.log(error));

    // // end of fetch requests

    // OPENING INFOWINDOW
    infowindow.open(this.map, marker);
    this.setState({
      infowindow: infowindow
    });
    // }
  };

  setInfowindowContent(infowindow, marker, placeInfo, photoURL) {
    // ${
    //   photoURL[0].width
    // }x${photoURL[0].height}
    infowindow.setContent(
      // `<div><h3>${marker.title}</h3><img src="${photoURL[0].prefix}100x300${
      //   photoURL[0].suffix
      // }"></div>`
      `<div><h3>${marker.title}</h3><p>${placeInfo.categories[0].name}</p>
      <p>${placeInfo.location.formattedAddress}</p></div>`
    );
    console.log(placeInfo);
  }

  selectPlaceFromList = place => {
    const selectedMarker = this.state.allMarkers.find(
      marker => marker.id === place.id
    );
    this.handleActiveMarker(selectedMarker);
  };

  queryFilter = query => {
    // variable to filter places and markers
    const match = new RegExp(escapeRegExp(query), "i");
    // close the infowindow if there is one open
    if (this.state.infowindow) {
      this.state.infowindow.close();
    }
    this.setState({
      activeMarker: null,
      infowindow: null,
      query: query,
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
    this.handleActiveMarker(null);
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
          activeMarker={this.state.activeMarker}
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
