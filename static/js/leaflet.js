$(function(){
    var lmap = L.map('leafletmap').setView([52.1, 5.5], 10);

    L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'examples.map-20v6611k'
    }).addTo(lmap);
    new L.Control.GeoSearch({
        provider: new L.GeoSearch.Provider.Google({
            region: ''
        })
    }).addTo(lmap);				
	
	
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
	
	
    d3.json("http://swapp.deltares.nl/db/measurements", function(data) {
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
                }).bindPopup("<b>Properties</b>" +
							"<br /> Date: " + date.toLocaleDateString() +
							"<br /> Time: " + date.toLocaleTimeString() + 
							"<br /> EC: " + feature.properties.electricalConductivity + " " + 
										String.fromCharCode(8486) + String.fromCharCode(215) + "m" +
							"<br /> Waterbody: " + feature.properties.waterbodyType + 	
							"<br /> Water state: " + feature.properties.waterState + 
							"<br /> Depth: " + feature.properties.observationDepth + 								
							"<br /> Water temp.: " + feature.properties.waterTemperature + String.fromCharCode(176));	
			
				marker.on('mouseover', function(f){
					info.update(feature)
				});
				
				marker.on('mouseout', function(f){
					info.reset(feature)
				});				
							
                return marker;
            }
		
			
        }).addTo(lmap);	
		
		
		// control that shows measurement info on hover
		var info = L.control({position: 'topleft'});

		info.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'info');
			this._div.innerHTML = "<h4>Hover over a measurement</h4>";					
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
		
		info.addTo(lmap);		
		
	
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

		legend.addTo(lmap);
    });				
	
});