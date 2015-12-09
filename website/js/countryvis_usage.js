/**
	CountryUVis object
**/


CountryUVis = function(_parentElement, _data){
	this.parentElement = _parentElement;
    this.data = _data;

    //instantiate display data variables -- each holds an array of energy data values for the selected country
    this.totalData = null;
    this.altData = null;
    this.metaData = null;

    // define all "constants" 
    this.margin = {top: 20, right: 0, bottom: 30, left: 70},
    this.width = 420 - this.margin.right - this.margin.left
    this.height = 220 -this.margin.bottom - this.margin.top

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
CountryUVis.prototype.initVis = function(){
    var that = this

	//append svg element
	this.svg = this.parentElement.append("svg")
      .attr("width", this.width + this.margin.right + this.margin.left)
        .attr("height", this.height + this.margin.top +this.margin.bottom)
        .attr("id", "usage")
        .style("background-color", "#F5F5F5")
      .append("svg")
      .attr("width", this.width + this.margin.right + this.margin.left - 15)
        .attr("height", this.height + this.margin.top +this.margin.bottom)
      .append("g")
        .attr("transform", "translate(10," + 8 + ")")


    // filter, aggregate, modify data
    this.wrangleData();

    // creates axis and scales
    this.x = d3.scale.linear()
      .range([0, this.width - 25]);

    this.y = d3.scale.linear()
      .range([this.height, 0]);

    this.color = d3.scale.category20();

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom")
      .tickFormat(d3.format("d"))
      .tickSize(-this.height, 0, 0);

    this.yAxis = d3.svg.axis()
      .scale(this.y)
      .orient("left")
      .ticks(7)
      .tickSize(-this.width, 0, 0);

      yearscale = d3.scale.ordinal()

        yearscale.range(d3.range(1960, 2014))
        yearscale.domain(d3.range(0, 53))

    this.area = d3.svg.area()
      .interpolate("monotone")
      .x(function(d, i) { return that.x(yearscale(i))})
      .y0(this.height)
          .y1(function(d) { return that.y(d)});

    //adds visual elements
        // Add axes visual elements
     this.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate("+this.margin.left+"," + (this.height + 10)+")")

    this.svg.append("g")
        .attr("class", "y axis")
        .attr("transform", "translate(" +this.margin.left+ ", "+10+")")


    this.container = this.svg.append("g")
      .attr("class", "area")
      .attr("transform", "translate("+this.margin.left+","+ 10+")")


    this.container2 = this.svg.append("g")
      .attr("class", "area")
      .attr("transform", "translate("+this.margin.left+","+ 10+")")

    this.container3 = this.svg.append("g")
      .attr("class", "area")
      .attr("transform", "translate("+this.margin.left+","+ 10+")")

    this.parentElement.append("p")
      .attr("class", "instr")
      .attr("id", "instr1")
      .style("display", "block")
      .html("SELECT A COUNTRY ON THE MAP<br>TO VIEW ITS ENERGY PROFILE");

    //add axis labels
    this.svg.append("g")
      .append("text")
        .attr("class", "chart_label")
        .attr("id", "chart_label1")
        .attr("transform", "rotate(-90)")
        .attr("x", -30)
        .attr("y", 5)
        .attr("dy", ".71em")
        .style("display", "none")
        .style("text-anchor", "end")
        .text("Energy Consumption (kt)");
      
}


/**
 * Method to wrangle the data. 
  */
CountryUVis.prototype.wrangleData= function(_filter){

    this.filterAndAggregate(_filter);

}


/**
 * Drawing Method
 */
CountryUVis.prototype.updateVis = function(){
    var that = this ;

    if (this.totalData == null){

        this.svg.selectAll(".x.axis").style("display", "none")
        this.svg.selectAll(".y.axis").style("display", "none")
        this.svg.selectAll(".area").style("display", "none")

        d3.selectAll("#instr1").style("display", "").html("NO ENERGY DATA FOR SELECTION.<br> PLEASE CHOOSE AGAIN.");
        d3.selectAll("#legend").style("display", "none");
        d3.selectAll("#instr1").style("margin-left", "-5px");
        d3.selectAll("#chart_label1").style("display", "none");


    }

    else{

    this.svg.selectAll(".area").style("display", "")
    this.svg.selectAll(".x.axis").style("display", "")
    this.svg.selectAll(".y.axis").style("display", "")
    d3.selectAll("#country_text").style("display", "").html("<strong>Country selected: </strong>"+ this.metaData +" <br>")
    d3.selectAll("#instr1").style("display", "none")
    d3.selectAll("#legend").style("display", "block");
    d3.selectAll("#chart_label1").style("display", "block");
    //d3.selectAll("#instr1").style("margin-left", "0px");

    
    var ymax = Math.max.apply(null, that.totalData)

   
    this.x.domain([1960, 2013]);
    this.y.domain([0, ymax]);

    // updates axis
    this.svg.select(".x.axis")
        .call(this.xAxis);

    this.svg.select(".y.axis")
        .call(this.yAxis)


    // updates graph
    var path = this.container.selectAll(".area")
      .data([this.totalData])

    path.enter()
      .append("path")
      .attr("class", "area")
      .attr("fill", "#7D684C")

    path
      .transition()
      .attr("d", this.area);

    path.exit()
      .remove();

    var path2 = this.container2.selectAll(".area")
        .data([this.combData])

    path2.enter()
      .append("path")
      .attr("class", "area")
      .attr("fill", "#64993C")

    path2
      .transition()
      .attr("d", this.area);

    path2.exit()
        .remove();

    var path3 = this.container3.selectAll(".area")
        .data([this.altData])

    path3.enter()
      .append("path")
      .attr("class", "area")
      .attr("fill", "#A6C259")

    path3
      .transition()
      .attr("d", this.area);

    path3.exit()
        .remove();


  }

}


/**
 * Gets called by event handler and should create new aggregated data
 */
CountryUVis.prototype.onSelectionChange= function (country){

    //define filter
    var filter = function (d) {if(d.country_id == country) {return true}
                    else {return false}
                }

    d3.selectAll("#instr1").style("display", "none")

     // call wrangle function and update view
    this.wrangleData(filter);

    this.updateVis();


}


CountryUVis.prototype.filterAndAggregate = function(_filter){

    this.totalData = null;
    this.altData = null;
    this.combData = null;
    this.metaData = null;

    var that = this;

    var filter = function(){return false;}
    if (_filter != null){
        filter = _filter;
    }

    this.data.forEach(function(d){
        if (filter(d)){

        //update display data variables to contain data for selected country
        that.totalData = d.total_energy_use
        that.altData = fixup(d.alt_energy_use, d.total_energy_use)
        that.metaData = d.name

        that.combData = fixup(d.comb_energy_use, d.total_energy_use).map(function(d, i){ return d + that.altData[i]})
        
        // var array2 = fixup(d.comb_energy_use, d.total_energy_use)
        // var stacked = [{"name": "alt", "values": array1.map(function(d,i){ return {"x": i, "y": d} })},{"name":"comb", "values": array2.map(function(d, i){
        //     return {"x": i, "y": d}
        // })}]

        // that.stackedData = stacked
        }
    })

    //function which converts alternative and nuclear data values from percentages to totals
    function fixup (array1, array2){
        var newarray = []
        array1.forEach(function(d,i){
            if (d>0){
                newarray.push(d*array2[i]/100)
            }
            else {
                newarray.push(-1)
            }
        })
        return newarray
    }

}