$(document).ready(function() {
insert_data_slider();
});


var layout = {
	margin: {
	l: 0,
	r: 0,
	b: 0,
	t: 0,
	//autosize: true
	},
	scene:{
	xaxis: {
	title: 'x',
	titlefont: {
	family: 'Courier New, monospace',
	size: 12
	}
	},
	yaxis: {
	title: 'y',
	titlefont: {
	family: 'Courier New, monospace',
	size: 12
	}
	},
	zaxis: {
	title: 'Frame number',
	titlefont: {
	family: 'Courier New, monospace',
	size: 12
	}
	}
	}
};
var sub_layout = {
	margin: {
	l: 0,
	r: 0,
	b: 0,
	t: 0,
	//autosize: true
	},
	scene:{
	xaxis: {
	title: 'x',
	titlefont: {
	family: 'Courier New, monospace',
	size: 12
	}
	},
	yaxis: {
	title: 'y',
	titlefont: {
	family: 'Courier New, monospace',
	size: 12
	}
	}
	}
};




var colors = ["#db4444", "#6e5252", "#dbb7a4", "#6e6e22", "#44dba9", "#52656e", "#54226e", "#6e2222", "#000000", "#dba944", "#a9db44", "#a4dbc9", "#4476db", "#db44db", "#dba4a4", "#db7644", "#6e6552", "#226e22", "#44a9db", "#4444db", "#dba4db"]
var num_of_color = 20;
var marker_arr = ["circle", "circle-open", "square", "square-open", "diamond", "diamond-open", "cross", "x" ];

var plot = "plot";
var subplot = "plot2";

var whole_slider_arr = [];
var alg_slider_arr = [];
var step_number = 10000;
var step_number_temporal = 100000;
var precision = 3;
var range_multiplier = 0.05;
var data_percentage = 100;
var slider_initilized = false;
var packed_values;
var drawed_traj_num = 0;
var adding_order = 0;
var trace_dict = {};

var handlers_binded = false;

$( document ).ajaxStart(function() {
	//slider = document.getElementById('dataslider').node();
	for(var i = 0; i<whole_slider_arr.length;i++){
		whole_slider_arr[i].disable();
	}
	$('#alg_submit_btn').attr('disabled', true);

});


$( document ).ajaxStop(function() {
	for(var i = 0; i<whole_slider_arr.length;i++){
		whole_slider_arr[i].enable();
	}
	$('#alg_submit_btn').attr('disabled', false);

});


	function hover_datapoint(data){
		//console.log("hovered")
				var infotext = data.points.map(function(d){
					return (d.data.name+': x= '+d.x+', y= '+d.y.toPrecision(3));
				});
				//console.log(infotext);
	}
