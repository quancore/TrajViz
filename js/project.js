

var canvas;//most outer container


var w = 1200, h = 550;//most outer container size

var middle_polygon_margin=10;//top and bottom padding of middle polygon containers
var big_hexagon_margin={"left":10,"right":10,"top":60,"bottom":80};//big hexagons margin array
var between_hexagons=600;//distance between two big hexagons


var s_radius=40, big_radius=220;//s_radius=radius of small hexagons, big_raidus=radius of big hexagons
var  l_center_poly_x=120,//initial polygon centers
    l_center_poly_y = 100,
    r_center_poly_x=400 ,
    r_center_poly_y = 100;
var floor_number=2;//number of floor created with hexagons (count of hexagon level)
var padding=5;//padding between big container polygons

var g_w=450,g_h=250;//line graph w and h
var graph_x_position_offset=10;
var g_x=(w/2)-g_w/2-graph_x_position_offset,g_y=0;//line graph position
var g_cut_w=between_hexagons/2-2*middle_polygon_margin,g_cut_h=h/2-middle_polygon_margin;//graph cutting plane size
//var g_cut_padding=2;//graph cutting plane padding(t,b,r,l)
var graph_axis_distance=5;//distance between two consecutive y-axis
var graph_y_axis_right_base_padding=4;
var graph_margin = [60, 80, 60, 80]; // margins
var graph_hover_circle_radius=7.5;


var l_big_container_name="left_container";
var r_big_container_name="rigth_container";
var u_big_container_name="upper_container";
var lo_big_container_name="lower_container";
var ur_big_subcontainer_name="upper_right_subcontainer";


var r_container_name="steam";
var l_container_name="twitch";

var hover_container_radius=100;//hover hexagon radius

var point_transition_time=1000;//hover point transition time
var hover_point_radius=4;// hover point radius
var point_hover_color="yellow";

var text_area_inner_margin=12;
var text_graph_hover_circle_radius=5;


/* For star shape creation
var element_number=12;
var floor_number=Math.floor(element_number/6);
var remaining=element_number%6;*/


var InTransition=false;//transition parameter.use for disable mouse event during zoom event

var data1 = [3, 6, 4, 7, 5, 7, 0, 3, 8, 9, 2, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7];
var data2 = [4, 9, 8, 7, 9, 2, 8, 6, 8, 9, 9, 5, 9, 3, 6, 3, 6, 2, 7, 5, 2, 1, 3, 8, 9, 2, 5, 9, 2, 7];
var data3 = [8, 6, 2, 7, 5, 4, 0, 3, 6, 9, 2, 5, 10, 3, 6, 3, 6, 2, 7, 5, 2, 4, 3, 8, 9, 2, 5, 7, 9, 7];

var x1_s,y1_s,x2_s,y2_s,x3_s,y3_s;//data scalers

var drawPolygon = d3.line()//general purpose polygon,hexagon drawer
    .x(function(d) { return d.x; })
    .y(function(d) { return d.y; })
    .curve(d3.curveCardinalClosed.tension("1"));

var zoomed = d3.zoom()
    .scaleExtent([1, 4])
    .on("zoom", function() {
        var graph_c=d3.selectAll(".graph_container");
        var e = d3.event.transform;
        graph_c.attr("transform",e);
    });

//TODO update this line with real data like=> bisectDate = d3.bisector(function(d) { return d.year; }).left;
//var bisectDate = d3.bisector(function(d,i) { return d; }).left;

$(document).ready(function() {
    console.log("ready");

    document.getElementsByClassName( "svg-container" )[0].onwheel = function(event){
        event.preventDefault();
    };
    document.getElementsByClassName( "svg-container" )[0].onmousewheel = function(event){
        event.preventDefault();
    };
});
/***********************
    Data related code
***********************/
var version = 0.86;
var steam_data = {};
var twitch_data = {};

console.log('Version: '.concat(version));

$(document).ready(function() {
    fetchData(1, 12, 2017, 'steam');
    fetchData(1, 12, 2017, 'twitch')
});



function getDateAsString(day, month, year) {
    return day + '_' + month + '_' + year
}

function fetchData(day, month, year, platform) {
    console.log('Fetching data for ' + platform);

    dateAsString = getDateAsString(day, month, year);
    fileNameAsString = dateAsString + '_' + platform + '.csv';
    fullStringUrl = 'data/' + platform + '/' + fileNameAsString;
    $.ajax({
        type: "GET",
        url: fullStringUrl,
        dataType: "text",
        success: function(data) {loadTextAsData(data, dateAsString, platform);}
    });
}

function loadTextAsData(allText, key, platform) {
    console.log('Loading ' + platform + ' data into memory');

    data = d3.csvParse(allText);
    switch(platform) {
        case 'steam':
            steam_data[key] = data;
            break;
        case 'twitch':
            twitch_data[key] = data;
            break;
        default:
            console.log('Unknown platform specified: "' + platform + '"');
            break;
    }
}

function getGameDataByRank(day, month, year, rank, platform) {
    data = null;
    switch(platform) {
        case 'steam':
            data = steam_data;
            break;
        case 'twitch':
            data = twitch_data;
            break;
        default:
            break;
    }
    if (data) {
        data = data[getDateAsString(day, month, year)];
        return data[rank]
    }
    return null
}
/**********************/

