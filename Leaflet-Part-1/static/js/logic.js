// Store our API endpoint as queryUrl.
var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

// Perform a GET request to the query URL.
d3.json(queryUrl).then(function(data) {
  // Once we get a response, send the data.features object to the createFeatures function.
  createFeatures(data.features);
});

function createFeatures(earthquakeData) {

  // Define a function to run once for each feature in the features array.
  // Give each feature a popup describing the place and time of the earthquake.
  function onEachFeature(feature, layer) {
    layer.bindPopup("<h3>" + feature.properties.place +
      "</h3><hr><p>" + new Date(feature.properties.time) + "</p>" +
      "<p>Magnitude: " + feature.properties.mag + "</p>" +
      "<p>Depth: " + feature.geometry.coordinates[2] + " km</p>");
  }

  // Define function to create circle markers with appropriate style based on magnitude and depth.
  function pointToLayer(feature, latlng) {
    return L.circleMarker(latlng, {
      radius: markerSize(feature.properties.mag),
      fillColor: markerColor(feature.geometry.coordinates[2]),
      color: "#000",
      weight: 1,
      opacity: 1,
      fillOpacity: 0.8
    });
  }

  // Create a GeoJSON layer containing the features array on the earthquakeData object.
  // Run the onEachFeature function once for each piece of data in the array.
  var earthquakes = L.geoJSON(earthquakeData, {
    pointToLayer: pointToLayer,
    onEachFeature: onEachFeature
  });

  // Send our earthquakes layer to the createMap function.
  createMap(earthquakes);
}

// Create the map and layers.
function createMap(earthquakes) {

  // Define streetmap and darkmap layers.
  var streetmap = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "© OpenStreetMap contributors"
  });

  var darkmap = L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
    attribution: "© OpenStreetMap contributors"
  });

  // Define a baseMaps object to hold our base layers.
  var baseMaps = {
    "Street Map": streetmap,
    "Dark Map": darkmap
  };

  // Create overlay object to hold our overlay layer.
  var overlayMaps = {
    Earthquakes: earthquakes
  };

  // Create our map, giving it the streetmap and earthquakes layers to display on load.
  var myMap = L.map("map", {
    center: [37.09, -95.71],
    zoom: 5,
    layers: [streetmap, earthquakes]
  });

  // Create a layer control.
  // Pass in our baseMaps and overlayMaps.
  // Add the layer control to the map.
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(myMap);

  // Add a legend to the map.
  var legend = L.control({position: 'bottomright'});

  legend.onAdd = function (map) {
    var div = L.DomUtil.create('div', 'info legend'),
        depth = [-10, 10, 30, 50, 70, 90],
        labels = [];

    // Loop through depth intervals and generate a label with a colored square for each interval.
    for (var i = 0; i < depth.length; i++) {
      div.innerHTML +=
          '<i style="background:' + markerColor(depth[i] + 1) + '"></i> ' +
          depth[i] + (depth[i + 1] ? '&ndash;' + depth[i + 1] + '<br>' : '+');
    }
    return div;
  };

  legend.addTo(myMap);
}

// Function to determine marker size based on earthquake magnitude.
function markerSize(magnitude) {
  return magnitude * 4;
}

// Function to determine marker color based on depth.
function markerColor(depth) {
  switch (true) {
    case depth > 90:
      return "#ff5f65";
    case depth > 70:
      return "#fca35d";
    case depth > 50:
      return "#fdb72a";
    case depth > 30:
      return "#f7db11";
    case depth > 10:
      return "#dcf400";
    default:
      return "#a3f600";
  }
}

