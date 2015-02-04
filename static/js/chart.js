
function generateQuery(point) {
    // Generate a query for mongodb, based on a point selection and fixed distance
    var query = {
        "data.geometry": {
            "$near": {
                "$geometry": {
                    "type":"Point",
                    "coordinates": point
                },
                "$maxDistance":1000
            }
        }
    };
    return query;
}

function addChart(data){
    // Add data to a chart
    nv.addGraph(function() {
        var chart = nv.models.lineWithFocusChart();

        chart.xAxis
            .tickFormat(function(d) {
                return d3.time.format('%x')(
                    new Date(d)
                );
            });

        chart.yAxis
            .tickFormat(d3.format(',.2f'));

        chart.y2Axis
            .tickFormat(d3.format(',.2f'));

        d3.select('#chart svg')
            .datum([{key: "test data", values: data}])
            .transition().duration(500)
            .call(chart);

        nv.utils.windowResize(chart.update);

        return chart;
    });
};