function calculate_hexagon(xp,yp,radius) {//small hexagon drawer
    var h = (Math.sqrt(3)/2);

    return hexagonData = [
        { "x": radius+xp,   "y": yp},
        { "x": radius/2+xp,  "y": radius*h+yp},
        { "x": -radius/2+xp,  "y": radius*h+yp},
        { "x": -radius+xp,  "y": yp},
        { "x": -radius/2+xp,  "y": -radius*h+yp},
        { "x": radius/2+xp, "y": -radius*h+yp}];
}

function calculate_big_hexagon_centers(){
    var available_area=w-big_hexagon_margin.left-big_hexagon_margin.right;
    var total_width_for_hexagons=available_area-between_hexagons;

    big_hexagon_margin.top=(h/2-(big_radius*Math.sqrt(3)/2));
    console.log("big_hexagon_top:",big_hexagon_margin.top);
    big_hexagon_margin.bottom=big_hexagon_margin.top;
    l_center_poly_x=(big_radius+big_hexagon_margin.left)/2;
    r_center_poly_x=(w-(big_radius+big_hexagon_margin.right))/2;
    l_center_poly_y=(big_radius*Math.sqrt(3)/2+big_hexagon_margin.top)/2;
    r_center_poly_y=(big_radius*Math.sqrt(3)/2+big_hexagon_margin.top)/2;
    console.log("t: "+ total_width_for_hexagons+" big: "+big_hexagon_margin.top);
}
function calculate_uppermiddle_polygons(){
    var a=big_hexagon_margin.left+(3/2)*big_radius+middle_polygon_margin;
    var b=big_hexagon_margin.left+2*big_radius+middle_polygon_margin;
    var c=a+(big_hexagon_margin.top-middle_polygon_margin)/Math.sqrt(3);

    return  upper_polygon_points=[

        {"x":a, "y":big_hexagon_margin.top},
        {"x":b, "y":big_hexagon_margin.top+(big_radius)*(Math.sqrt(3)/2)},
        {"x":w-(b), "y":big_hexagon_margin.top+(big_radius)*(Math.sqrt(3)/2)},
        {"x":w-a, "y":big_hexagon_margin.top},
        {"x":w-c, "y":middle_polygon_margin},
        {"x":c, "y":middle_polygon_margin}


    ];
}
function calculate_lowermiddle_polygons(){

    var a=big_hexagon_margin.left+(3/2)*big_radius+middle_polygon_margin;
    var b=big_hexagon_margin.left+2*big_radius+middle_polygon_margin;
    var c=a+(big_hexagon_margin.top-middle_polygon_margin)/Math.sqrt(3);

    return  upper_polygon_points=[

        {"x":a, "y":h-big_hexagon_margin.top},
        {"x":b, "y":h-(big_hexagon_margin.top+(big_radius)*(Math.sqrt(3)/2))},
        {"x":w-(b), "y":h-(big_hexagon_margin.top+(big_radius)*(Math.sqrt(3)/2))},
        {"x":w-a, "y":h-big_hexagon_margin.top},
        {"x":w-c, "y":h-middle_polygon_margin},
        {"x":c, "y":h-middle_polygon_margin}];
}

function calculate_upper_right_subpolygons(){
    var a=big_hexagon_margin.right+(3/2)*big_radius;
    var b=big_hexagon_margin.right+2*big_radius+middle_polygon_margin;
    var c=a+(big_hexagon_margin.top-middle_polygon_margin)/Math.sqrt(3);

    return  upper_polygon_points=[

        {"x":w-big_hexagon_margin.right-big_radius/2, "y":big_hexagon_margin.top},
        {"x":w-a, "y":big_hexagon_margin.top},
        {"x":w-(c), "y":middle_polygon_margin},
        {"x":w-big_hexagon_margin.right-big_radius/4, "y":middle_polygon_margin}

    ];
}


//TODO modify with real data;
function select_data_array(arr_index) {//return data array via index ={1,2,3}
    if(arr_index==1)
        return data1;
    else if(arr_index==2)
        return data2;
    else if(arr_index==3)
        return data3;
    return -1;

}
function get_data_scalers(arr_index) {//return scalers (x,y) related to the array via index ={1,2,3}

    console.log("select_data_scalers:",arr_index);


    if(arr_index==1) {
        return [x1_s,y1_s];
    }
    else if(arr_index==2) {
        return [x2_s,y2_s];

    }
    else {
        return [x3_s,y3_s];

    }

}
function set_data_scalers(arr_index,x_s,y_s) {//return scalers (x,y) related to the array via index ={1,2,3}

    console.log("select_data_scalers:",arr_index);


    if(arr_index==1) {
        x1_s=x_s;y1_s=y_s;
    }
    else if(arr_index==2) {
        x2_s=x_s;y2_s=y_s;

    }
    else {
        x3_s=x_s;y3_s=y_s;

    }

}

function get_domain_range(arr) {// return domain (lower,upper) and range (lower,upper)
    var w = g_w - graph_margin[1] - graph_margin[3];	// width
    var h = g_h - graph_margin[0] - graph_margin[2]; // height

    return domain_range=[
            {"lower_b":0,"upper_b":arr.length},//x domain
            {"lower_b":0,"upper_b":w},//x range
            {"lower_b":0,"upper_b":Math.max.apply(Math, arr)},//y domain
            {"lower_b":h,"upper_b":0}];//y range
}

