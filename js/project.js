
var canvas;
var w = 1200, h = 600;
var g_w=600,g_h=400;
var big_hexagon_margin=40;
var lineGenerator = d3.line();
var h_w = 200, h_h = 200, s_radius=20, big_radius;
var element_number=15;
var floor_number=Math.floor(element_number/6);
var remaining=element_number%6;
var padding=5;
var  l_center_poly_x=120,
    l_center_poly_y = 100,
    r_center_poly_x=400 ,
    r_center_poly_y = 100;
var InTransition=false;

var graph_axis_distance=15;

var data1 = [3, 6, 2, 7, 5, 2, 0, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7];
var data2 = [543, 367, 215, 56, 65, 62, 87, 156, 287, 398, 523, 685, 652, 674, 639, 619, 589, 558, 605, 574, 564, 496, 525, 476, 432, 458, 421, 387, 375, 368];

var drawHexagon = d3.line()
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .curve(d3.curveCardinalClosed.tension("1"));

var graph_margin = [80, 80, 80, 80]; // margins

function calculate_big_hexagon_x(){
    var total_width_for_hexagons=w-4*big_hexagon_margin;
    big_radius=total_width_for_hexagons/4;
    l_center_poly_x=(big_radius+big_hexagon_margin)/2;
    r_center_poly_x=3/2*(big_radius+big_hexagon_margin);
    l_center_poly_y=(big_radius+big_hexagon_margin)/2;
    r_center_poly_y=(big_radius+big_hexagon_margin)/2;
    console.log("t: "+ total_width_for_hexagons+" big: "+big_radius);
}

function init() {

        calculate_big_hexagon_x();
        canvas = d3.select(".svg-container")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + w + " " + h)
        //class to make it responsive
        .classed("svg-content-responsive", true);

    canvas.on('mousedown', mousedown);



}
function remove_line(element_index) {
    d3.selectAll('path[element_index="' + (element_index) + '"]').remove();

}

function handle_graph(element_index)
{
    var w = g_w - graph_margin[1] - graph_margin[3];	// width
    var h = g_h - graph_margin[0] - graph_margin[2]; // height
    var transition_y;

    var graph=d3.selectAll(".graph");
    var line_number=1;
    var has_x_axis_exist=false;


    if(graph.empty()==true){
        graph = canvas.append("svg")
            .attr("width", w + graph_margin[1] + graph_margin[3])
            .attr("height", h + graph_margin[0] + graph_margin[2])
            .attr("line_number",1)
            .attr("class","graph")
            .append("g")
            .attr("transform", "translate(" + graph_margin[3] + "," + graph_margin[0] + ")");
        transition_y=-graph_axis_distance;
    }
    else {
        line_number=graph.attr("line_number");
        transition_y = w + graph_axis_distance * line_number;
        has_x_axis_exist=true;

    }

    //handle data here
    var x_domain={"lower_b":0,"upper_b":data1.length},
        x_range={"lower_b":0,"upper_b":w},
        y_domain={"lower_b":0,"upper_b":Math.max.apply(Math, data1)},
        y_range={"lower_b":h,"upper_b":0};

    var x = d3.scaleLinear().domain([x_domain.lower_b, x_domain.upper_b]).range([x_range.lower_b, x_range.upper_b]);
    // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
    var y = d3.scaleLinear().domain([y_domain.lower_b, y_domain.upper_b]).range([y_range.lower_b, y_range.upper_b]);

    var line1 = d3.line()
        .x(function(d,i) {

            return x(i);
        })
        .y(function(d) {

            return y(d);
        });


    draw_graph(graph,line_number ,data1,x,y, line1,has_x_axis_exist,transition_y,element_index);
}

