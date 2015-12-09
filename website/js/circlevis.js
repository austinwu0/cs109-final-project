/**
	CircleVis object
**/


CircleVis = function(_parentElement, _co2data){
	this.parentElement = _parentElement;
    this.data = this.initData(_co2data)

    // define all "constants" 
    this.margin = {top: 20, right: 0, bottom: 30, left: 70},
    this.width = 1100 
    this.height = 600
    this.year = 1960

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
CircleVis.prototype.initVis = function(){

    var that = this

	//append svg element
	this.svg = this.parentElement.append("svg")
      .attr("width", this.width)
      .attr("id", "map")
      .attr("height", this.height)
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

    this.force = d3.layout.force()
        .size([that.width, that.height])
        .charge(-50)
        .linkDistance(10)

    var scalemax = 0

    this.data.forEach(function(d, i){
        if (parseInt(d.emissions) > scalemax){
            scalemax = d.emissions
        }
    })

    this.scale = d3.scale.linear().range([3, 80]).domain([0,scalemax])

    this.node = this.svg.append("g").selectAll(".node")
        .data(this.data);

    g = this.node.enter().append("g")
          .attr("class", "node")
            // .on("mouseover", mouseovered)
            // .on("mouseout", mouseoff);

    g.append("circle")
            .attr("r", function(d){return that.scale(d.emissions);})

    g.append("text")
          .text(function(d) {return d.name; })
          .style("font-size", "8pt");

    this.node
      .exit()
      .remove();    
    
    this.force.on("tick", function (d) {
      graph_update(0);})
        .on("start", function(d) {})
        .on("end", function(d) {})


    function graph_update(duration) {

    that.node.transition().duration(duration)
      .attr("transform", function(d) {
        return "translate("+d.x+","+d.y+")"; 
      });
}


    
    this.force.nodes(this.data)
      .start();
}


CircleVis.prototype.wrangleData = function(value){
        

}

/**
 * Drawing Method
 */
CircleVis.prototype.updateVis = function(){
    

    

}



/*
 *
 * ==================================
 * From here on only HELPER functions
 * ==================================
 *
 * */

CircleVis.prototype.initData = function (data){

    var new_data = []
    data.map(function(d,i){
        if (d.longitude != -1 && d.latitude != -1){
            new_data.push({
                "name": d.name,
                "country_id": d.country_id,
                "region": d.region,
                "income_group": d.income_group,
                "emissions": d.years[50],
                "gdp": d.gdp[50],
                "pop": d.pop[50]
            })
        }
    })
    return new_data

}