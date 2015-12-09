/**
	CountryPVis object
**/


TempVis = function(_parentElement, _tempdata){
	this.parentElement = _parentElement;
    this.data = _tempdata
    this.displayData = null

    // define all "constants" 
    this.margin = {top: 70, right: 20, bottom: 130, left: 140},
    this.width = 750 - this.margin.right - this.margin.left
    this.height = 500 -this.margin.bottom - this.margin.top
    //console.log(this.data);
    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
TempVis.prototype.initVis = function(){
    var that = this;

	//append svg element
	this.svg = this.parentElement.append("svg")
      .attr("width", this.width + this.margin.right + this.margin.left)
        .attr("height", this.height + this.margin.top +this.margin.bottom)
        .style("background-color", "none")
    .append("g")
        .attr("transform", "translate(" + 0 + ", "+this.margin.top+")")
        

    // creates axis and scales
    this.x = d3.scale.linear()
      .range([0, this.width]);

    this.y = d3.scale.linear()
      .range([this.height, 0]);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom").ticks(20)
      .tickFormat(d3.format("d"))
      .tickSize(-this.height, 0, 0);

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left")
      .tickSize(-this.width, 0, 0);

    this.yearscale = d3.scale.ordinal()

        this.yearscale.range(d3.range(1880, 2015))
        this.yearscale.domain(d3.range(0, 135))


    //creates line generator
    this.line = d3.svg.line()
    .x(function(d,i) { return that.x(that.yearscale(i)); })
    .y(function(d) { return that.y(d/10); });

    // Scale the range of the data
    this.x.domain([1880, 2014]);
    this.y.domain([-8, 8]);

    //adds visual elements
        // Add axes visual elements

     this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+this.margin.left+"," + (this.height + 10)+")")
        .call(this.xAxis)
          .selectAll("text")  
          .attr("dy", "1.5em");

    this.new_y_axis = this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" +this.margin.left+ ", "+10+")")
        .call(this.yAxis)
          .selectAll("text")  
          .attr("dx", "-0.9em");
        

    // Add the valueline path.
    this.svg.append("path")
        .attr("class", "line")
        .attr("transform", "translate(" +this.margin.left+ ", "+10+")")
        .attr("d", this.line(this.data))


    //add tooltips
    /*this.tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-10, 0])
      .html(function(d) {
        return "<strong>Temperature Anomaly:</strong> <span style='color:red'>" + d + "</span>";
      })

    this.svg.call(that.tip);*/
    

    //add nodes on the line graph
    this.svg
      .append("g")
        .attr("transform", "translate(" +this.margin.left+ ", "+10+")")
     .selectAll("circle")
        .data(that.data)
      .enter().append("circle")
        .attr("class", "temp_node")
        .attr("r", 4)
        .attr("cx", function(d,i) { return that.x(that.yearscale(i)); })
        .attr("cy", function(d) { return that.y(d/10); })
        .attr("id", function(d, i) {return "id" + i;})
        .on("mouseover", function(d, i) {
          d3.select(this)
            .transition().duration(100)
            .style("fill","#990033")
            .style("stroke", "none")
            .attr("r", 6);})

        .on("mouseout", function() {
          d3.select(this)
            .transition().duration(100)
            .attr("r", 4)
            .style("fill","none")
            .style("stroke", "grey");
        });

    this.svg
      .append("g")
        .attr("transform", "translate(" +(this.margin.left+590.2985) + ", "+(33.1875)+")")
        .append("circle")
        .attr("class", "flash_node")
        .attr("r", 10);

    setInterval(repeat, 2000);


    function repeat() {
        d3.selectAll(".flash_node")
        .style("fill", "#990033")
        .style("opacity", 1) 
        .transition()
        .duration(1200)
         .style("opacity", 0)
        .attr("r", 15);

    setTimeout( repeat2, 1200);

    };

    function repeat2() {
        d3.selectAll(".flash_node")
        .transition()
        .duration(500)
          
        .attr("r", 10);
    }

    //add axis labels
    this.svg.append("g")
      .append("text")
        .attr("class", "axis_text")
        .attr("transform", "rotate(-90)")
        .attr("x", -80)
        .attr("y", 85)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Temperature Anomaly (C)");

    this.svg.append("g")
      .append("text")
        .attr("class", "axis_text")
        .attr("x", 440)
        .attr("y", 350)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Year");

    //add vertical lines to help with hover
    this.svg
      .append("g")
        .attr("transform", "translate(" +this.margin.left+ ", "+10+")")
     .selectAll("rect")
        .data(that.data)
      .enter().append("rect")
        .attr("class", "temp_line")
        .attr("height", that.height)
        .attr("width", 3)
        .attr("x", function(d,i) {return that.x(that.yearscale(i)); })
        .on("mouseover", function(d, i) {
          var id = String("#id"+i);
          d3.select(id)
            .transition().duration(100)
            .style("fill","#990033")
            .style("stroke", "none")
            .attr("r", 6);

          var text;
          if (i == 134) {
            text = "2014 was the warmest year on record.";
          } else {
            text = that.yearscale(i)+":  " + d/10 + "°C";
          }
          d3.select(".tooltip_temps")
            .style("left", (that.x(that.yearscale(i))+150)+"px")
            .style("top", that.y(d/10)+"px" )
            .style("visibility", "visible")
            .text(text);
          })

        .on("mouseout", function(d, i) {
          var id = String("#id"+i);
          d3.select(id)
            .transition().duration(100)
            .style("fill","none")
            .style("stroke", "grey")
            .attr("r", 4);

          d3.select(".tooltip_temps")
            .style("visibility", "hidden");
        });

    

}
