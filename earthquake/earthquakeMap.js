/* earthquakeMap.js
 * author: jasmine pazer
 * last update: 10/13/16
 */


'use strict';

//////VARIABLES//////

var map, geocoder, infowindow, loading;
var url = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventtype=earthquake";
var markers = [];
var circles = [];
var coordinates = [47.763088, -147.076450];
var radius = 2000;

///////FUNCTIONS////////


function initMap() {
/*Initilize variables and events*/
    
    geocoder = new google.maps.Geocoder();
    loading = document.querySelector("#loading");
    
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: coordinates[0], lng: coordinates[1]},
        zoom: 4,
        minZoom: 3
    });
    
    //events
    document.getElementById('submit-button').onclick = function () {
        geocodeAddress();
    };
    document.getElementById('radius').onchange = function (e) {
        document.getElementById('radius-results').innerHTML = e.target.value;
        radius = e.target.value;
        searchEarthquakes();
    };
   
    searchEarthquakes(); //start 
}

function searchEarthquakes() {
/*gets earthquake information from USGS for the specified area*/
    
    clearCircles();//clear previous results
    loading.style.visibility = 'visible';//show that its loading new info

    //set the zoom level
    var circle = new google.maps.Circle({
        center: {lat: coordinates[0], lng: coordinates[1]},
        radius: radius * 1000
    });
    map.fitBounds(circle.getBounds());
    map.setCenter({lat: coordinates[0], lng: coordinates[1]});
    
    //send data request
    url += "&latitude=" + coordinates[0] + "&longitude=" + coordinates[1] + "&maxradiuskm=" + radius;
    $.ajax({
        dataType: "json",
        url: url,
        data: null,
        success: jsonLoaded
    });
}

function jsonLoaded(obj) {
/*Callback for USGS earthquake data request, puts returned data on the map*/
    
    var allFeatures, lat, lng, mag, title;
    allFeatures = obj.features;
    
    //add each earthquake to the map
    for (var i=0; i<allFeatures.length; i++){
        lat = allFeatures[i].geometry.coordinates[1];
        lng = allFeatures[i].geometry.coordinates[0];
        mag = allFeatures[i].properties.mag;
        title = allFeatures[i].properties.place;

        addCircle(lat, lng, mag, title);
    }
    
    loading.style.visibility = 'hidden';//get rid of loading text
}

function geocodeAddress(){
/*Lets you search for areas to display earthquakes by name*/
    
    var address = document.getElementById('location-input').value;
    
    geocoder.geocode({'address': address}, function(results, status){
        if (status == google.maps.GeocoderStatus.OK){
            map.setCenter(results[0].geometry.location);
            coordinates = [results[0].geometry.location.lat(), results[0].geometry.location.lng()];
            radius = 1000;
            document.getElementById('radius').value = radius;
            document.getElementById('radius-results').innerHTML = radius;
            searchEarthquakes();
        }else{
          alert('geocode was not sucessful for the folowing reason: ' + status);
        }
    });
}


function addCircle(latitude, longitude, mag, title){
/*Draws a circle on the map at location of earthquake and radius is determined by magnitude*/
    
    var position = {lat:latitude, lng:longitude};
    var circle = new google.maps.Circle({
        fillColor: "hsl(0,100%,"+(10-mag)*10+"%)",
        fillOpacity: 0.5,
        strokeWeight: 0,
        center: position,
        radius: mag*10000,
        map:map
    });
    
    //add listener for click event
    google.maps.event.addListener(circle, 'click',function(e){
        makeInfoWindow(position, title, mag);
    });
    
    circles.push(circle);
}

function makeInfoWindow(position, mag, msg){
/*Displays an info window based on what was clicked*/
    
    //close inforwindow if it exists
    if(infowindow) infowindow.close();
    
    msg = mag + "<br>" + " Magnitude: " + msg;
    //make a new infowindow
    infowindow = new google.maps.InfoWindow({
        map: map,
        position: position,
        content: "<b>" + msg + "</b>"
    });
}

function clearCircles(){
/*Clear all circles that were drawn on the map before*/
    
    //close infowindow if it exists
    if (infowindow) infowindow.close();
    
    for(var i=0; i< circles.length; i++){
        circles[i].setMap(null);
    }
    circles = [];
}
