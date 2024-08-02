// This code creates the autocomplete feature of the search bar
var searchInput = 'search_input';
 
$(document).ready(function () {
 var autocomplete;
 autocomplete = new google.maps.places.Autocomplete((document.getElementById(searchInput)), {
  types: ['geocode'],
 });
  
 google.maps.event.addListener(autocomplete, 'place_changed', function () {
  var near_place = autocomplete.getPlace();
 });
});