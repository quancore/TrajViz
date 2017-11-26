
var canvas;
var lineGenerator = d3.line();
var h_w = 200, h_h = 200, s_radius=20;

drawHexagon = d3.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .curve(d3.curveCardinalClosed.tension("1"));


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
            l_xp1 = 100,
            l_yp1 = 100,
            r_xp2 = 300,
            r_yp2 = 100,
            r_s_a_x=200,
            r_s_a_y=0;

        var line_point=[[400,350],[400,50]];



    var left_container = canvas.append("g")
        .attr("transform", "translate(" + l_xp1 + "," +l_yp1 + ")");


    var right_container = canvas.append("g")
        .attr("transform", "translate(" + r_xp2 + "," +r_yp2 + ")");

    var right_selection_area= right_container.append("g")
        .attr("class", "right_selection_area")
        .attr("transform", "translate(" + r_s_a_x + "," +r_s_a_y + ")");

    var left_selection_area= right_container.append("g")
        .attr("class", "right_selection_area")
        .attr("transform", "translate(" + r_s_a_x + "," +r_s_a_y + ")");


    var left_hexagon = left_container.append("path")
            .attr("d", drawHexagon(calculate_hexagon(l_xp1,l_yp1,radius)))
            .attr("stroke", "red")
            .attr("stroke-dasharray","20,5")
            .attr("stroke-width", 3)
            .attr("fill", "rgba(255,0,0,0.4)")
            .classed("big_hexagon", true);

    var right_hexagon = right_container.append("path")
        .attr("d", drawHexagon(calculate_hexagon(r_xp2,r_yp2,radius)))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5")
        .attr("stroke-width", 3)
        .attr("fill", "rgba(255,0,0,0.4)")
        .classed("big_hexagon", true);


    var middle_line = canvas.append("path")
        .attr("d", lineGenerator(line_point))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5");

    var r_small_center_hexagon=right_container.append("path")
        .attr("d", drawHexagon(calculate_hexagon(r_xp2,r_yp2,s_radius)))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5")
        .attr("stroke-width", 3)
        .on("mousedown", mousedown)
        .on("click", mouseClick)
        .on("mouseup", mouseup)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);


    var l_small_center_hexagon=left_container.append("path")
        .attr("d", drawHexagon(calculate_hexagon(l_xp1,l_yp1,s_radius)))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5")
        .attr("stroke-width", 3)
        .on("mousedown", mousedown)
        .on("click", mouseClick)
        .on("mouseup", mouseup)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);

    create_hexagon_shape(right_container,s_radius,r_xp2,r_yp2,0,15);
    create_hexagon_shape(left_container,s_radius,l_xp1,l_yp1,5,15);


    /*var svg =right_selection_area.append("svg")
        .attr("width", h_w)
        .attr("height", h_h);*/


    /*svg.append("g")
        .attr("class", "hexagon")
        .selectAll("path")
        .data(topology.objects.hexagons.geometries)
        .enter().append("path")
        .attr("d", function(d) { return path(topojson.feature(topology, d)); })
        .attr("class", function(d) { return d.fill ? "fill" : null; })
        .on("mousedown", mousedown)
        .on("mousemove", mousemove)
        .on("mouseup", mouseup);

    svg.append("path")
        .datum(topojson.mesh(topology, topology.objects.hexagons))
        .attr("class", "mesh")
        .attr("d", path);*/



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

function zoom() {
    console.log("zoooooom");

}
function zoom2() {
    console.log("zoooooom2");

}
function mousedown(d) {

}

function mouseClick(d) {
    console.log("click");
    var obj=d3.select(this);
    if (!obj.classed("clicked") ){
        obj.classed("clicked", true);
        obj.transition().attr("fill","red");
        obj.call(d3.zoom().on("zoom",zoom));
    }else{
        obj.classed("clicked", false);
        obj.transition().attr("fill","blue");
        obj.on('.zoom', null);
    }

}

