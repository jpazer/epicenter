"use strict";

var map;
var geocoder;
var url = "http://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&eventtype=earthquake";
var markers = [];
var circles = [];
var infowindow;
var coordinates = [47.763088, -147.076450];
var radius = 2000;
var loading;


function initMap() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: {lat:coordinates[0], lng: coordinates[1]},
    zoom:4,
    minZoom: 3
  });


  geocoder = new google.maps.Geocoder();

  document.getElementById('submit-button').onclick = function(){
    geocodeAddress();
  };
  document.getElementById('radius').onchange = function(e){
    document.getElementById('radius-results').innerHTML = e.target.value;
    radius = e.target.value;
    searchEarthquakes();
  };

  loading = document.querySelector("#loading");



  searchEarthquakes();

}

function searchEarthquakes(){
  clearCircles();
  url += "&latitude="+coordinates[0]+"&longitude="+coordinates[1]+"&maxradiuskm="+radius;
  console.log(coordinates);

 
 
 //set the zoom level
 var circle = new google.maps.Circle({
    center: {lat:coordinates[0], lng:coordinates[1]},
    radius: radius * 1000,
  });
  map.fitBounds(circle.getBounds());
  map.setCenter({lat:coordinates[0], lng:coordinates[1]});

  loading.style.visibility = 'visible';

  $.ajax({
    dataType: "json",
    url: url,
    data: null,
    success: jsonLoaded
  });
}

function jsonLoaded(obj){
  var allFeatures = obj.features;
  var lat;
  var lng;
  var mag;
  var title;
  for (var i=0; i<allFeatures.length; i++){
    lat = allFeatures[i].geometry.coordinates[1];
    lng = allFeatures[i].geometry.coordinates[0];
    mag = allFeatures[i].properties.mag;
    title = allFeatures[i].properties.place;
    
    addCircle(lat, lng, mag, title);
  }

  loading.style.visibility = 'hidden';
}

function geocodeAddress(){
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
  // //close inforwindow if it exists
  if(infowindow) infowindow.close();
  msg= mag+   "<br>" +" Magnitude: " + msg;
  //make a new infowindow
  infowindow = new google.maps.InfoWindow({
    map: map,
    position: position,
    content: "<b>" + msg + "</b>"
  });
}

function clearCircles(){
  //close infowindow if it exists
  if (infowindow) infowindow.close();
  for(var i=0; i< circles.length; i++){
    circles[i].setMap(null);
  }
  circles = [];
}