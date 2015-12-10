        

/*** Create javascript object for first visualization ***/

TwoVis = function(_parentElement, metric, words, color){
  this.parentElement = _parentElement;
    //this.data = _tempdata
    this.displayData = null
    this.metric = metric;
    this.words = words;
    this.color = color;

    // define all "constants" 
    //this.margin = {top: 0, right: 10, bottom: 0, left: 10},

    //console.log(this.data);
    this.initVis();
}

TwoVis.prototype.initVis = function(){
    var that = this;
    var width = 960;
    var height = 700;
  //append svg element
        var rateById = d3.map();

        var quantile = d3.scale.quantile()
          .range(d3.range(11))
        /*var quantile_less = d3.scale.linear()
            .rangeRound([0, 1, 2, 3, 4, 5])//(d3.range(11))

        var quantile_more = d3.scale.linear()
            .rangeRound([6, 7, 8, 9, 10])//(d3.range(11))*/

        var projection = d3.geo.albersUsa()
            .scale(1280)
            .translate([width / 2, height / 2]);

        var path = d3.geo.path()
            .projection(projection);

        var svg = this.parentElement.append("svg")
            .attr("width", width)
            .attr("height", height);

        queue()
            .defer(d3.json, "data/us.json")
            .defer(d3.json, "data/"+that.metric+".json")//, function(d) { console.log(d); rateById.set(d.id, +d.rate); })
            .await(ready);


        var div = d3.select("body").append("div") 
          .attr("class", "tooltip")       
          .style("opacity", 0);

        function median(values) {

            values.sort( function(a,b) {return a - b;} );

            var half = Math.floor(values.length/2);

            if(values.length % 2) return values[half];
            else return (values[half-1] + values[half]) / 2.0;
          }

        function ready(error, us, houses) {
          if (error) throw error;
          houses.forEach(function(d){rateById.set(d.id, +d.value); });
          quantile.domain(rateById.values());
          //quantile_less.domain([Math.min.apply(Math, rateById.values()), median(rateById.values())]);
          //quantile_more.domain([median(rateById.values()), Math.max.apply(Math, rateById.values())]);
          //console.log(Math.log(100));
          //console.log(Math.max.apply(Math, rateById.values()), Math.min.apply(Math, rateById.values()), median(rateById.values()));

        var static_median = median(rateById.values()); 

        var hello = svg.append("g")
              .attr("class", "counties")
            .selectAll("path")
              .data(topojson.feature(us, us.objects.counties).features)
            .enter().append("path")
              .attr("class", function(d) {return that.color + quantile(rateById.get(d.id)) + "-9";})
                //if (rateById.get(d.id) <= static_median) {
                  //console.log(quantile_less(rateById.get(d.id)));
                  //return that.color + quantile_less(rateById.get(d.id)) + "-9";}
                //else {console.log(quantile_more(rateById.get(d.id)));
                  //return that.color + quantile_more(rateById.get(d.id)) + "-9";}
                //})
              .attr("d", path);

              hello.append("svg:title")
              .text(function(d) { return d.id; });

              hello.on("mouseover",  function(d) {
                div.transition()    
                .duration(20)    
                .style("opacity", .7);    
                div.html("County: " + d.id + "<br/>"  + "Value: " + Math.round(rateById.get(d.id)*100)/100)  
                .style("left", (d3.event.pageX + 20) + "px")   
                .style("top", (d3.event.pageY - 50) + "px");  
                d3.select(this)
                .attr("class", "hover")})
              .on("mouseout", function(d) {
                div.transition()    
                .duration(20)    
                .style("opacity", 0); 
                d3.select(this)
                .attr("class", function(d) {return that.color + quantile(rateById.get(d.id)) + "-9"; })});

          var g = svg.append("path")
              .datum(topojson.mesh(us, us.objects.states, function(a, b) { return a !== b; }))
              .attr("class", "states")
              .attr("d", path);

          svg.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .text(that.words);

        
          var zoom = d3.behavior.zoom()
          .on("zoom",function() {
            hello.attr("transform","translate("+d3.event.translate.join(",")+")scale("+d3.event.scale+")");
            g.attr("transform","translate("+d3.event.translate.join(",")+")scale("+d3.event.scale+")");
          });

        svg.call(zoom);

        /*var text = svg.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .text("reset");

        text.on("click", function(d) {console.log("hello");
          zoom.translate([0, 0]).scale(1);
          console.log(zoom.scale());});*/
          
        }

        d3.select(self.frameElement).style("height", height + "px");


  

}

        