function initialize_scalers(arr_index) {//initialize scalers(x,y) by given index={1,2,3}
        var domain_range=get_domain_range(select_data_array(arr_index));

    var x_s = d3.scaleLinear().domain([domain_range[0].lower_b, domain_range[0].upper_b]).range([domain_range[1].lower_b, domain_range[1].upper_b]);
        // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
    var y_s = d3.scaleLinear().domain([domain_range[2].lower_b, domain_range[2].upper_b]).range([domain_range[3].lower_b, domain_range[3].upper_b]);
    set_data_scalers(arr_index,x_s,y_s);

    console.log("initialize:",x1_s,y1_s);

        return [x_s,y_s];

}

function init() {

        calculate_big_hexagon_centers();
        canvas = d3.select(".svg-container")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 " + w + " " + h)
        //class to make it responsive
        .classed("svg-content-responsive", true);

        var cntr=d3.select(".svg-container")
            .on("scroll.scroller",function (d) {
                console.log("scroolll");
                d3.event.preventDefault();
            });
        console.log(cntr);

        //canvas.on('mousedown', mousedown);

        polygons();



}

function polygons() {


        //var line_point=[[(w/2),big_hexagon_margin],[(w/2),h-line_margin_down]];
    var upper_right_subcontainer = canvas.append("g")
        .attr("class",ur_big_subcontainer_name);

    var upper_container = canvas.append("g")
        .attr("class",u_big_container_name);

    var lower_container = canvas.append("g")
        .attr("class",lo_big_container_name);


    var left_container = canvas.append("g")
        .attr("transform", "translate(" + l_center_poly_x + "," +l_center_poly_y + ")")
        .attr("class",l_big_container_name)
        .attr("segment_number",1);//we are in the first segment (game types:fps,mmo etc).



    var right_container = canvas.append("g")
        .attr("transform", "translate(" + r_center_poly_x + "," +r_center_poly_y + ")")
        .attr("class",r_big_container_name)
        .attr("segment_number",1);



    var upper_right_subpolygons = upper_right_subcontainer.append("path")
        .attr("d", drawPolygon(calculate_upper_right_subpolygons()))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5")
        .attr("stroke-width", 3)
        .attr("fill", "rgba(255,0,0,0.4)")
        .classed("upper_right_subpolygons", true);

    var left_hexagon = left_container.append("path")
            .attr("d", drawPolygon(calculate_hexagon(l_center_poly_x,l_center_poly_y,big_radius)))
            .attr("stroke", "red")
            .attr("stroke-dasharray","20,5")
            .attr("stroke-width", 3)
            .attr("fill", "rgba(255,0,0,0.4)")
            .classed("big_hexagon", true);

    var right_hexagon = right_container.append("path")
        .attr("d", drawPolygon(calculate_hexagon(r_center_poly_x,r_center_poly_y,big_radius)))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5")
        .attr("stroke-width", 3)
        .attr("fill", "rgba(255,0,0,0.4)")
        .classed("big_hexagon", true);

     upper_middle_hexagon = upper_container.append("path")
        .attr("d", drawPolygon(calculate_uppermiddle_polygons()))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5")
        .attr("stroke-width", 3)
        .attr("fill", "rgba(255,0,0,0.4)")
        .classed("upper_middle_hexagon", true)
         .call(zoomed);

     lower_middle_hexagon = lower_container.append("path")
        .attr("d", drawPolygon(calculate_lowermiddle_polygons()))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5")
        .attr("stroke-width", 3)
        .attr("fill", "rgba(255,0,0,0.4)")
        .classed("lower_middle_hexagon", true);






    /*var middle_line = canvas.append("path")
        .attr("d", lineGenerator(line_point))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5");*/

    var r_small_center_hexagon=right_container.append("path")
        .attr("d", drawPolygon(calculate_hexagon(r_center_poly_x,r_center_poly_y,s_radius)))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5")
        .attr("stroke-width", 3)
        .attr("cx",r_center_poly_x)
        .attr("cy",r_center_poly_y)
        .attr("hexagon-type", "center_right")
        .attr("container",r_container_name)
        //.on("click", mouseClick)
        //.on("mouseup", mouseup)
        //.on("mouseover", mouseover)
        //.on("mouseout", mouseout)
        .classed("center_hexagon", true);



    var l_small_center_hexagon=left_container.append("path")
        .attr("d", drawPolygon(calculate_hexagon(l_center_poly_x,l_center_poly_y,s_radius)))
        .attr("stroke", "red")
        .attr("stroke-dasharray","20,5")
        .attr("stroke-width", 3)
        .attr("cx",l_center_poly_x)
        .attr("cy",l_center_poly_y)
        .attr("hexagon-type", "center_left")
        .attr("container",l_container_name)
        //.on("click", mouseClick)
        //.on("mouseup", mouseup)
        //.on("mouseover", mouseover)
        //.on("mouseout", mouseout)
        .classed("center_hexagon", true);



    var left_base_index=hexagon_creation_by_angle(right_container,0,r_container_name,s_radius,r_center_poly_x,r_center_poly_y,padding,18);//base index is the starting index of container
    hexagon_creation_by_angle(left_container,left_base_index,l_container_name,s_radius,l_center_poly_x,l_center_poly_y,padding,18);

    //create_hexagon_shape(left_container,"left_container",s_radius,l_center_poly_x,l_center_poly_y,padding,element_number);


}

