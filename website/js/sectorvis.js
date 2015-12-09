function sankey() {

var new_data = []; // a global

d3.json("data/sector_data.json", function(error, json) {
  if (error) return console.warn(error);
  var data = json;

  data.links.forEach(function(d) {
    //console.log(d, d.value);
    if (d.source == "Coal") {d.value = (d.value/100)*20;}
    else if (d.source == "Nuclear") {d.value = (d.value/100)*8;}
    else if (d.source == "Petroleum") {d.value = (d.value/100)*36;}
    else if (d.source == "Natural Gas") {d.value = (d.value/100)*26;}
    else if (d.source == "Renewable Energy") {d.value = (d.value/100)*9;}
    //console.log(d.value);
    new_data.push([d.source, d.target, parseFloat(d.value)]);
  })

  console.log(new_data);
});


google.load("visualization", "1.1", {packages:["sankey"]});
      google.setOnLoadCallback(drawChart);

      function drawChart() {
        var data = new google.visualization.DataTable();
        data.addColumn('string', 'From');
        data.addColumn('string', 'To');
        data.addColumn('number', 'Weight');
        data.addRows(new_data);    

        // Sets chart options.
        var options = {
          sankey: { node: { nodePadding: 2 } ,
                    link: { color: { fill: "#C7C9C9" } } },
        };

        // Instantiates and draws our chart, passing in some options.
        var chart = new google.visualization.Sankey(document.getElementById('sankey_basic'));
        chart.draw(data, options);
      }
}




