// uses chart.js
var map;
$(function(){
    var endPoint = "http://swapp.deltares.nl/db/measurements";
    map = L.map('leafletmap').setView([52.1, 5.5], 10);

    var layer = L.tileLayer('https://{s}.tiles.mapbox.com/v3/{id}/{z}/{x}/{y}.png', {
        maxZoom: 18,
        attribution: 'Data: <a href="https://publicwiki.deltares.nl/display/ZOETZOUT/SWAPP" target="_blank">SWAPP</a>.\
			Background map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
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
	return d > 25 ? 'rgb(130,0,0)' :
	    d > 10 ? 'rgb(253,1,0)' :
	    d > 7  ? 'rgb(249,164,73)' :
	    d > 4  ? 'rgb(255,254,3)' :
	    d > 3   ? 'rgb(2,255,2)' :
	    d > 2   ? 'rgb(77, 223, 238)' :
	    d > 0.8   ? 'rgb(0,0,254)' :
	    'rgb(2,1,80)';
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
					window.open('https://publicwiki.deltares.nl/display/ZOETZOUT/SWAPP', '_blank');
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
					
                    var coordinate = e.target.feature.geometry.coordinates;
                    var query = generateQuery(coordinate);
                    console.log(query);
                    d3.json(endPoint + "?limit=0&query="+JSON.stringify(query), function(data){
                        var records = [];
                        console.log(data);
                        for (var i = 0, l = data.objects.length; i < l; i++) {
                            var properties = data.objects[i].data.properties;
                            var record = {
                                date: Number(new Date(properties.dateTime)), 
                                value: properties.electricalConductivity
                            };
                            if (record.date) { 
                                records.push(record);
                            } else {
                                console.log('can not convert', properties);
                            }

                        }
                        console.log(records);
                        updateChart(records);
                        $('#modalchart').modal('show');
                    });
                });
		
                return marker;
            }	    
	    
        }).addTo(map);	
	
	
		// control that shows measurement info on hover
		var info = L.control({position: 'topleft'});
		
		info.onAdd = function (map) {
			this._div = L.DomUtil.create('div', 'info');
			this._div.innerHTML = '';					
			return this._div;
		};

		
		info.update = function (f) {			
			
			var date = new Date(f.properties.dateTime);
			
			this._div.innerHTML = '<h4>Measurement information</h4>' + 
			"Date: " + date.toLocaleDateString() +
			"<br /> Time: " + date.toLocaleTimeString() + 
			"<br /> EC: " + f.properties.electricalConductivity + " mS/cm" + 		 
			"<br /> Waterbody: " + f.properties.waterbodyType + 	
			"<br /> Water state: " + f.properties.waterState + 
			"<br /> Depth: " + f.properties.observationDepth + 								
			"<br /> Water temp.: " + f.properties.waterTemperature + String.fromCharCode(176);			

			// code for symbols 'Ohm x m': String.fromCharCode(8486) + String.fromCharCode(215) + "m"		
		};

		info.reset = function (f) {		
			this._div.innerHTML = '';				
		};
	
		info.addTo(map);		
		
		window.onclick = function(){
			info.reset();
		}
		
		var legend = L.control({position: 'topright'});

		legend.onAdd = function (map) {

			var div = L.DomUtil.create('div', 'info legend'),				
			grades = [0, 0.8, 2, 3, 4, 7, 10, 25],
			labels = [],
			from, to;

			labels.push("<b>EC (mS/cm)</b>");
				
			for (var i = 0; i < grades.length; i++) {
				from = grades[i];
				to = grades[i + 1];

				labels.push(
					'<i style="background:' + getColor(from + 0.1) + '"></i> ' +
					from + (to ? '&ndash;' + to : '+'));
			}

			div.innerHTML = labels.join('<br>');
			return div;
		};

		legend.addTo(map);
    });				
    
});