function remove_line(element_index) {//remove element from line graph
    var graph=d3.selectAll(".graph");
    var line_count=parseInt(graph.attr("line_count"));
    var focus=graph.select(".focus");
    var line= d3.selectAll('path[element_index="' + (element_index) + '"]');
    var line_id=get_line_id(line.attr("class"));

    var rigth_upper_subcontainer=d3.select("."+ur_big_subcontainer_name);
    var text_area=rigth_upper_subcontainer.select(".text_area");
    var text_group=text_area.select(".text_group"+line_id);



    line.remove();
    d3.selectAll('g[element_index="' + (element_index) + '"]').remove();
    console.log(line_id);
    focus.select(".circle"+line_id).remove();
    text_group.remove();


    line_count--;

    if(line_count<=0){//graph will be deleted

        d3.selectAll(".clipping_plane").remove();
        d3.selectAll("defs").remove();
        text_area.remove();
        rigth_upper_subcontainer.selectAll(".upper_right_transparency_polygon").remove();


    }

    else
        graph.attr("line_count",line_count);

}

function get_empty_line_place() {// get the first element of missing line ids

    var line_number_values=new Array(3).fill(4);//fill 4 because bigger than 3
    var reference_arr=[1,2,3];
    var curr_index=0;


    d3.selectAll("path#graph_line").each(function (d, i) {
            var obj=d3.select(this);
            var line_number_string=obj.attr("class");
            line_number_values[curr_index]=get_line_id(line_number_string);
            curr_index++;

        });

    line_number_values = line_number_values.sort(function (a, b) {  return a - b;  });

    for(var r=0;r<line_number_values.length;r++){
        if(reference_arr[r]!=line_number_values[r])
            return reference_arr[r];
        }
    return -1;

}
function get_line_id(class_str){

    var numberPattern = /\d+/g;
    var line_number = class_str.match( numberPattern );
    return parseInt(line_number);
}

function get_available_line_ids() {// get sorted list of available line ids

    var available_ids=[];

    d3.selectAll("path#graph_line").each(function (d, i) {
        var obj=d3.select(this);
        var line_number_string=obj.attr("class");
        available_ids.push((get_line_id(line_number_string)));

    });

    return available_ids = available_ids.sort(function (a, b) {  return a - b;  });

}
function find_big_hexagon_orientation(obj_x,obj_y,parent) {
    var parent_x=parseFloat(parent.attr("cx")),parent_y=parseFloat(parent.attr("cy"));
    var obj_x=parseFloat(obj_x),obj_y=parseFloat(obj_y);
    var orientation_multiplier_x=Math.sign(parent_x-obj_x);
    var orientation_multiplier_y=Math.sign(parent_y-obj_y);


    return [orientation_multiplier_x,orientation_multiplier_y];



}
function handle_graph(element_index)
{
    var w = g_w - graph_margin[1] - graph_margin[3];	// width
    var h = g_h - graph_margin[0] - graph_margin[2]; // height
    var transition_y;

    var graph=d3.selectAll(".graph");
    var graph_container=d3.selectAll(".upper_container");
    var rigth_upper_subcontainer=d3.select("."+ur_big_subcontainer_name);


    var line_count,line_id;//keep count of how many line appended currently

    var has_x_axis_exist=false;

    line_id=get_empty_line_place();


    if(line_id==1)
        transition_y=-(graph_axis_distance);
    else
        transition_y = w +graph_y_axis_right_base_padding+(graph_axis_distance) * Math.pow(line_id,2);


    if(graph.empty()==true){

        /*var clipper = graph_container//rectangle clipper
            .append('defs')
            .append('clipPath')
            .attr('id', 'clip')
            .append('rect')
            .attr("id", "clip-rect")
            .attr('x', big_radius/2-middle_polygon_margin-g_cut_padding)
            .attr('y', middle_polygon_margin)
            .attr('width', g_cut_w-g_cut_padding)
            .attr('height', g_cut_h-g_cut_padding);*/

        var clipper = graph_container
            .append('defs')
            .append('clipPath')
            .attr('id', 'clip')
            .append("path")
            .attr("d", drawPolygon(calculate_uppermiddle_polygons()));




        var clipped_area = graph_container
            .append('g')
            .attr('class', 'clipping_plane')
            .attr('clip-path', 'url(#clip)');


        graph = clipped_area.append("g")
            .attr("class","graph_container")
            .append("g")//chrome wrapper
            .attr("transform", "translate(" + g_x + "," + g_y + ")")
            .append("svg")
            .attr("width", w + graph_margin[1] + graph_margin[3])
            .attr("height", h + graph_margin[0] + graph_margin[2])
            .attr("line_count",1)
            .attr("class","graph")
            .on("mouseover", function() {
                rigth_upper_subcontainer.selectAll(".upper_right_transparency_polygon").remove();
            })
            .on("mouseout", function() {
                if(rigth_upper_subcontainer.selectAll(".upper_right_transparency_polygon").empty()==true) {
                    rigth_upper_subcontainer.append("path")
                        .attr("d", drawPolygon(calculate_upper_right_subpolygons()))
                        .attr("stroke", "red")
                        .attr("stroke-dasharray", "20,5")
                        .attr("stroke-width", 3)
                        .attr("fill", "rgba(255,0,0,0.2)")
                        .classed("upper_right_transparency_polygon", true);
                }
                update_text_element(rigth_upper_subcontainer,"-");
            });



        graph.append("g")
            .attr("transform", "translate(" + graph_margin[3] + "," + graph_margin[0] + ")")
            .attr("class","graph_area");


        line_count=1;
    }
    else {

        line_count=parseInt(graph.attr("line_count"))+1;
        has_x_axis_exist=true;

    }

    //handle data here
    /*var x_domain={"lower_b":0,"upper_b":data1.length},
        x_range={"lower_b":0,"upper_b":w},
        y_domain={"lower_b":0,"upper_b":Math.max.apply(Math, data1)},
        y_range={"lower_b":h,"upper_b":0};

    var x = d3.scaleLinear().domain([x_domain.lower_b, x_domain.upper_b]).range([x_range.lower_b, x_range.upper_b]);
    // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
    var y = d3.scaleLinear().domain([y_domain.lower_b, y_domain.upper_b]).range([y_range.lower_b, y_range.upper_b]);*/

    //TODO do not forget to set data element related to line_id (1=data1,2=data2, 3=data3) before getting scalers (x,y)
    var scalers=initialize_scalers(line_id);
    var x=scalers[0],y=scalers[1];


    var line1 = d3.line()
        .x(function(d,i) {

            return x(i);
        })
        .y(function(d) {

            return y(d);
        });

    if(line_count<4)//at most 3 data append
        draw_graph(graph,line_count,line_id ,data1,x,y, line1,has_x_axis_exist,h,transition_y,element_index);

    return line_id;
}