function mouseup() {

}
function mouseover(d,i) {

    var obj = d3.select(this);
    var parent_obj = d3.select(this.parentNode);

    var obj_c_x=obj.attr("cx");
    var obj_c_y=obj.attr("cy");

    console.log("point"+obj_c_x +" "+ obj_c_y);


    var startPoint = pathStartPoint(obj.node());

    console.log(startPoint);

    var circle = parent_obj.append("circle")
        .attr("cx", startPoint.x)
        .attr("cy",startPoint.y)
        .attr("r", 2)
        .attr("fill", "blue")
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5")
        .classed("small_selection_ball", true);


   obj.classed("selected", true);


    //var circle = d3.select(this.parentNode).select('circle');

    //transition(circle,obj,startPoint);



        obj
        .attr("fill", "rgba(255,0,0,0.4)")

}
function transition(trans_obj,path,startpoint) {
    console.log("kkkk");
   if(d3.selectAll(".selected").empty()==true)
        return;

    trans_obj.transition()
        .duration(5000)
        .attrTween("transform", translateAlong(path.node(),startpoint))
        .on("end",function () {
                transition(trans_obj,path,startpoint);
        });
}

function translateAlong(path,startpoint) {

    var l = path.getTotalLength();
    var test_p=path.getPointAtLength(l);
    var offset_x=Math.abs(startpoint.x-test_p.x);
    var offset_y=Math.abs(startpoint.y-test_p.y);
    console.log(offset_x,offset_y);
    return function(i) {
        return function(t) {
            var p = path.getPointAtLength(t * l);
            console.log(p.x+" "+p.y);
            var centerx=p.x;
            var centery=p.y;
            return "translate(" + centerx + "," + centery + ")";//Move marker
        }
    }

}


function mouseout() {
    console.log("out");
    canvas.selectAll(".small_selection_ball").remove();
    d3.selectAll(".selected").classed("selected",false);
    d3.select(this)
        .attr("fill", "green")

}

function pathStartPoint(path) {

    console.log(path);
    var midpoint = path.getPointAtLength(path.getTotalLength()/2);

    return midpoint;
}

function create_hexagon_shape(container,radius,x,y,padding,element_number){

    var floor_number=element_number/6;
    var remaining=element_number%6;


    for (var i=0;i<floor_number;i++){
        for (var k=0;k<6;k++){
            var center_diff= calculate_hexagon_center(k,i+1,padding,radius);
            var small_hexagon=container.append("path")
                .attr("d", drawHexagon(calculate_hexagon(x+center_diff.x,y+center_diff.y,radius)))
                .attr("stroke", "red")
                .attr("stroke-dasharray","20,5")
                .attr("stroke-width", 3)
                .attr("cx",x+center_diff.x)
                .attr("cy",y+center_diff.y)
                .on("mousedown", mousedown)
                .on("click", mouseClick)
                .on("mouseup", mouseup)
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
        }

    }
    if(remaining>0){
        console.log(remaining);
        for (var z=0;z<remaining;z++){
            var center_diff= calculate_hexagon_center(z,i+1,padding,radius);
            var small_hexagon=container.append("path")
                .attr("d", drawHexagon(calculate_hexagon(x+center_diff.x,y+center_diff.y,radius)))
                .attr("stroke", "red")
                .attr("stroke-dasharray","20,5")
                .attr("stroke-width", 3)
                .attr("cx",x+center_diff.x)
                .attr("cy",y+center_diff.y)
                .on("mousedown", mousedown)
                .on("click", mouseClick)
                .on("mouseup", mouseup)
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
        }
    }

}
function calculate_hexagon_center(neig_number,multiplier,padding,r){
    var d_center_diff_x=((3*r)/2+(padding*Math.sqrt(3)/2))*multiplier;
    var d_center_diff_y=((r*Math.sqrt(3)/2)+(padding/2))*multiplier;
    var s_center_diff_x=0;
    var s_center_diff_y=((Math.sqrt(3)*r)+padding)*multiplier;

    if(neig_number==0) {
        return {x: d_center_diff_x, y: d_center_diff_y};
    }
    if(neig_number==1) {
        return {x: s_center_diff_x, y: s_center_diff_y};
    }
    if(neig_number==2) {
        return {x: -d_center_diff_x, y: d_center_diff_y};
    }
    if(neig_number==3) {
        return {x: -d_center_diff_x, y: -d_center_diff_y};
    }
    if(neig_number==4) {
        return {x: s_center_diff_x, y: -s_center_diff_y};
    }
    if(neig_number==5) {
        return {x: d_center_diff_x, y: -d_center_diff_y};
    }

}