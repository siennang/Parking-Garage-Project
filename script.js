// On page load, set the search input value to the value stored in localStorage
$(document).ready(function() {
    var searchValue = localStorage.getItem('searchValue');
    if (searchValue) {
        $('#search_input').val(searchValue);
    }
});

// When the user types in the search bar, store the value in localStorage
// Local Storage is a property that allows user input to be saved and remembered even if they navigate to another page
$('#search_input').on('input', function() {
    localStorage.setItem('searchValue', $(this).val());
});
