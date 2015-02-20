// uses chart.js
var map;
$(function(){
    var endPoint = "http://swapp.deltares.nl/db/measurements";
    map = L.map('leafletmap').setView([52.1, 5.5], 10);

    var layer = L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Data: <a href="http://swapp.deltares.nl/info">SWAPP</a>.  Background map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'examples.map-20v6611k'
    }).addTo(map);
    new L.Control.GeoSearch({
        provider: new L.GeoSearch.Provider.Google({
            region: ''
        })
    }).addTo(map);				
    
    
    function getColor(d) {
	return d > 1750 ? '#800026' :
	    d > 1500 ? '#BD0026' :
	    d > 1250  ? '#E31A1C' :
	    d > 1000  ? '#FC4E2A' :
	    d > 750   ? '#FD8D3C' :
	    d > 500   ? '#FEB24C' :
	    d > 250   ? '#FED976' :
	    '#FFEDA0';
    }		
    

    var locationFilter = new L.LocationFilter().addTo(map);
    L.easyButton('fa-download', 
                 function (){
                     var href = '';
                     if (locationFilter.isEnabled()) {
                         query = generateAreaQuery(locationFilter.getBounds());
                         href = endPoint + ".csv" + "?limit=0&query=" + JSON.stringify(query);
                     } else {
                         href = endPoint + ".csv?limit=0";
                     }
                     window.location.href = href;
                 },
                 ''
                );

    var attribution =  L.control.attribution();
    attribution.addAttribution('swappy');
    L.easyButton('fa-info-circle', 
                 function (){
                     window.location.href = 'http://swapp.deltares.nl/info.html';
                 },
                 ''
                );


    
    d3.json(endPoint + "?limit=0", function(data) {
        var features = [];
        data.objects.forEach(function(x){			
            features.push(x.data);
        });
	
        var geojson = {							
            "type": "FeatureCollection",			
            "features": features				
        };		
	
        var coorsLayer = L.geoJson(geojson, {				
	    
            pointToLayer: function (feature, latlng) {
		
		var date = new Date(feature.properties.dateTime);
		
                var marker = L.circleMarker(latlng, {
		    
                    radius: 10,
		    color: 'black', 
                    fillColor: getColor(feature.properties.electricalConductivity),
                    weight: 1,
                    opacity: 1,
                    fillOpacity: 1
                });
		
                marker.on('click', function(e){
		    info.update(feature);
                    console.log(e);
                    var coordinate = e.target.feature.geometry.coordinates;
                    var query = generateQuery(coordinate);
                    console.log(query);
                    d3.json(endPoint + "?limit=0&query="+JSON.stringify(query), function(data){
                        var records = [];
                        console.log(data);
                        for (var i = 0, l = data.objects.length; i < l; i++) {
                            records.push({
                                x: Number(new Date(data.objects[i].data.properties.dateTime)), 
                                y: data.objects[i].data.properties.electricalConductivity

                            });
                        }
                        console.log(records);
                        addChart(records);
                        var chart = d3.select('#chart');
                        chart.classed({'visible': true});
                        var map = d3.select('#leafletmap');
                        map.classed({'shrunken': true});
                    });
                });
		
                return marker;
            }
	    
	    
        }).addTo(map);	
	
	
	// control that shows measurement info on hover
	var info = L.control({position: 'topleft'});

	info.onAdd = function (map) {
	    this._div = L.DomUtil.create('div', 'info');
            this._div.innerHTML = '<h4>Measurement information</h4>' + 
                "no selection"; 
	    
	    return this._div;
	};

	info.update = function (f) {
	    
	    var date = new Date(f.properties.dateTime);
	    
	    this._div.innerHTML = '<h4>Measurement information</h4>' + 
		"Date: " + date.toLocaleDateString() +
		"<br /> Time: " + date.toLocaleTimeString() + 
		"<br /> EC: " + f.properties.electricalConductivity + " " + 
		String.fromCharCode(8486) + String.fromCharCode(215) + "m" +
		"<br /> Waterbody: " + f.properties.waterbodyType + 	
		"<br /> Water state: " + f.properties.waterState + 
		"<br /> Depth: " + f.properties.observationDepth + 								
		"<br /> Water temp.: " + f.properties.waterTemperature + String.fromCharCode(176);				
	};

	info.reset = function (f) {			
	    this._div.innerHTML = "<h4>Hover over a measurement</h4>";				
	};
	
	info.addTo(map);		
	
	
	var legend = L.control({position: 'topright'});

	legend.onAdd = function (map) {

	    var div = L.DomUtil.create('div', 'info legend'),				
	 grades = [0, 250, 500, 750, 1000, 1250, 1500, 1750],
	 labels = [],
	 from, to;

	    labels.push("<b>EC (" + String.fromCharCode(8486) + String.fromCharCode(215) + "m)</b>");
	    
	    for (var i = 0; i < grades.length; i++) {
		from = grades[i];
		to = grades[i + 1];

		labels.push(
		    '<i style="background:' + getColor(from + 1) + '"></i> ' +
			from + (to ? '&ndash;' + to : '+'));
	    }

	    div.innerHTML = labels.join('<br>');
	    return div;
	};

	legend.addTo(map);
    });				
    
});