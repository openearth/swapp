
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



function updateChart(data) {

    var margin = {top: 20, right: 50, bottom: 30, left: 50},
        width = 400 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var parseDate = d3.time.format("%d-%b-%y").parse,
        bisectDate = d3.bisector(function(d) { return d.date; }).left,
        formatValue = d3.format(",.2f");

    var x = d3.time.scale()
            .range([0, width]);

    var y = d3.scale.linear()
            .range([height, 0]);

    var xAxis = d3.svg.axis()
            .scale(x)
            .ticks(5)
            .orient("bottom");

    var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left");

    var line = d3.svg.line()
            .x(function(d) { return x(d.date); })
            .y(function(d) { return y(d.value); });

    var svg = d3.select("#chart svg");

    // cleanup
    svg
        .selectAll('*').remove();
    // create new chart
    var g = svg
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");


    data.sort(function(a, b) {
        return a.date - b.date;
    });
    x.domain([data[0].date, data[data.length - 1].date]);
    y.domain(d3.extent(data, function(d) { return d.value; }));

    g.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    g.append("g")
        .attr("class", "y axis")
        .call(yAxis)
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Conductivity [mS/cm]");

    g.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

    var focus = g.append("g")
            .attr("class", "focus")
            .style("display", "none");

    focus.append("circle")
        .attr("r", 4.5);

    focus.append("text")
        .attr("x", 9)
        .attr("dy", ".35em");

    g.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);

    function mousemove() {
        var x0 = x.invert(d3.mouse(this)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i];
        if (! (d1 && d0)) {
            console.log('d0 and d1 not both true', d0, d1);
            return;
        }
        var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        focus.attr("transform", "translate(" + x(d.date) + "," + y(d.value) + ")");
        focus.select("text").text(d.value);
    }

}