function click_datapoint(data){
	console.log("***********************");
	console.log("clicking is called");
	console.log(data);
	var cluster_num = data.points[0].curveNumber;
	var x = packed_values[cluster_num].x;
	var y = packed_values[cluster_num].y;
	var frame_num = packed_values[cluster_num].frame_num;


	var name = "cluster "+cluster_num;

	var color = colors[cluster_num%num_of_color];
	var traj_nums = packed_values[cluster_num].traj_num;
	console.log(traj_nums);

	var markers_shuffled = shuffle(marker_arr);
	var starting_marker = markers_shuffled[0];
	var other_marker = markers_shuffled[1];




	var unique_traj_nums =  Array.from(new Set(traj_nums));
	console.log(unique_traj_nums);

	var plt_div = document.getElementById(subplot);
	var point_data_trace = [];
	for(var i = 0; i<unique_traj_nums.length;i++)
	{
		var point_index = find_occurences(traj_nums, unique_traj_nums[i]);
		var traj_num = unique_traj_nums[i];
		var x_selected = index_selector(x, point_index);
		var y_selected = index_selector(y, point_index);
		var frame_selected = index_selector(frame_num, point_index);


		var show_legend = i === 0 ? true : false ;
		var markers = build_traj_markers(starting_marker, other_marker, x.length);
		var marker_size = build_traj_markers(20, 12, x.length);
		var hover_text =  create_frame_hovertext(("trajectory number: " + traj_num), "frame number: ", frame_selected);
		var trace;
		if(data.points[0].data.name === "noise"){
			console.log("noise");
			name = "noise"
		 	trace = {
			name:name,
			x: x_selected,
			y: y_selected,
			mode: 'markers',
			legendgroup: cluster_num,
			marker: {
				//symbol : markers,
				size: 12,
				color:color,
				opacity: 1,
			},
			showlegend: show_legend,
			hovertext:hover_text,
			type: 'scatter'
		};
	}
	else{
		 	trace = {
			name:name,
			x: x_selected,
			y: y_selected,
			mode: 'lines+markers',
			legendgroup: cluster_num,
			marker: {
				symbol : markers,
				size: marker_size,
				color:color,
				opacity: 0.9,
			},
			showlegend: show_legend,
			hovertext:hover_text,
			type: 'scatter'
		};
	}

		point_data_trace.push(trace);
	}



		if(cluster_num.toString() in trace_dict){
			console.log("remove existing click existing");
			var starting_plot_index = trace_dict[cluster_num][0], adding_order_cluster = trace_dict[cluster_num][1];
			delete_traj_from_graph(plt_div, trace_dict, cluster_num, unique_traj_nums.length, adding_order_cluster);
			delete trace_dict[cluster_num];
			drawed_traj_num-=unique_traj_nums.length;
		}
		else{
			trace_dict[cluster_num] = [drawed_traj_num, adding_order];
			if(drawed_traj_num == 0){
				console.log("new graph");
				Plotly.react(plt_div, point_data_trace, sub_layout);
				$.getScript("static/js/plot_responsive.js");
			}
			else{
				console.log("add trace to existing grph ");
				Plotly.addTraces(plt_div, point_data_trace);
				}
			drawed_traj_num+=unique_traj_nums.length;
			adding_order+=1;
		}
			if(drawed_traj_num<=0){
				console.log("purging");
				Plotly.purge(plt_div);
				drawed_traj_num = 0, adding_order = 0;
				trace_dict= {};

			}

			// var c =  document.getElementById("plot2").on('plotly_click', function(data){
			// 	console.log("clicked");
			// console.log(data);
			// });
}

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}


function delete_traj_from_graph(div, cluster_dict, key_ , element_number, adding_order_cluster){
	cluster_dict = reorder_dict(cluster_dict, adding_order_cluster, element_number)
	var starting_index = cluster_dict[key_][0], curr_element_order = cluster_dict[key_][1];
	console.log("starting: ", starting_index, "elements: ", element_number);

	var deleted_items = [];
	for(var i = starting_index; i<starting_index+element_number; i++){
		console.log(i);
		deleted_items.push(i);
	}
	Plotly.deleteTraces(div, deleted_items);
}

function reorder_dict(cluster_dict, adding_order_cluster, element_number){
	var reduce_order_num = false;
	for (var key in cluster_dict) {
    // check if the property/key is defined in the object itself, not in parent
    if (cluster_dict.hasOwnProperty(key)) {
        console.log(key, cluster_dict[key]);
				var starting_plot_index = cluster_dict[key][0], curr_element_order = cluster_dict[key][1];
				if(curr_element_order>adding_order_cluster){
					starting_plot_index-=element_number;
					curr_element_order-=1;
					cluster_dict[key] = [starting_plot_index, curr_element_order];
					reduce_order_num = true;
				}
    }
}
	if(reduce_order_num)
		adding_order-=1;

	return cluster_dict;
}
function purge_subplot(){
	var plt_div = document.getElementById(subplot);
	Plotly.purge(plt_div);
	drawed_traj_num = 0, adding_order = 0;
	trace_dict = {};
}



function build_traj_markers(starting_marker, other_marker, element_number){
	var marker = [];
	marker.push(starting_marker);
	for(var i=0; i<element_number-1;i++)
		marker.push(other_marker);

	return marker;
}

function hook_event_listener(plot){
	console.log("hooked");
	//plot.on('plotly_hover',hover_datapoint);
	plot.on('plotly_click', click_datapoint);
}

function submit_alg(){
	if(alg_slider_arr[0].isEnabled()){
		var pts = alg_slider_arr[0].getValue();
		var spatial = alg_slider_arr[1].getValue();
		var temporal = alg_slider_arr[2].getValue();
		send_alg_param(pts, spatial, temporal*1000);
	}
	else{
		console.log("No submit");
	}
}


const index_selector = (arr, index)=>index.map(i => arr[i])