function draw_graph(graph,line_count,line_id, data, x_scalar,y_scalar,line_creator,has_x_axis_exist,transition_of_x,transition_of_y,element_index) {

    var yAxis = d3.axisLeft().scale(y_scalar).ticks(4);
    var graph_area=graph.select(".graph_area");
    var focus=graph_area.select(".focus");
    var rigth_upper_subcontainer=d3.select("."+ur_big_subcontainer_name);
    var rect=rigth_upper_subcontainer.select(".text_area");

    if(!has_x_axis_exist) {
        var xAxis = d3.axisBottom().scale(x_scalar).tickSize(-h);


        // Add the x-axis.
        graph_area.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + transition_of_x + ")")
            .call(xAxis);

       graph_area
            .on("mouseover", function() {
                focus.style("display", null);
            })
            .on("mouseout", function() {
                focus.style("display", "none");
            })
            .on("mousemove", update_data_points_graph);



       focus = graph_area.append("g")
            .attr("class", "focus")
            .style("display", "none");

        focus.append("circle")
            .attr("r", graph_hover_circle_radius)
            .attr("class","circleX");


        rect=rigth_upper_subcontainer.append("g")
            .attr("class","text_area")
            .attr("transform", "translate("+(w-(big_hexagon_margin.right+(3/2)*big_radius)+text_area_inner_margin)+","+(middle_polygon_margin+text_area_inner_margin)+")");

        var text_groupX=rect.append("g")
            .attr("class","text_groupX");

        var textX=text_groupX.append("text")
            .attr("x", 2*text_graph_hover_circle_radius)
            .attr("y",0)
            .text("-");

        textX.attr("y",(textX.node().getBBox().height)/4);


        text_groupX.append("circle")
            .attr("r", text_graph_hover_circle_radius);

        rigth_upper_subcontainer.append("path")
            .attr("d", drawPolygon(calculate_upper_right_subpolygons()))
            .attr("stroke", "red")
            .attr("stroke-dasharray", "20,5")
            .attr("stroke-width", 3)
            .attr("fill", "rgba(255,0,0,0.2)")
            .classed("upper_right_transparency_polygon", true);

    }
    else{


    }

    focus.append("circle")
        .attr("r", graph_hover_circle_radius)
        .attr("class","circle"+line_id);

    var text_group=rect.append("g")
        .attr("class","text_group"+line_id);

    var text=text_group.append("text")
        .attr("x", 2*text_graph_hover_circle_radius)
        .attr("y",0)
        .text("-");

    text_group.append("circle")
        .attr("r", text_graph_hover_circle_radius);



    text.attr("y",(text.node().getBBox().height)/4);
    text_group.attr("transform", "translate(0,"+((text.node().getBBox().height)*line_id)+")");

        graph_area.append("g")
            .attr("class", "y axis axis"+line_id)
            .attr("transform", "translate("+transition_of_y+",0)")
            .attr("element_index",element_index)
            .call(yAxis);

    // create left yAxis
    // Add the y-axis to the left


    // create right yAxis
    //var yAxisRight = d3.axisRight().scale(y2).ticks(6).orient("right");
    // Add the y-axis to the right
    /*graph.append("svg:g")
        .attr("class", "y axis axisRight")
        .attr("transform", "translate(" + (w+15) + ",0)")
        .call(yAxisRight);*/

    // add lines
    // do this AFTER the axes above so that the line is above the tick-lines
    graph_area.append("path")
        .attr("d", line_creator(select_data_array(line_id)))
        .attr("id","graph_line")
        .attr("class", "data"+line_id)
        .attr("element_index",element_index);
    graph.attr("line_count",line_count);
    //graph.append("svg:path").attr("d", line2(data2)).attr("class", "data2");


}
//TODO may need editing for real data
function update_text_element(parent_obj,text) {
    parent_obj.selectAll("text").text(text);
}
//TODO modify here with real data
function update_data_points_graph() {

    var available_elements=get_available_line_ids();
    var focus=d3.select(".focus");
    var text_area=d3.select(".text_area");


    for(var i=0;i<available_elements.length;i++){
        var scalers=get_data_scalers(available_elements[i]);
        var x0 = scalers[0].invert(d3.mouse(this)[0]);



        var curr_data_arr=select_data_array(available_elements[i]);
        console.log(curr_data_arr);

        var bisection_index = Math.ceil(x0);// d3 bisection has to use for sorted date =>bisectDate(curr_data_arr, x0,1)
        console.log(bisection_index);
        if(bisection_index>0) {//sometimes it gives negaive val.
            var d0 = bisection_index - 1,
                d1 = bisection_index,
                d = x0 - d0 > d1 - x0 ? d1 : d0;//d is y value of nearest data point to mouse position
            var circle = focus.select(".circle" + available_elements[i]);
            var circleX = focus.select(".circleX");

            var text_group = text_area.select(".text_group" + available_elements[i]);
            var text_groupX = text_area.select(".text_groupX");

            update_text_element(text_group, curr_data_arr[d]);
            update_text_element(text_groupX, d);

            circle.attr("transform", "translate(" + scalers[0](d) + "," + scalers[1](curr_data_arr[d]) + ")");
            circleX.attr("transform", "translate(" + scalers[0](d) + "," + (-20)+ ")");

        }
        //available_elements=get_available_line_ids();


        //focus.attr("transform", "translate(" + x(d.year) + "," + y(d.value) + ")");
        //focus.select("text").text(function() { return d.value; });
        //focus.select(".x-hover-line").attr("y2", height - y(d.value));
        //focus.select(".y-hover-line").attr("x2", width + width);
    }
}
/*
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


    }*/

