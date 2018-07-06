var map = null;

function displayLocation() {
    navigator.geolocation.getCurrentPosition(getLocation, locationError);
}

function getLocation(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;
    var todoItem = todos[todos.length - 1];
    todoItem.latLong = [latitude.toFixed(5), longitude.toFixed(5)];
    // remember to display and save the todo item!
    saveTodoItem(todoItem);
    addTodoToPage(todoItem);

    if (!map) {
        showMap(latitude, longitude);
    }
    addMarker(latitude, longitude);
}

function showMap(latitude, longitude) {
    var googleLatLong = new google.maps.LatLng(latitude, longitude);
    var mapOptions = {
        zoom: 12,
        center: googleLatLong,
        mapTypeId: google.maps.MapTypeId.ROADMAP
    };
    var mapDiv = document.getElementById("map");
    mapDiv.style.display = "block";  // unhide the map div
    map = new google.maps.Map(mapDiv, mapOptions);
    map.panTo(googleLatLong);
}

function addMarker(latitude, longitude) {
    var googleLatLong = new google.maps.LatLng(latitude, longitude);
    var markerOptions = {
        position: googleLatLong,
        map: map,
        title: latitude + ", " + longitude
    };
    var marker = new google.maps.Marker(markerOptions);
}

function locationError(error) {
    var errorTypes = {
        0: "Unkown error",
        1: "Permission denied by user",
        2: "Position not available",
        3: "Request timed out"
    };
    var errorMessage = errorTypes[error.code];
    if (error.code == 0 || error.code == 2) {
        errorMessage += " " + error.message;
    }
    console.log(errorMessage);
    alert(errorMessage);
}

function buildTodoStr(todoItem, daysLeft) {
    // construct a todo description containing location information
    var todoStr = "(" + todoItem.latLong[0] + ", " + todoItem.latLong[1]
                  + ") " + todoItem.who + " needs to " + todoItem.task
                  + " by " + todoItem.dueDate + " " + daysLeft;
    return todoStr;
}