function insert_data_slider(){
	var slider = new Slider("#dataslider", {
 		 ticks: [0, 25, 50, 75, 100],
 		 ticks_labels: ['0', '25', '50', '75', '100'],
 		 ticks_snap_bounds: 5,
		 value:100
  });
	whole_slider_arr.push(slider)
	slider.on("slideStop", changed)
}



function handle_alg_sliders(values){
	var params = create_alg_parameters(values);
	if (!slider_initilized){
		insert_algorithm_slider(params.min_pts, params.max_pts, params.spatial_min , params.spatial_max, params.temporal_min, params.temporal_max, values.alg_param);
		slider_initilized = true
	}
	else{
		update_algorithm_slider(alg_slider_arr[0], params.min_pts, params.max_pts, values.alg_param.pts);
		update_algorithm_slider(alg_slider_arr[1], params.spatial_min, params.spatial_max, values.alg_param.spatial);
		update_algorithm_slider(alg_slider_arr[2], params.temporal_min, params.temporal_max, values.alg_param.temporal, 'temporal');
	}
}

function create_alg_parameters(values){
	var row_ids = values.row_ids
	,frame_num = values.frame_num, x = values.x, y = values.y;
	var spatial_max = Math.max(Math.max.apply(Math, x),Math.max.apply(Math, y), values.alg_param.spatial);
	//var spatial_min = Math.max(Math.min.apply(Math, x),Math.min.apply(Math, y));
	var spatial_min = 0;

	var temporal_max = (0.4*Math.max.apply(Math, frame_num))*range_multiplier;
	var temporal_min = (0.4*Math.min.apply(Math, frame_num));
	var min_pts = 0;
	var max_pts = row_ids.length*range_multiplier;
	return{
		spatial_max:spatial_max,
		spatial_min:spatial_min,
		temporal_max:temporal_max,
		temporal_min:temporal_min,
		min_pts:min_pts,
		max_pts:max_pts
	}
}

function update_algorithm_slider(slider, min_val, max_val, curr_val, type = 'no_temporal')
{
	if (type === 'temporal'){
		var step = ((max_val - min_val)/step_number_temporal).toPrecision(precision);

	}
	else{
		var step = ((max_val - min_val)/step_number).toPrecision(precision);

	}
	slider.setAttribute(
	{
		max:max_val,
		min:min_val,
		step:step,
		value:curr_val
});

}

function insert_algorithm_slider(minpts, maxpts, min_spatial, max_spatial, min_temporal, max_temporal, curr_vals){
	var pts_step = ((maxpts - minpts)/step_number).toPrecision(precision);
	var spatial_step = ((max_spatial - min_spatial)/step_number).toPrecision(precision);
	var temporal_step = ((max_temporal - min_temporal)/step_number_temporal).toPrecision(precision);

	var slider = new Slider("#minpts", {
 		 //ticks: [0, 25, 50, 75, 100],
		 max:maxpts,
		 min:minpts,
 		 //ticks_labels: ['0', '25', '50', '75', '100'],
 		 //ticks_snap_bounds: 5,
		 value:curr_vals.pts,
		 step:pts_step
  });
	whole_slider_arr.push(slider)
	alg_slider_arr.push(slider)


	var slider2 = new Slider("#spatialth", {
		max:max_spatial,
		min:min_spatial,
		//ticks_labels: ['0', '25', '50', '75', '100'],
		//ticks_snap_bounds: 5,
		value:curr_vals.spatial,
		step:spatial_step
});
whole_slider_arr.push(slider2)
alg_slider_arr.push(slider2)


var slider3 = new Slider("#temporalth", {
	max:max_temporal,
	min:min_temporal,
	//ticks_labels: ['0', '25', '50', '75', '100'],
	//ticks_snap_bounds: 5,
	value:curr_vals.temporal,
	step:temporal_step
});
whole_slider_arr.push(slider3)
alg_slider_arr.push(slider3)
}

function changed(newValue) {
	console.log(newValue);
	send_percentage(newValue)
}

function send_percentage(percent) {
	console.log("called");
        $.getJSON(Flask.url_for("percentage_data"), {
        percentage:percent
        }, function(data) {
            var response = JSON.stringify(data);
						var myPlot = document.getElementById(plot);
						console.log(response);
						data_percentage = percent;
						purge_subplot();
						graph_init(response, myPlot)
            });
}