function handle_scroll_event_updated(parent_obj,unit_coefficient) {
    var elements;
    var central_hexagon=parent_obj.selectAll(".center_hexagon");
    var parent_x=parseFloat(central_hexagon.attr("cx"));
    var parent_y=parseFloat(central_hexagon.attr("cy"));
    InTransition=true;

    /*if (remaining > 0) {

        elements=parent_obj.selectAll('path[floor="' + (floor_number + 1) + '"]').each(function (d, i) {


            var curr_obj = d3.select(this);
            var index = curr_obj.attr("index");
            var new_center_offset = calculate_hexagon_center(index,floor_number+2, padding, s_radius);
            curr_obj.transition().on("end", function(){ console.log("all done") });
            curr_obj.transition()
                .duration(1000)
                .attr("transform", "translate(" + (unit_coefficient*new_center_offset.x) + ", " + (unit_coefficient*new_center_offset.y) + ")")

        });
    }*/
    for (var g = 0; g < floor_number+1; g++) {

        elements+=parent_obj.selectAll('path[floor="' + (g) + '"]').each(function (d, i) {
            var curr_obj = d3.select(this);
            var index = curr_obj.attr("index");
            var cx = parseFloat(curr_obj.attr("cx"));
            var cy = parseFloat(curr_obj.attr("cy"));
            var dif_vector={"x":parent_x-cx,"y":parent_y-cy};

            curr_obj.transition()
                .duration(1000)
                .attr("transform", "translate(" + (-unit_coefficient* dif_vector.x) + ", " + (-unit_coefficient*dif_vector.y) + ")")
                .transition()
                .delay(0.5)
                .on("end",function(){
                    if(unit_coefficient<0) {
                        handle_elements(elements);
                        handle_scroll_event_updated(parent_obj, 0);
                    }
                    else {
                        InTransition=false;
                        return;
                    }
                })

        })
    }


}
function handle_elements(elements){
    console.log("handle element");
}
function create_hover_hexagon(center_x,center_y,container) {
    var central_distance=(s_radius*Math.sqrt(3)/2)+(hover_container_radius*Math.sqrt(3)/2)+padding;
    var central_hexagon=container.selectAll(".center_hexagon");
    var h_center_offset_x=central_distance*Math.sqrt(3)/2;
    var h_center_offset_y=central_distance/2;
    var h_center_x,h_center_y;

    var orientation=find_big_hexagon_orientation(center_x,center_y,central_hexagon);

    if (orientation[1]==0)
        orientation[1]=-1;
    if (orientation[0]==0)
        orientation[0]=-1;
    console.log("container: ",central_hexagon);
    console.log(central_hexagon);
    console.log(orientation);

    h_center_x=center_x+orientation[0]*h_center_offset_x;
    h_center_y=center_y+orientation[1]*h_center_offset_y;

    /*if(container_name.localeCompare(l_big_container_name)==0){
        h_center_x=center_x+h_center_offset_x;
        h_center_y=center_y-h_center_offset_y;
    }
    else if(container_name.localeCompare(r_big_container_name)==0){
        h_center_x=center_x-h_center_offset_x;
        h_center_y=center_y-h_center_offset_y;
    }
    else{
        console.error("hover:wrong container name");
    }*/

    var hover_hexagon = container.append("path")
        .attr("d", drawPolygon(calculate_hexagon(h_center_x, h_center_y, hover_container_radius)))
        .attr("class","hover_hexagon");

}

