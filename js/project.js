
var canvas;
var lineGenerator = d3.line();

function init() {

    var w = 800, h = 400;

        canvas = d3.select(".svg-container")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + w + " " + h)
        //class to make it responsive
        .classed("svg-content-responsive", true);

}
function polygons() {
        scaleX = d3.scaleLinear()
        .domain([-30,30])
        .range([0,600]);

        scaleY = d3.scaleLinear()
            .domain([0,50])
            .range([500,0]);

        poly = [{"x":0.0, "y":25.0},
            {"x":8.5,"y":23.4},
            {"x":13.0,"y":21.0},
            {"x":19.0,"y":15.5}];

        var radius = 150,
            s_radius=50,
            xp1 = 200,
            yp1 = 200,
            xp2 = 600,
            yp2 = 200;

        var line_point=[[400,350],[400,50]];




    drawHexagon = d3.line()
            .x(function(d) { return d.x; })
            .y(function(d) { return d.y; })
            .curve(d3.curveCardinalClosed.tension("1"));




    var left_hexagon = canvas.append("path")
            .attr("d", drawHexagon(calculate_hexagon(xp1,yp1,radius)))
            .attr("stroke", "red")
            .attr("stroke-dasharray","20,5")
            .attr("stroke-width", 3)
            .attr("fill", "rgba(255,0,0,0.4)")
            .classed("big_hexagon", true);

    var right_hexagon = canvas.append("path")
        .attr("d", drawHexagon(calculate_hexagon(xp2,yp2,radius)))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5")
        .attr("stroke-width", 3)
        .attr("fill", "rgba(255,0,0,0.4)")
        .classed("big_hexagon", true);


    var middle_line = canvas.append("path")
        .attr("d", lineGenerator(line_point))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5");

    var small_hexagon=canvas.append("path")
        .attr("d", drawHexagon(calculate_hexagon(xp1,yp1,s_radius)))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5")
        .attr("stroke-width", 3)
        .attr("fill", "green")
        .classed("small_hexagon", true);


}



function calculate_hexagon(xp,yp,radius) {
    var h = (Math.sqrt(3)/2);

        return hexagonData = [
        { "x": radius+xp,   "y": yp},
        { "x": radius/2+xp,  "y": radius*h+yp},
        { "x": -radius/2+xp,  "y": radius*h+yp},
        { "x": -radius+xp,  "y": yp},
        { "x": -radius/2+xp,  "y": -radius*h+yp},
        { "x": radius/2+xp, "y": -radius*h+yp}];
}