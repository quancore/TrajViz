// MAKE THE PLOTS RESPONSIVE
(function() {
  console.log("responsive");
  var d3 = Plotly.d3;
  var width_multiplier = 0.95,
      height_multiplier = 0.95;

  var gd3 = d3.selectAll(".responsive-plot");
      // .style({
      //   width: WIDTH_IN_PERCENT_OF_PARENT + '%',
      //   'margin-left': (100 - WIDTH_IN_PERCENT_OF_PARENT) / 2 + '%',
      //
      //   height: HEIGHT_IN_PERCENT_OF_PARENT + 'vh',
      //   //'margin-top': (100 - HEIGHT_IN_PERCENT_OF_PARENT) / 8 + 'vh'
      //   'margin-top': "1" + 'vh'
      //
      // });

  var nodes_to_resize = gd3[0]; //not sure why but the goods are within a nested array
    for (var i = 0; i < nodes_to_resize.length; i++) {
      var parent_obj=d3.select(nodes_to_resize[i].parentNode).node();

      var update = {
        width: parent_obj.getBoundingClientRect().width*width_multiplier,
        height:parent_obj.getBoundingClientRect().height*height_multiplier
      };
      Plotly.relayout(nodes_to_resize[i].id, update);
      //Plotly.Plots.resize(nodes_to_resize[i]);
    }
})();