function send_alg_param(pts,spatial,temporal) {
	console.log("called");
        $.getJSON(Flask.url_for("run_dbcsan"), {
        pts:pts,
				spatial:spatial,
				temporal:temporal,
				percent:data_percentage
        }, function(data) {
            var response = JSON.stringify(data);
						console.log("returned json after param setting");
						var myPlot = document.getElementById(plot);
						purge_subplot();
						graph_init(response, myPlot)
            });
}


function graph_init(json, div)
{
var handled_json_arr = handle_json_data(json);
var packed_values = pack_values(handled_json_arr);
draw_graph(packed_values, div);
//insert_data_slider();
}

function handle_json_data(json){
  //coloumns = ['Row_ID', 'frame_num', 'ped_id', 'x', 'y', 'cluster']
  const arrayColumn = (arr, n) => arr.map(x => x[n]);
  var results = JSON.parse(json);
	var alg_param = results[0];
	console.log("algs param");
	console.log(alg_param);

	results = results.slice(1, results.length);
	console.log("remaining array");
	console.log(results);
  var row_ids = arrayColumn(results, 0);
  var frame_num = arrayColumn(results, 1);
  var ped_id = arrayColumn(results, 2);
  var x = arrayColumn(results, 3);
  var y = arrayColumn(results, 4);
  var cluster = arrayColumn(results, 5);
	var traj_num = arrayColumn(results, 6);


  return{
		alg_param:{pts:alg_param[0],spatial:alg_param[1],temporal:(alg_param[2]/1000)},
    row_ids:row_ids,
    frame_num:frame_num,
    ped_id:ped_id,
    x:x,
    y:y,
    cluster:cluster,
		traj_num:traj_num
  }
}


function pack_values(values){
	handle_alg_sliders(values);
	var packed_values = [];
	var cluster_arr = values.cluster, row_ids = values.row_ids
	,frame_num = values.frame_num, x = values.x, y = values.y, ped_id = values.ped_id
	,traj_num = values.traj_num;
	var unique_clusters = Array.from(new Set(cluster_arr));
	for (var i = 0; i < unique_clusters.length; i++) {
	  var cluster_index = find_occurences(cluster_arr, unique_clusters[i]);
	  packed_values.push({
	    cluster:unique_clusters[i],
	    row_ids : index_selector(row_ids, cluster_index),
	    frame_num : index_selector(frame_num, cluster_index),
	    ped_id : index_selector(ped_id, cluster_index),
	    x : index_selector(x, cluster_index),
	    y : index_selector(y, cluster_index),
			traj_num : index_selector(traj_num, cluster_index)
	  });
	}
	return packed_values;

}

function draw_graph(values, div){
	packed_values = values;
  var data = [];
  for (var i = 0; i < values.length; i++) {
    var cluster = values[i].cluster;
		var cluster_name = "cluster "+i
		var text = create_hovertext(values[i].x, values[i].y, values[i].frame_num);
		var color = colors[i%num_of_color];

		if(cluster == -1)
			cluster_name = "noise"


    var trace = {
    	x:values[i].x, y: values[i].y, z: values[i].frame_num,
    	mode: 'markers',
			name: cluster_name,
    	marker: {
    		size: 8,
    		line: {
    		//color: 'rgba(217, 217, 217, 0.14)',
    		width: 0.5},
				color:color,
    		opacity: 0.9,
			},
			text:text,
			hoverinfo:"text",
			hovertext:"",
    	type: 'scatter3d'
    };
    data.push(trace);

  }
  Plotly.react(div, data, layout);
	if(!handlers_binded){
		hook_event_listener(div);
		handlers_binded = true;
	}
}
function create_hovertext(x, y, frame_num){
	var x_base = "x: ", y_base = "y: ", z_base = "frame number: ";
	var hovertext = []
	for (var i = 0; i<x.length; i++){
		var text = x_base+x[i]+"<br>"+y_base+y[i]+"<br>"+z_base+frame_num[i];
		hovertext.push(text);
	}
	return hovertext;
}

function create_frame_hovertext(traj_text, text_base, frame_num){
	var hovertext = []
	for (var i = 0; i<frame_num.length; i++){
		var text = traj_text+"<br>"+text_base+frame_num[i];
		hovertext.push(text);
	}
	return hovertext;
}


function find_occurences(array,element){
  var counts = [];
    for (i = 0; i < array.length; i++){
      if (array[i] === element) {
        counts.push(i);
      }
    }
  return counts;
}
