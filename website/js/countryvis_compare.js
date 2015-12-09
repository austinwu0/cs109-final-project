/**
	CountryPVis object
**/


CountryPVis = function(_parentElement, _co2data){
	this.parentElement = _parentElement;
    this.data = _co2data

    this.displayData = null

    // define all "constants" 
    this.margin = {top: 20, right: 50, bottom: 30, left: 70},
    this.width = 420 - this.margin.right - this.margin.left
    this.height = 220 -this.margin.bottom - this.margin.top

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
CountryPVis.prototype.initVis = function(){
    var that = this

	//append svg element
	this.svg = this.parentElement.append("svg")
      .attr("width", this.width + this.margin.right + this.margin.left)
        .attr("height", this.height + this.margin.top +this.margin.bottom)
        .attr("id", "compare")
        .style("background-color", "#F5F5F5")
      .append("svg")
      .attr("width", this.width + this.margin.right + this.margin.left - 15)
        .attr("height", this.height + this.margin.top +this.margin.bottom)
      .append("g")
        .attr("transform", "translate("+ -5 +"," + 18 + ")")

    // filter, aggregate, modify data
    this.wrangleData();

    // creates axis and scales
    this.x = d3.scale.linear()
      .range([0, this.width-15])

    this.y_pop = d3.scale.linear()
      .range([this.height-10, 0]);

    this.y_gdp = d3.scale.linear()
      .range([this.height-10, 0]);

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom")
      .tickFormat(d3.format("d"))
      .tickSize(-this.height + 10, 0, 0);

    this.yAxisPop = d3.svg.axis()
      .scale(this.y_pop)
      .orient("right")
      .ticks(5)
      //.tickSize(-this.width + 15, 0, 0);;

    this.yAxisGdp = d3.svg.axis()
      .scale(this.y_gdp)
      .orient("left")
      .ticks(5)
      //.tickSize(-this.width + 15, 0, 0);  

      yearscale = d3.scale.ordinal()

        yearscale.range(d3.range(1960, 2014))
        yearscale.domain(d3.range(0, 53))

    //creates per capita emissions line generator
    this.line_pop = d3.svg.line()
    .interpolate("basis")
    .x(function(d,i) {return that.x(yearscale(i)); })
    .y(function(d) { return that.y_pop(d); })
        .defined(function(d) { return d; });

    //creates emissions per gdp line generator
    this.line_gdp = d3.svg.line()
    .interpolate("basis")
    .x(function(d,i) {return that.x(yearscale(i)); })
    .y(function(d) { return that.y_gdp(d); })
        .defined(function(d) { return d; });

  
    //adds visual elements
        // Add axes visual elements
     this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+this.margin.left+"," + (this.height)+")")

    this.svg.append("g")
        .attr("class", "y axis left")
        .attr("transform", "translate(" +this.margin.left+ ", "+10+")")
        .style("fill", "#7D684C")

    this.svg.append("g")
        .attr("class", "y axis right")
        .attr("transform", "translate(" + (this.margin.left+this.width-15) + ", "+10+")")
        .style("stroke", "#64993C")

    this.parentElement.append("p")
      .attr("class", "instr")
      .attr("id", "instr2")
      .style("display", "block")
      .html("SELECT A COUNTRY ON THE MAP<br>TO VIEW HOW IT COMPARES TO THE WORLD");


    //add axis label
    this.svg.append("g")
      .append("text")
        .attr("class", "chart_label")
        .attr("id", "chart_label2")
        .attr("transform", "rotate(-90)")
        .attr("x", -15)
        .attr("y", 25)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("display", "none")
        .style("fill", "#7D684C")
        .text("Emissions per $1M GDP (kt)")


    this.svg.append("g")
      .append("text")
        .attr("class", "chart_label")
        .attr("id", "chart_label3")
        .attr("transform", "rotate(90)")
        .attr("x", 177 )
        .attr("y", -400)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .style("display", "none")
        .style("fill", "#64993C")
        .text("Emissions Per 1000 People (kt)")

}