function draw_graph(graph,line_number, data, x_scalar,y_scalar,line_creator,has_x_axis_exist,transition_of_y,element_index) {

    if(!has_x_axis_exist) {
        var xAxis = d3.axisBottom().scale(x_scalar).tickSize(-h);
        // Add the x-axis.
        graph.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + h + ")")
            .call(xAxis);
    }

    // create left yAxis
    var yAxisLeft = d3.axisLeft().scale(y_scalar).ticks(4);
    // Add the y-axis to the left
    graph.append("g")
        .attr("class", "y axis axisLeft")
        .attr("transform", "translate("+transition_of_y+",0)")
        .call(yAxisLeft);

    // create right yAxis
    //var yAxisRight = d3.axisRight().scale(y2).ticks(6).orient("right");
    // Add the y-axis to the right
    /*graph.append("svg:g")
        .attr("class", "y axis axisRight")
        .attr("transform", "translate(" + (w+15) + ",0)")
        .call(yAxisRight);*/

    // add lines
    // do this AFTER the axes above so that the line is above the tick-lines
    graph.append("path").attr("d", line_creator(data)).attr("class", "data"+line_number).attr("element_index",element_index);
    graph.attr("line_number",line_number);
    //graph.append("svg:path").attr("d", line2(data2)).attr("class", "data2");


}
function mousedown(d) {
    console.log("coordinates: "+d3.event.pageX+"  "+d3.event.pageY+"py");
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



        var line_point=[[(w/2),big_hexagon_margin],[(w/2),h-big_hexagon_margin]];



    var left_container = canvas.append("g")
        .attr("transform", "translate(" + l_center_poly_x + "," +l_center_poly_y + ")");


    var right_container = canvas.append("g")
        .attr("transform", "translate(" + r_center_poly_x + "," +r_center_poly_y + ")");


    var left_hexagon = left_container.append("path")
            .attr("d", drawHexagon(calculate_hexagon(l_center_poly_x,l_center_poly_y,big_radius)))
            .attr("stroke", "red")
            .attr("stroke-dasharray","20,5")
            .attr("stroke-width", 3)
            .attr("fill", "rgba(255,0,0,0.4)")
            .classed("big_hexagon", true);

    var right_hexagon = right_container.append("path")
        .attr("d", drawHexagon(calculate_hexagon(r_center_poly_x,r_center_poly_y,big_radius)))
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
        .attr("d", drawHexagon(calculate_hexagon(r_center_poly_x,r_center_poly_y,s_radius)))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5")
        .attr("stroke-width", 3)
        .on("mousedown", mousedown)
        .on("click", mouseClick)
        .on("mouseup", mouseup)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);


    var l_small_center_hexagon=left_container.append("path")
        .attr("d", drawHexagon(calculate_hexagon(l_center_poly_x,l_center_poly_y,s_radius)))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5")
        .attr("stroke-width", 3)
        .on("mousedown", mousedown)
        .on("click", mouseClick)
        .on("mouseup", mouseup)
        .on("mouseover", mouseover)
        .on("mouseout", mouseout);


    create_hexagon_shape(right_container,"right_container",s_radius,r_center_poly_x,r_center_poly_y,padding,element_number);
    create_hexagon_shape(left_container,"left_container",s_radius,l_center_poly_x,l_center_poly_y,padding,element_number);


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
function handle_elements(){
console.log("handle element");
}


