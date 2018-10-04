import React, { Component } from "react";
import ReactDOM from "react-dom";
import escapeRegExp from "escape-string-regexp";
import sortBy from "sort-by";

import PlaceList from "./PlaceList.js";
import neighborhoodData from "./Neighborhood-Places.js";
import mapStyle from "./MapStyle.js";

// Import Foursquare keys from environment variables
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
    query: "" // query from the search bars
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
      this.map = new maps.Map(node, {
        center: this.state.neighborhood,
        zoom: 15,
        styles: mapStyle,
        mapTypeId: "roadmap"
      });
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

  // Function used to clear the currently active marker and to set a new one.
  // Can also be used to set activeMarker to null if called passing "null" as argument,
  // in which case only the first part of the function runs
  handleActiveMarker = marker => {
    const { google } = this.props;
    const defaultIcon = this.makeMarkerIcon("AED8E5");
    const activeIcon = this.makeMarkerIcon("10637c");
    // Set to default icon previously selected marker, if any.
    if (
      this.state.activeMarker !== null &&
      this.state.activeMarker !== marker
    ) {
      this.state.activeMarker.setIcon(defaultIcon);
    }
    // If a valid marker is passed, set it to activeMarker
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

  // Function to make custon marker icons (2 types used for default and active)
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
    // Storing the infowindow in the state beforehand allows to open it
    // for the first time even with no internet
    const infowindow = this.state.googleInfowindow;
    // If there's an open infowindow in the state, close it.
    if (this.state.infowindow !== null) {
      this.state.infowindow.close();
    }
    // Add a listener to close the infowindow and reset the active marker
    infowindow.marker = marker;
    infowindow.addListener("closeclick", () => {
      const defaultIcon = this.makeMarkerIcon("AED8E5");
      marker.setIcon(defaultIcon);
      this.setState({
        infowindow: null,
        activeMarker: null
      });
    });
    // Store the current infowindow in the state
    this.setState({
      infowindow: infowindow
    });
    // Set temporary content for the infowindow while the data is loading
    infowindow.setContent(`<div>Loading data...</div>`);
    // Fetch the data
    this.fetchData(marker, infowindow);
    // Open the infowindow
    infowindow.open(this.map, marker);
  };

  fetchData = (marker, infowindow) => {
    // constants needed for the fetch request
    const clientID = FSQ_CLIENTID;
    const clientSecret = FSQ_CLIENTSECRET;
    const lat = neighborhoodData.neighborhoodLoc.lat;
    const lng = neighborhoodData.neighborhoodLoc.lng;

    // Data that will be fetched, to be used for the infowindow template
    let placeName = null;
    let placeIcon = null;
    let placeAddress = null;
    let placeCategory = null;
    let placeLikes = null;
    let panoContent = "";

    // Fetch the venue ID, store the info of the place in a variable
    fetch(
      `https://api.foursquare.com/v2/venues/search?ll=${lat},${lng}&v=20180518&query=${
        marker.title
      }&limit=1&client_id=${clientID}&client_secret=${clientSecret}`
    )
      // Handle the response
      .then(response => {
        if (response.ok) {
          return response.json();
        } else {
          Promise.reject("Error when getting venue details");
        }
      })
      // Set all the variables previously defined that will be needed in the infowindow template
      .then(data => {
        const venueID = data.response.venues[0].id;
        const placeInfo = data.response.venues[0];
        placeName = placeInfo.name;
        placeIcon = `${placeInfo.categories[0].icon.prefix}32${
          placeInfo.categories[0].icon.suffix
        }`;
        placeAddress = placeInfo.location.formattedAddress.join("</p><p>");
        placeCategory = placeInfo.categories[0].name;
        // Fetch the likes and store them in a variable
        fetch(
          `https://api.foursquare.com/v2/venues/${venueID}/likes?v=20180518&client_id=${clientID}&client_secret=${clientSecret}`
        )
          // Handle the response
          .then(response => {
            if (response.ok) {
              return response.json();
            } else {
              Promise.reject("Error when getting venue details");
            }
          })
          .then(data => {
            placeLikes = data.response.likes.count;
          })
          // Get streetview and set the infowindow content
          .then(() => {
            const { google } = this.props;
            const streetViewService = new google.maps.StreetViewService();
            const radius = 50;
            // In case the panoramic is found and the status is OK,
            // compute the position of the streetview image, then calculate the heading,
            // then get a panorama from that and set the options
            function getStreetView(data, status) {
              if (status === google.maps.StreetViewStatus.OK) {
                const nearStreetViewLocation = data.location.latLng;
                const heading = google.maps.geometry.spherical.computeHeading(
                  nearStreetViewLocation,
                  marker.position
                );
                // Set the panorama content with the data from Foursquare and the streetview as img
                panoContent = `<div class="infowindow-sw-img">
                <div class="infowindow-likes infowindow-likes-sw">${placeLikes} likes</div><div id="pano" class="infowindow-pano"></div></div>`;
                infowindow.setContent(
                  `<div class="infowindow-heading">
                      <h3 class="infowindow-title">${placeName}</h3>
                    </div>
                    <div class="infowindow-content">
                      <img alt="${placeCategory}" class="infowindow-icon" src="${placeIcon}">
                      <p class="infowindow-category">${placeCategory}</p>
                      <div class="infowindow-address"><p>${placeAddress}</p></div>
                      ${panoContent}
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
                // If there's no streetview available, show the rest of the info and a
                // "Streetview not available" message
                panoContent = `<div class="infowindow-no-sw"><p class="infowindow-likes">${placeLikes} likes</p><p class="infowindow-no-sw-msg">No Street View Found</p></div>`;
                infowindow.setContent(
                  `<div class="infowindow-heading">
                      <h3 class="infowindow-title">${placeName}</h3>
                    </div>
                    <div class="infowindow-content">
                      <img alt="${placeCategory}" class="infowindow-icon" src="${placeIcon}">
                      <p class="infowindow-category">${placeCategory}</p>
                      <div class="infowindow-address"><p>${placeAddress}</p></div>  
                    ${panoContent}
                    </div>`
                );
              }
            }
            // Use streetview service to get the closest streetview image within
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
      // Handle error from fetch request to display an infowindow
      // with the place title and an error msg only
      .catch(error => {
        infowindow.setContent(
          `<div class="infowindow-heading"><h3 class="infowindow-title">${
            marker.title
          }</h3></div><div class="infowindow-no-fsq-msg">Data currently not available</div>`
        );
        console.log(
          `There could be a problem with your internet connection (${error})`
        );
      });
    // end of fetch requests
  };

  // PLACELIST FUNCTIONS

  // Search for the marker related to the list item, then call function
  // to set that marker as active
  selectPlaceFromList = place => {
    const selectedMarker = this.state.allMarkers.find(
      marker => marker.id === place.id
    );
    this.handleActiveMarker(selectedMarker);
    // When an item is selected, close the menu if the viewport is small
    // and the menu is taking up 100% of its width
    if (window.innerWidth < 550) {
      this.props.toggleMenu();
    }
  };

  // In case a place was selected through the listbox with the arrowkeys,
  // get all the places, sort them and get the selected place by its index
  // (which matches the cursor), then call another function to handle the selection
  // from the listbox
  selectLiWithKeyboard = cursor => {
    const showingPlacesSorted = this.state.showingPlaces.sort(sortBy("name"));
    const selectedPlace = showingPlacesSorted[cursor];
    this.selectPlaceFromList(selectedPlace);
  };

  // Filter the places/marker based on the input in the searchbar
  queryFilter = query => {
    // Close the infowindow if there is one open
    if (this.state.infowindow) {
      this.state.infowindow.close();
    }
    // Variable to filter places and markers
    const match = new RegExp(escapeRegExp(query), "i");
    // Deselect any currently active marker/infowindow, set the query value,
    // and change showingPlaces
    this.setState({
      activeMarker: null,
      infowindow: null,
      query: query,
      // filter the places
      showingPlaces: this.state.allPlaces.filter(place =>
        match.test(place.name)
      )
    });
    // Filter the markers and show/hide them
    this.state.allMarkers.forEach(marker => {
      return match.test(marker.title)
        ? marker.setVisible(true)
        : marker.setVisible(false);
    });
    // By passing "null" into this function,
    // the currently selected marker will go back to the default icon
    this.handleActiveMarker(null);
  };

  clearQuery = () => {
    // Close any open infowindow
    if (this.state.infowindow) {
      this.state.infowindow.close();
    }
    // Make all the markers reappear on the map
    this.state.allMarkers.forEach(marker => marker.setVisible(true));
    this.handleActiveMarker(null);
    // Reset query and any active marker/infowindow.
    // Set the showing places to all places
    this.setState({
      activeMarker: null,
      infowindow: null,
      query: "",
      showingPlaces: this.state.allPlaces
    });
  };

  render() {
    // use the menu status to determine which class to attribute
    // to PlaceList and to the map
    const { menuOpen } = this.props;
    const { query, showingPlaces, allPlaces, activeMarker } = this.state;
    const { neighborhood, city } = neighborhoodData.names;
    return (
      <main className="main-container">
        <PlaceList
          neighborhoodName={neighborhood}
          cityName={city}
          allPlaces={(query ? showingPlaces : allPlaces).sort(sortBy("name"))}
          menuOpen={menuOpen}
          showingPlaces={showingPlaces}
          activeMarker={activeMarker}
          selectPlaceFromList={this.selectPlaceFromList}
          selectLiWithKeyboard={this.selectLiWithKeyboard}
          query={query}
          queryFilter={this.queryFilter}
          clearQuery={this.clearQuery}
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
