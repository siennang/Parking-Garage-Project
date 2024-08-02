// On page load for search.html, set the search input value to the value stored in localStorage
$(document).ready(function() {
    var searchValue = localStorage.getItem('searchValue');
    if (searchValue) {
        $('#search_input').val(searchValue);
    }
});

// When the user types in the search bar in search.html, store the value in localStorage
// Local Storage is a property that allows user input to be saved and remembered even if they navigate to another page
$('#search_input').on('input', function() {
    localStorage.setItem('searchValue', $(this).val());
});

// Extract search query from URL 
var urlParams = new URLSearchParams(window.location.search);
var searchQuery = urlParams.get("search");

// Function initMap creates a google map 
function initMap() {
    // Initializes default center location to NYC
    var myMapCenter = { lat: 40.785091, lng: -73.968285 };
    var map = new google.maps.Map(document.getElementById('map'), {
      center: myMapCenter,
      zoom: 14
    });
// Grabs refrences to the search_input and search_button HTML elements
    var searchInput = document.getElementById('search_input');
    var searchButton = document.getElementById('search_button');
// An event listener is added to the search button, when clicked it captures
// the current value of search_input and triggers searchParkingGarages function
// to find parking garages based on the input value and display them on the map
    searchButton.addEventListener('click', function () {
      var searchQuery = searchInput.value;
      searchParkingGarages(searchQuery, map);
    });
  }

// Function searchParkingGarages takes the searchQuery param and uses googles
// geocoder service to convert it into geographical coordinates
function searchParkingGarages(searchQuery, map) {
    // Geocode the user's input to get the coordinates
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({ address: searchQuery }, function (results, status) {
        if (status === google.maps.GeocoderStatus.OK && results.length > 0) {
            var location = results[0].geometry.location;

        // After getting the geographic coordinates, it creates bounding box around that point to refine
        // the area for the next search. 0.05 values used here mean that the bounding box will be a rectangle
        // extending 0.05 degrees of latitude and longitude
            var bounds = new google.maps.LatLngBounds(
                new google.maps.LatLng(location.lat() - 0.05, location.lng() - 0.05),
                new google.maps.LatLng(location.lat() + 0.05, location.lng() + 0.05)
            );

        // Processes the results, any markers present on the map are cleared by clearMarkers() function
        // It then goes through each parking garages it finds and creates a marker using createMarker() function
        // Then, the maps center is set to the location of the first result, providing a centralized view
            var service = new google.maps.places.PlacesService(map);
            service.textSearch({
                query: 'parking garages',
                bounds: bounds,
                fields: ['name', 'geometry', 'opening_hours', 'open_now'],
            }, function (results, status) {
                if (status === google.maps.places.PlacesServiceStatus.OK) {
                    clearMarkers();
                    for (var i = 0; i < results.length; i++) {
                        createMarker(results[i], map);
                    }
                    if (results.length > 0) {
                        map.setCenter(results[0].geometry.location);
                    }
                    // AJAX: Send results to the PHP script:
                    $.post("search.php", { data: results }, function(response) {
                        if (response.status === 'success') {
                            alert("Data saved successfully!");
                        } else {
                            alert("Error saving data: " + response.message);
                        }
                    });
                }
            });
        } else {
            alert('Geocode was not successful for the following reason: ' + status);
        }
    });
}


// Marker array that will hold all the markers
var markers = [];
// initializing an variable that will hold the value of the opened window
var currentInfoWindow = null;

// creating a marker for each parking space 
// For every place that is returned in the search, a marker is created
// at its location on the map.
function createMarker(place, map) {
  var marker = new google.maps.Marker({
    map: map,
    position: place.geometry.location,
    title: place.name
  });
  // push a new marker into the array 
  markers.push(marker);

  // After creating the markers and pushing them into the array, details about
  // each location is then fetched by google maps places service.
  var service = new google.maps.places.PlacesService(map);
  // using getDetails method to grab details
  service.getDetails(
    {
      placeId: place.place_id,
      fields: ['opening_hours']
    },
    function (placeResult, status) {
    // If the results are retrieved successfully, then there will be a info window created
    // for the location. 
      if (status === google.maps.places.PlacesServiceStatus.OK) {
        var isOpenNow = place.open_now ? "Open Now" : "Closed";
        var infowindow = new google.maps.InfoWindow({
          content:
            '<strong>' +
            place.name +
            '</strong><br>' +
            place.isOpenNow + 
            '</strong><br>' +
            (placeResult.opening_hours
              ? placeResult.opening_hours.weekday_text.join('<br>')
              : 'Opening hours not available')
        });
        // An eventListener is added to the marker, so when it is clicked its associated
        // info window opens, and any windows previously opened will be closed
        marker.addListener('click', function () {
          // Close the current info window if one is open
          if (currentInfoWindow) {
            currentInfoWindow.close();
          }
          // Open the clicked marker's info window
          infowindow.open(map, marker);
          // Set the current info window as the newly opened one
          currentInfoWindow = infowindow;
        });
      }
    }
  );
}

//Function to clear markers before displaying new search results
function clearMarkers() {
  for (var i = 0; i < markers.length; i++) {
    markers[i].setMap(null);
  }
  markers = [];
}