//this function can be used to get all selected elements id in this container when zoom event is happened
//for an element that is the same container
// (can be used to get all selected genres).return array includes zoomed obj as well.
// TODO can be modifiy to return DOM elements
function return_selected_ids_in_container(parent_obj){

    var obj_arr=[];

    parent_obj.selectAll(".clicked").each(function (d, i) {
        var obj=d3.select(this);
        var index=parseInt(obj.attr("index"));
        obj_arr.push(index);
    });

    return obj_arr;
}
function zoom() {

    var direction = d3.event.sourceEvent.deltaY > 0 ? 'down' : 'up';
    var obj = d3.select(this);//zoomed element
    var parent_obj = d3.select(this.parentNode);//parent of it (left_container, right_container)
    var segment_number=parseInt(parent_obj.attr("segment_number"));
    console.log("zoom: "+segment_number);

    if(segment_number==1)

        if(direction=="down")//if we are in the first segment, we cannot go back
            return;

        else {//we choose some elements on the first segment lets say fps,mmo etc so we get selected element_ids and can get genres
            var get_selected_element_ids=return_selected_ids_in_container(parent_obj);
            console.log("selected_id: "+get_selected_element_ids);

        }
    if(segment_number==3 && direction=="up")//if we are in the last segment, we cannot go further
        return;


    console.log(direction);

     if(!InTransition) {
         (direction=="down")?parent_obj.attr("segment_number",--segment_number):parent_obj.attr("segment_number",++segment_number);
        zoom_event_garbage_collector();
        handle_scroll_event_updated(parent_obj, -1);
    }
}
function zoom_event_garbage_collector(){//can be add any feature to remove on zoom event


    d3.selectAll(".clicked").each(function (d, i) {

        var obj = d3.select(this);
        var parent_obj = d3.select(this.parentNode);
        var element_index=obj.attr("index");

        obj.attr("fill","black");
        /*
        var event = document.createEvent('SVGEvents');
        event.initEvent("click",true,true);
        this.dispatchEvent(event);
        */
        remove_line(element_index);
        obj.attr("related_line_number",null);
        obj.classed("clicked", false);
        obj.on('.zoom', null);


        parent_obj.selectAll(".small_selection_ball").remove();


    });
}/*
function mousedown(d) {
    console.log("coordinates: "+d3.event.pageX+"  "+d3.event.pageY+"py");
}
*/
function mouseClick(d) {
    var obj = d3.select(this);
    var parent_obj = d3.select(this.parentNode);

    var element_index=obj.attr("index");
    var clicked_object_count = d3.selectAll(".clicked").size();

    if (!InTransition) {
        if (!obj.classed("clicked") && clicked_object_count<3) {//at most 3 clicked object
            obj.classed("clicked", true);
            obj.transition().attr("fill", "red");
            obj.call(d3.zoom()
                .on("zoom", zoom));

            obj.on("dblclick.zoom", null);



            var line_number=handle_graph(element_index);
            obj.attr("related_line_number",line_number);// used for coloring small selection ball


            parent_obj.selectAll(".hover_hexagon").remove();
            parent_obj.selectAll(".small_selection_ball")
                        .attr("id","point_of_line"+line_number);

        }

        else {
            if (obj.classed("clicked")) {
                console.log("deselect");
                obj.classed("clicked", false);
                obj.transition().attr("fill", "black");
                obj.on('.zoom', null);

                remove_line(element_index);
                obj.attr("related_line_number",null);
                parent_obj.selectAll(".small_selection_ball").remove();
                obj.dispatch("mouseover");
            }
        }

    }
}

function mouseup() {

}
function mouseover(d,i) {

    var obj = d3.select(this);
    var parent_obj = d3.select(this.parentNode);
    var element_index=obj.attr("index");




    if (!InTransition) {
        //common event for already selected and hovered / not selected and hovered element
        obj.classed("selected", true);

        var startPoint = pathStartPoint(obj.node());


        var circle = parent_obj.append("circle")
            .attr("cx", startPoint.x)
            .attr("cy", startPoint.y)
            .attr("r", hover_point_radius)
            .classed("small_selection_ball", true);

        if (!obj.classed("clicked")) {//hovering not selected element

            var obj_c_x = parseFloat(obj.attr("cx"));
            var obj_c_y = parseFloat(obj.attr("cy"));
            circle.attr("fill", point_hover_color);
            obj.attr("fill", "rgba(255,0,0,0.4)");


            create_hover_hexagon(obj_c_x,obj_c_y,parent_obj);

        }
        else{//hovering already selected element
            var line_number=obj.attr("related_line_number");
            circle.attr("id","point_of_line"+line_number);

        }

        transition(circle,obj,startPoint);






        //var xPosition = parseFloat(d3.select(this).attr("x")) + xScale.bandwidth() / 2;
        //var yPosition = parseFloat(d3.select(this).attr("y")) / 2 + height / 2;

        /*var index = d3.select(this).attr("index")
        var rank = (index ? parseInt(index, 10) + 1 : 0)
        var platform = d3.select(this).attr("container")
        
        gameData = getGameDataByRank(1, 12, 2017, rank, platform)
        title = gameData['Name']
        players = gameData['Daily Peak']

        d3.select("#tooltip")
            .style("left", obj_c_x*2 + "px")
            .style("top", obj_c_y *2+ "px")
            .select("#title")
            .text(title);

        d3.select("#tooltip")
            .select("#rank")
            .text(rank);

        d3.select("#tooltip")
            .select("#players")
            .text(players);

        d3.select("#tooltip").classed("hidden", false);*/



        //obj.attr("fill", "url(assets/placeholder.png)")

    }
}
function mouseout() {

    var parent_obj = d3.select(this.parentNode);

    if (!InTransition) {

        canvas.selectAll(".small_selection_ball").remove();
        if(!d3.select(this).classed("clicked"))
            d3.select(this).attr("fill", "black");
        d3.select("#tooltip").classed("hidden", true);
        parent_obj.selectAll(".hover_hexagon").remove();

    }
}

