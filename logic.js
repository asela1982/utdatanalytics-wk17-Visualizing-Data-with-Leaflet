// API link to fetch our geojson data of earthquakes
var APIlink_earthquakes = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

// API link to fetch our geojson data of earthquakes
var APIlink_plates = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"


// define a function to scale the magnitdue
function markerSize(magnitude) {
    return magnitude * 5;
};


var earthquakes = new L.LayerGroup();

// perform a GET request to the query URL: APIlink_earthquakes
d3.json(APIlink_earthquakes, function (geoJson) {
    // once we get a response, send the geoJson.features array of objects object to the createFeatures function

    L.geoJSON(geoJson.features, {
        // using the pointToLayer option to create a CircleMarker
        // By default simple markers are drawn for GeoJSON Points. We can alter this by passing a pointToLayer 
        // function in a GeoJSON options object when creating the GeoJSON layer
        pointToLayer: function (geoJsonPoint, latlng) {
            return L.circleMarker(latlng, { radius: markerSize(geoJsonPoint.properties.mag) });
        },

        style: function (geoJsonFeature) {
            return {
                fillColor: chooseColor(geoJsonFeature.properties.mag),
                fillOpacity: 0.7,
                weight: 0.1,
                color: 'black'

            }
        },

        onEachFeature: function (feature, layer) {
            // Giving each feature a pop-up with information pertinent to it
            layer.bindPopup("<h3 style='text-align:center;'>" + feature.properties.type + "</h3> <hr> <h3 style='text-align:center;'>" + feature.properties.title + "</h3>");
        }

    }).addTo(earthquakes);

});


// create a layer group for faultlines
var plateBoundary = new L.LayerGroup();

// perform a GET request to the query URL: APIlink_plates
d3.json(APIlink_plates, function (geoJson) {
    // once we get a response, send the geoJson.features array of objects object to the L.geoJSON method
    L.geoJSON(geoJson.features,{
        style: function (geoJsonFeature) {
            return {
                weight: 1,
                color: 'blue'
            }
        },
    }).addTo(plateBoundary);
})



// define a function to return a color based on the magnitude
function chooseColor(magnitude) {
    if (magnitude > 5) {
        return 'red'
    } else if (magnitude > 4) {
        return 'orange'
    } else if (magnitude > 3) {
        return 'yellow'
    } else if (magnitude > 2) {
        return 'blue'
    } else if (magnitude > 1) {
        return 'green'
    } else {
        return '#58C9CB'
    }
};


// define a function to create the map
function createMap() {

    // define street map and dark map
    var streetMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: 'pk.eyJ1IjoiYXNlbGExOTgyIiwiYSI6ImNqZDNocXRlNTBoMWEyeXFmdWY1NnB2MmIifQ.ziEOjgHun64EAp4W3LlsQg'
    });

    var darkMap = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.dark',
        accessToken: 'pk.eyJ1IjoiYXNlbGExOTgyIiwiYSI6ImNqZDNocXRlNTBoMWEyeXFmdWY1NnB2MmIifQ.ziEOjgHun64EAp4W3LlsQg'
    });


    var satellite = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.satellite',
        accessToken: 'pk.eyJ1IjoiYXNlbGExOTgyIiwiYSI6ImNqZDNocXRlNTBoMWEyeXFmdWY1NnB2MmIifQ.ziEOjgHun64EAp4W3LlsQg'
    });


    // define a baselayer object to hold our base layer objects
    var baseLayers = {
        "Street": streetMap,
        "Dark": darkMap,
        "Satellite": satellite
    };

    // define a overlay object to hold our overlay layer objects
    var overlays = {
        "Earthquakes": earthquakes,
        "Plate Boundaries": plateBoundary,
    };

    // initialize the map on the "mymap" div with a given center and zoom
    mymap = L.map('mymap', {
        center: [30,0],
        zoom: 2,
        layers: [streetMap, earthquakes]
    })

    // Creates an attribution control with the given layers. 
    // Base layers will be switched with radio buttons, while overlays will be switched with checkboxes. 
    // Note that all base layers should be passed in the base layers object, but only one should be added 
    // to the map during map instantiation
    L.control.layers(baseLayers, overlays).addTo(mymap);


    // Create the legend control
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            magnitude = [0, 1, 2, 3, 4, 5],
            labels = [];

            div.innerHTML += "<h4 style='margin:4px'>Magnitude</h4>"
        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < magnitude.length; i++) {
            div.innerHTML +=
                '<i style="background:' + chooseColor(magnitude[i] + 1) + '"></i> ' +
                magnitude[i] + (magnitude[i + 1] ? '&ndash;' + magnitude[i + 1] + '<br>' : '+');
            console.log(div.innerHTML)

        }

        return div;
    };
    legend.addTo(mymap);
}

// call the create map function
createMap()