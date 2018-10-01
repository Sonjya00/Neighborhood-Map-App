import React, { Component } from "react";
import ReactDOM from "react-dom";
import escapeRegExp from "escape-string-regexp";
import sortBy from "sort-by";

import PlaceList from "./PlaceList.js";
import neighborhoodData from "./Neighborhood-Places.js";

// import Foursquare keys from environment variables
const FSQ_CLIENTID = `${process.env.REACT_APP_FSQ_CLIENTID}`;
const FSQ_CLIENTSECRET = `${process.env.REACT_APP_FSQ_CLIENTSECRET}`;

export default class MapContainer extends Component {
  state = {
    neighborhood: neighborhoodData.neighborhoodLoc, // center of the map
    allPlaces: neighborhoodData.allPlaces, // all venues
    showingPlaces: neighborhoodData.allPlaces, // filtered places based on current query
    allMarkers: [], // all markers for all venues
    activeMarker: null, // currently selected marker
    infowindow: null, // pop up window
    googleInfowindow: new this.props.google.maps.InfoWindow(),
    query: "" // query from the search bar
  };

  // As soon as the component is mounted, load the map
  componentDidMount() {
    this.loadMap();
  }

  // MAP FUNCTION
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
  // MARKERS FUNCTIONS
  makeMarkers = () => {
    const { google } = this.props;
    const bounds = new google.maps.LatLngBounds();
    const allMarkers = [];
    const defaultIcon = this.makeMarkerIcon("AED8E5");

    // Make markers for each location
    this.state.allPlaces.forEach(place => {
      const marker = new google.maps.Marker({
        position: place.position,
        map: this.map,
        title: place.name,
        animation: google.maps.Animation.DROP,
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
    // set to default icon previously selected marker, if any.
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
      // this.map.setCenter(
      //   //   {
      //   //   lat: marker.position.lat() + 0.009,
      //   //   lng: marker.position.lng()
      //   // }
      //   marker.getPosition()
      // );
      this.populateInfoWindow(marker);
    }
  };

  makeMarkerIcon = markerColor => {
    const { google } = this.props;
    const markerImage = new google.maps.MarkerImage(
      `http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|${markerColor}|40|_|%E2%80%A2`,
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

  // INFOWINDOW FUNCTION
  populateInfoWindow = marker => {
    const { google } = this.props;
    // storing the infowindow in the state beforehand allows to open it
    // for the first time even with no internet
    const infowindow = this.state.googleInfowindow;
    // if there's an open infowindow in the state, close it.
    if (this.state.infowindow !== null) {
      this.state.infowindow.close();
    }
    // add the listener to close the infowindow and reset the active marker
    infowindow.marker = marker;
    infowindow.addListener("closeclick", () => {
      const defaultIcon = this.makeMarkerIcon("AED8E5");
      marker.setIcon(defaultIcon);
      this.setState({
        infowindow: null,
        activeMarker: null
      });
    });
    // store the current infowindow in the state
    this.setState({
      infowindow: infowindow
    });
    // set temporary content for the infowindow while the data is loading
    infowindow.setContent(`<div>Loading data...</div>`);
    // fetch the data
    this.fetchData(marker, infowindow);
    // open the infowindow
    infowindow.open(this.map, marker);
  };

  fetchData = (marker, infowindow) => {
    // constants needed for the fetch request
    const clientID = FSQ_CLIENTID;
    const clientSecret = FSQ_CLIENTSECRET;
    const lat = neighborhoodData.neighborhoodLoc.lat;
    const lng = neighborhoodData.neighborhoodLoc.lng;

    // data that will be fetched, to be used for the infowindow template
    let placeName = null;
    let placeIcon = null;
    let placeAddress = null;
    let placeCategory = null;
    let placeLikes = null;

    // fetch the venue ID, store the info of the place in a variable
    fetch(
      `https://api.foursquare.com/v2/venues/search?ll=${lat},${lng}&v=20180518&query=${
        marker.title
      }&limit=1&client_id=${clientID}&client_secret=${clientSecret}`
    )
      .then(response => response.json())
      .then(data => {
        const venueID = data.response.venues[0].id;
        const placeInfo = data.response.venues[0];
        placeName = placeInfo.name;
        placeIcon = `${placeInfo.categories[0].icon.prefix}32${
          placeInfo.categories[0].icon.suffix
        }`;
        placeAddress = placeInfo.location.formattedAddress.join("</p><p>");
        placeCategory = placeInfo.categories[0].name;
        //fetch the likes and store them in a variable
        fetch(
          `https://api.foursquare.com/v2/venues/${venueID}/likes?v=20180518&client_id=${clientID}&client_secret=${clientSecret}`
        )
          .then(response => response.json())
          .then(data => {
            placeLikes = data.response.likes.count;
          })
          // get streetview and set the infowindow content
          .then(() => {
            const { google } = this.props;
            const streetViewService = new google.maps.StreetViewService();
            const radius = 50;
            // In case the panoramic is found and the status is OK,
            // compute the position of the streetview image, then calculate the heading,
            //then get a panorama from that and set the options
            function getStreetView(data, status) {
              if (status === google.maps.StreetViewStatus.OK) {
                const nearStreetViewLocation = data.location.latLng;
                const heading = google.maps.geometry.spherical.computeHeading(
                  nearStreetViewLocation,
                  marker.position
                );
                infowindow.setContent(
                  `<div class="infowindow-heading">
                      <h3 class="infowindow-title">${placeName ||
                        marker.title}</h3>
                    </div>
                    <div class="infowindow-content">
                      <img alt="${placeCategory}" class="infowindow-icon" src="${placeIcon}">
                      <p class="infowindow-category">${placeCategory}</p>
                      <div class="infowindow-address"><p>${placeAddress}</p></div>
                      <div class="infowindow-sw-img">
                        <div class="infowindow-likes">${placeLikes} likes</div>
                        <div id="pano" class="infowindow-pano"></div>
                      </div>
                    </div>`
                );
                const panoramaOptions = {
                  position: nearStreetViewLocation,
                  pov: {
                    heading: heading,
                    pitch: 10
                  },
                  // scrollwheel: false,
                  disableDefaultUI: true
                  // clickToGo: false
                };
                const panorama = new google.maps.StreetViewPanorama(
                  document.getElementById("pano"),
                  panoramaOptions
                );
              } else {
                infowindow.setContent(
                  `<div class="infowindow-heading">
                      <h3 class="infowindow-title">${placeName ||
                        marker.title}</h3>
                    </div>
                    <div class="infowindow-content">
                      <img alt="${placeCategory}" class="infowindow-icon" src="${placeIcon}">
                      <p class="infowindow-category">${placeCategory}</p>
                      <div class="infowindow-address"><p>${placeAddress}</p></div>
                      <div class="infowindow-no-sw"><p class="infowindow-likes">${placeLikes} likes</p>
                      <p class="infowindow-no-sw-msg">No Street View Found</p></div>
                    </div>`
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
          })
          .catch(error => {
            console.log(error);
          });
        // end of Streetview codes
      })
      .catch(error => {
        infowindow.setContent(
          `<div class="infowindow-heading"><h3 class="infowindow-title">${
            marker.title
          }</h3></div><div class="infowindow-content">Data currently not available</div>`
        );
        console.log(error);
      });
    // end of fetch requests
  };

  // PLACELIST FUNCTIONS
  selectPlaceFromList = place => {
    const selectedMarker = this.state.allMarkers.find(
      marker => marker.id === place.id
    );
    this.handleActiveMarker(selectedMarker);
    // when an item is selected, close the menu if the viewport is small
    if (window.innerWidth < 550) {
      this.props.toggleMenu();
      // this.setState({
      //   query: ""
      // });
    }
  };

  selectLiWithKeyboard = cursor => {
    const allPlacesSorted = this.state.allPlaces.sort(sortBy("name"));
    const selectedPlace = allPlacesSorted[cursor];
    this.selectPlaceFromList(selectedPlace);
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
    // use the menu status to determine which class to attribute
    // to PlaceList and to the map
    const { menuOpen } = this.props;
    return (
      <main className="main-container">
        <PlaceList
          allPlaces={(this.state.query
            ? this.state.showingPlaces
            : this.state.allPlaces
          ).sort(sortBy("name"))}
          menuOpen={this.props.menuOpen}
          showingPlaces={this.state.showingPlaces}
          selectPlaceFromList={this.selectPlaceFromList}
          selectLiWithKeyboard={this.selectLiWithKeyboard}
          queryFilter={this.queryFilter}
          activeMarker={this.state.activeMarker}
          classList={
            menuOpen ? "place-list__container open" : "place-list__container"
          }
        />
        <div
          id="map"
          className={menuOpen ? "map__container drawer-open" : "map__container"}
        >
          <div ref="map" className="map" role="application">
            <p className="loading-msg">Loading map...</p>
          </div>
        </div>
      </main>
    );
  }
}