function transition(trans_obj,path,startpoint) {

   if(d3.selectAll(".selected").empty()==true)
        return;

    trans_obj.transition()
        .duration(point_transition_time)
        .attrTween("transform", translateAlong(path.node(),startpoint))
        .on("end",function () {
                transition(trans_obj,path,startpoint);
        });
}

function translateAlong(path,startpoint) {

    var l = path.getTotalLength();

    return function(i) {
        return function(t) {
            var p = path.getPointAtLength(t * l);
            var real_x=p.x-startpoint.x;
            var real_y=p.y-startpoint.y;

            return "translate(" + real_x + "," + real_y + ")";//Move marker
        }
    }

}

function pathStartPoint(path) {

    var midpoint = path.getPointAtLength(path.getTotalLength()/2);

    return midpoint;
}

/*function create_hexagon_shape(container,container_name,radius,x,y,padding,element_number){

    var floor_number=element_number/6;
    var remaining=element_number%6;


    for (var i=0;i<floor_number;i++){
        for (var k=0;k<6;k++){
            var center_diff= calculate_hexagon_center(k,i+1,padding,radius);
            var small_hexagon=container.append("path")
                .attr("d", drawPolygon(calculate_hexagon(x+center_diff.x,y+center_diff.y,radius)))
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

            small_hexagon.transition()
                .duration(10000)
                .attr("transform", "translate(" + (-center_diff.x) + ", " + (-center_diff.y) + ")")
                .style("fill", "black");
        }

    }
    if(remaining>0){
        console.log(remaining);
        for (var z=0;z<remaining;z++){
            var center_diff= calculate_hexagon_center(z,i+1,padding,radius);
            var small_hexagon=container.append("path")
                .attr("d", drawPolygon(calculate_hexagon(x+center_diff.x,y+center_diff.y,radius)))
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

}*/

function hexagon_creation_by_angle(container,base_index,container_name,radius,x,y,padding,element_number){

    var radius_arr=[];
    var angle=[];
    var floor_number = (element_number>6) ? 2:1;//if element number is bigger than 6 then we will build 2 floor
    var floor_base_index=base_index;//starting index of this container
    for (var i=0;i<floor_number;i++) {
        var distance = (radius * Math.sqrt(3) / 2) + ((i * 2 + 1) * radius* Math.sqrt(3) / 2) + ((i + 1) * padding);
        radius_arr=[];
        angle=[];
        radius_arr.push(distance);
        angle.push(0);
        for (var z=0;z<i;z++) {
            var curr_angle = 360 / ((z + 2) * 6);
            var radians = (Math.PI / 180) * curr_angle;
            radius_arr.push(Math.cos(radians) * distance);
            angle.push(curr_angle);

        }
        for (var l = 0; l < radius_arr.length; l++) {
            for (var k = 0; k < 6; k++) {
                var angle_c=30+angle[l]+60*(k);
                var radians = (Math.PI / 180) * angle_c;

                var d_center_diff_x = x + Math.cos(radians) * radius_arr[l];
                var d_center_diff_y = y + Math.sin(radians) * radius_arr[l];
                //var center_diff = rotate(x, y, d_center_diff_x, d_center_diff_y, (angle * k));
                var unique_index=floor_base_index+l*6+k;
                if((unique_index-base_index)==element_number)//we reached aimed element number
                    return unique_index;
                var small_hexagon = container.append("path")
                    .attr("d", drawPolygon(calculate_hexagon(d_center_diff_x, d_center_diff_y, radius)))
                    .attr("stroke", "red")
                    .attr("stroke-dasharray", "20,5")
                    .attr("stroke-width", 3)
                    .attr("cx", d_center_diff_x)
                    .attr("cy", d_center_diff_y)
                    .attr("floor", i)
                    .attr("hexagon-type", "neigbourhood")
                    .attr("container",container_name)
                    .attr("index", unique_index)
                    .on("click", mouseClick)
                    .on("mouseup", mouseup)
                    .on("mouseover", mouseover)
                    .on("mouseout", mouseout);


            }

        }
        floor_base_index=floor_base_index+radius_arr.length*6

    }
    return unique_index;
}