function handle_scroll_event(parent_obj,unit_coefficient) {
    var elements;
    if (remaining > 0) {

        elements=parent_obj.selectAll('path[floor="' + (floor_number + 1) + '"]').each(function (d, i) {
            InTransition=true;

                var curr_obj = d3.select(this);
            var index = curr_obj.attr("index");
            var new_center_offset = calculate_hexagon_center(index,floor_number+2, padding, s_radius);
            curr_obj.transition().on("end", function(){ console.log("all done") });
            curr_obj.transition()
                .duration(1000)
                .attr("transform", "translate(" + (unit_coefficient*new_center_offset.x) + ", " + (unit_coefficient*new_center_offset.y) + ")")

        });
    }
        for (var g = 0; g < floor_number+1; g++) {
            elements+=parent_obj.selectAll('path[floor="' + (g) + '"]').each(function (d, i) {
                var curr_obj = d3.select(this);
                var index = curr_obj.attr("index");
                var new_center_offset = calculate_hexagon_center(index, g+1, padding, s_radius);
                curr_obj.transition()
                    .duration(1000)
                    .attr("transform", "translate(" + (unit_coefficient* new_center_offset.x) + ", " + (unit_coefficient*new_center_offset.y) + ")")
                    .transition()
                    .delay(0.5)
                    .on("end",function(){
                        if(unit_coefficient<0) {
                            handle_elements();
                            handle_scroll_event(parent_obj, 0);
                        }
                        else {
                            InTransition=false;
                            return;
                        }
                    })

            })
        }


    }

function zoom() {
    if(!InTransition) {
        console.log("zoooooom");

        var parent_obj = d3.select(this.parentNode);
        /*obj
        .transition()
        .attr("transform", "translate(320, 0)")
        .style("fill", "black");*/
        handle_scroll_event(parent_obj, -1);
    }
}


function mouseClick(d) {
    var obj = d3.select(this);
    var element_index=obj.attr("floor")*6+obj.attr("index");

    if (!InTransition) {
        if (!obj.classed("clicked")) {
            obj.classed("clicked", true);
            obj.transition().attr("fill", "red");
            obj.call(d3.zoom().on("zoom", zoom));

            handle_graph(element_index);

        } else {
            obj.classed("clicked", false);
            obj.transition().attr("fill", "blue");
            obj.on('.zoom', null);

            remove_line(element_index);
        }

    }
}

function mouseup() {

}
function mouseover(d,i) {
    if (!InTransition) {

        var obj = d3.select(this);
        var parent_obj = d3.select(this.parentNode);

        var obj_c_x = obj.attr("cx");
        var obj_c_y = obj.attr("cy");

        console.log("point" + obj_c_x + " " + obj_c_y);


        var startPoint = pathStartPoint(obj.node());

        console.log(startPoint);

        var circle = parent_obj.append("circle")
            .attr("cx", startPoint.x)
            .attr("cy", startPoint.y)
            .attr("r", 2)
            .attr("fill", "blue")
            .attr("stroke", "red")
            .attr("stroke-dasharray", "20,5")
            .classed("small_selection_ball", true);


        obj.classed("selected", true);

        //var circle = d3.select(this.parentNode).select('circle');

        //transition(circle,obj,startPoint);


        obj.attr("fill", "rgba(255,0,0,0.4)")

    }
}
function transition(trans_obj,path,startpoint) {

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
            return "translate(" + centerx+offset_x + "," + centery+offset_x + ")";//Move marker
        }
    }

}


function mouseout() {
    if (!InTransition) {

        console.log("out");
        canvas.selectAll(".small_selection_ball").remove();
        d3.selectAll(".selected").classed("selected", false);
        d3.select(this)
            .attr("fill", "green")

    }
}

function pathStartPoint(path) {

    console.log(path);
    var midpoint = path.getPointAtLength(path.getTotalLength()/2);

    return midpoint;
}

function create_hexagon_shape(container,container_name,radius,x,y,padding,element_number){

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
                .attr("floor",i)
                .attr("index",k)
                .classed(container_name,true)
                .on("mousedown", mousedown)
                .on("click", mouseClick)
                .on("mouseup", mouseup)
                .on("mouseover", mouseover)
                .on("mouseout", mouseout);
            console.log("hexagon creation "+container_name+" x: "+(x-center_diff.x)+" y: "+(y-center_diff.x));

            /*small_hexagon.transition()
                .duration(10000)
                .attr("transform", "translate(" + (-center_diff.x) + ", " + (-center_diff.y) + ")")
                .style("fill", "black");*/
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
                .attr("floor",i)
                .attr("index",z)
                .classed(container_name,true)
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