/**
 * Method to wrangle the data. 
  */
CountryPVis.prototype.wrangleData= function(_filter){

    this.filterAndAggregate(_filter);

}


/**
 * Drawing Method
 */
CountryPVis.prototype.updateVis = function(){

    var that = this ;

    if (this.displayData == null){

        console.log("null");

        this.svg.selectAll(".x.axis").style("display", "none")
        this.svg.selectAll(".y.axis.left").style("display", "none")
        this.svg.selectAll(".y.axis.right").style("display", "none")
        this.svg.selectAll(".lineContainer").style("display", "none")
        d3.selectAll("#instr2").style("margin-left", "65px");
        d3.selectAll("#instr2").style("display", "").html("NO DATA FOR SELECTION.<br> PLEASE CHOOSE AGAIN.");
        d3.selectAll("#legend2").style("display", "none");
        d3.selectAll("#chart_label2").style("display", "none");
        d3.selectAll("#chart_label3").style("display", "none");

    }

    else{
    d3.selectAll("#instr2").style("display", "none")
    this.svg.selectAll(".area").style("display", "")
    this.svg.selectAll(".x.axis").style("display", "")
    this.svg.selectAll(".y.axis.left").style("display", "")
    this.svg.selectAll(".y.axis.right").style("display", "")
    d3.selectAll("#legend2").style("display", "block");
    d3.selectAll("#chart_label2").style("display", "block");
    d3.selectAll("#chart_label3").style("display", "block");


  
    var ymax_gdp = Math.max.apply(null, this.displayData[0]["values"])
    var ymax_pop = Math.max.apply(null, this.displayData[1]["values"])

    this.x.domain([1960, 2013]);
    this.y_gdp.domain([0, ymax_gdp])
    this.y_pop.domain([0, ymax_pop]);

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis.left")
        .call(this.yAxisGdp)

    this.svg.select(".y.axis.right")
        .call(this.yAxisPop)

    var color = ["#7D684C", "#64993C"]

    this.svg.selectAll(".lineContainer").remove()

    var container = this.svg.append("g")
      .attr("class", "lineContainer")
      .attr("transform", "translate("+this.margin.left+","+ 10+")")

    // updates graph
    var path = container.selectAll(".line")
      .data(this.displayData)
      .attr("class", "line")

    path.enter()
      .append("path")
      .attr("d", function(d,i){if (i == 0) {return that.line_gdp(d.values)} else {return that.line_pop(d.values)} })
      .attr("fill", "none")
      .style("stroke-width", 1.5)
      .style("stroke", function(d,i){return color[i]});

    path.exit()
      .remove();



  }

}


/**
 * Gets called by event handler and should create new aggregated data
 */
CountryPVis.prototype.onSelectionChange= function (country){

    //define filter
    var filter = function (d) {if(d.country_id == country) {return true}
                    else {return false}
                }

    // d3.selectAll(".instr").style("display", "none")

     // call wrangle function and update view
    this.wrangleData(filter);

    this.updateVis();


}


CountryPVis.prototype.filterAndAggregate = function(_filter){

    this.displayData = null

    var that = this;

    var filter = function(){return false;}
    if (_filter != null){
        filter = _filter;
    }

    var gdp = []
    var pop = []

    this.data.forEach(function(d){
        if (filter(d)){

        that.metaData = d.name

       var emissions_gdp = fixup(d.gdp,d.years).map(function(d){return 1000000*d});
       var emissions_pop = fixup(d.pop, d.years).map(function(d){return 1000*d});

        that.displayData = [{"values": emissions_gdp }, {"values": emissions_pop}]


        }
    })

     function fixup (array1, co2array){
        var newarray = []
        array1.forEach(function(d,i){
            if (d>0 && co2array[i] >0){
                newarray.push(co2array[i]/d)
            }
            else {
                newarray.push(null)
            }
        })
        return newarray
    }

}
