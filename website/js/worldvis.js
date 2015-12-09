/**
    WorldVis object
**/


WorldVis = function(_parentElement, _data, _eventHandler){
    this.parentElement = _parentElement;
    this.data = _data;
    this.eventHandler = _eventHandler;
    this.init = false
    this.mouseon = null


    // define all "constants" 
    this.margin = {top: 20, right: 0, bottom: 30, left: 70},
    this.width = 1100 
    this.height = 510
    this.year = 1960

    this.initVis();
}


/**
 * Method that sets up the SVG and the variables
 */
WorldVis.prototype.initVis = function(){

    var that = this

    //append svg element
    this.svg = this.parentElement.append("svg")
      .attr("width", "100%")
      .attr("id", "map")
      .attr("height", this.height)
      .style("background-color", "none")
      .append("g")
        .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
    
    //add the color keys
    this.parentElement.append("div")
        .attr("class", "key")
        .attr("id", "key_pop")
        .style("display", "none");

    this.parentElement.append("div")
        .attr("class", "key")
        .attr("id", "key_forest")
        .style("display", "none")

    this.parentElement.append("div")
        .attr("class", "key")
        .attr("id", "key_gdp")
        .style("display", "block")

    //add text block on left
    this.country_text = this.parentElement.append("div")
        .attr("class", "history_text_bottom")
    
    this.country_text.append("text")
        .attr("id", "country_text")
        .html("<strong>Country: </strong>World <br>")
    this.country_text.append("text")
        .attr("id", "year_text")
        .text("Year: ")
    this.country_text.append("text")
        .attr("id", "emissions_text")
        .text("CO2 Emissions (kt): ")
    this.country_text.append("text")
        .attr("id", "region_text")
        .text("Region: ")
    this.country_text.append("text")
        .attr("id", "income_text")
        .text("Income group: ")
    this.country_text.append("text")
        .attr("id", "population_text")
        .text("Population: ")
    this.country_text.append("text")
        .attr("id", "gdp_text")
        .text("GDP: ")
    this.country_text.append("text")
        .attr("id", "forest_text")
        .text("Forest Area %: ")

    this.country_text_top = this.parentElement.append("div")
        .attr("class", "history_text")

    this.country_text_top.append("text").style("display", "none")
    .attr("id", "sixties_text")
        .html("<strong>1960s:</strong> 1960 marked the beginning of rapid changes in global carbon emissions. Before that, the world generally experienced a constant increase in emissions proportional to population growth.")

    this.country_text_top.append("text").style("display", "none")
    .attr("id", "seventies_text")
        .html("<strong>70s & 80s: </strong>While the US continued to be the top CO2 emitter until the 2000’s, Asian countries, especially China, started to emerge. There is no data for Russia until the dissolution of the Soviet Union in 1991, although it was a top emitter.")
    
    this.country_text_top.append("text").style("display", "none")
    .attr("id", "nineties_text")
        .html("<strong>1990s: </strong>In 1993, Asia became the largest emitter by continent of CO2, largely due to rapid Chinese economic reform that started in the 1980’s. In 1994, Asia’s GDP became the largest in the world and its emissions continued to reflect that.")
    
    this.country_text_top.append("text").style("display", "none")
    .attr("id", "noughties_text")
        .html("<strong>2000s: </strong>In the past, Europe and North America accounted for a high % of emissions. However, China overtook the US as the top emitter in 2005 and by 2011, Asia contributed more than half of global CO₂ emissions.") 

    //add buttons
    this.parentElement.append("button")
        .attr("class", "btn_on")
        .attr("id", "gdpBtn")
        .text("GDP")

    this.parentElement.append("button")
        .attr("class", "history_btn")
        .attr("id", "popBtn")
        .text("POPULATION")

    this.parentElement.append("button")
        .attr("class", "history_btn")
        .attr("id", "forestBtn")
        .text("FOREST %")

    //add total emissions label
    this.parentElement.append("text")
        .attr("class", "emissions_label")
        .html("Total Emissions for <strong>World</strong>")

    this.parentElement.append("text")
        .attr("class", "explore_label")
        .html("CLICK ON A DECADE ABOVE TO EXPLORE IN MORE DETAIL")

    //add year axis
    this.x = d3.scale.linear()
      .range([0, 353])
      .domain([1960, 2009])

    this.xAxis = d3.svg.axis()
      .scale(this.x)
      .orient("bottom")
      .tickFormat(d3.format("d"))
      .tickSize(7, 0, 0);

    this.svg.append("g")
        .attr("class", "emissions_axis")
        .attr("transform", "translate("+324+"," + 467 +")")
        .call(this.xAxis);

    

    
        
    //instantiate world map
    this.map = new Datamap({element: document.getElementById('map'),
        scope: 'world',
        geographyConfig: {
            popupOnHover: true,
            //popupTemplate: "hello",
        //    highlightOnHover: false
            highlightBorderWidth: 0
        },
        bubblesConfig: {
            highlightBorderWidth: 0,
            highlightFillColor: "#990033",
        },
        fills: {
            defaultFill: '#E0E0E0'
        },
        done: function(datamap) {
            datamap.svg.selectAll('.datamaps-subunit').on('click', function(geography) {

            //trigger selection event
            $(that.eventHandler).trigger("selectionChanged", geography.id);

            })/*.on("mouseover", function(d){

            var circle = this

            that.mouseon = circle


            that.updateTooltip(circle)
            

            })

           .on("mouseout", function(d){

            that.mouseon = null

            d3.select(".tooltip_bubbles")
                .style("visibility", "hidden");
              })*/;
        }
    }); 

    d3.selectAll(".datamaps-hoverover").style("display", "block");


    //instantiate world totals line plot
    this.addLinePlot("WLD")

    //add slider
    this.addSlider(this.svg)

    this.current_country = "WLD";

    // filter, aggregate, modify data, calls updateVis
    this.wrangleData_gdp();

    this.init = true;

}


/**
 * Method to wrangle the data for gdp. 
  */
WorldVis.prototype.wrangleData_gdp= function(){

    this.toggle = 0

    //update country hover color
    this.map.options.geographyConfig["highlightFillColor"] = "#cc3300";

    //update color key
    d3.select("#key_gdp").style("display", "block");
    d3.select("#key_forest").style("display", "none");
    d3.select("#key_pop").style("display", "none");

    //update buttons
    d3.select("#gdpBtn")
                          .attr("class", "btn_on");
                        d3.select("#popBtn")
                          .attr("class", "history_btn");
                        d3.select("#forestBtn")
                          .attr("class", "history_btn");   

    var that = this

    this.displayData = [];

    var current_year = this.year - 1960 //to get the indexing correct

    //scale the bubbles
    var x = d3.scale.linear()
        x.domain([0, 7200000])
        x.range([3, 80])


    //wrangle data for bubbles
    this.data.forEach(function(d){
        if (d.longitude != -1 && d.latitude != -1){
            if (d.years[current_year] > 0) {
                d.radius = x(d.years[current_year])
            } else {
                d.radius = 0
            }
            
            that.displayData.push({"latitude": d.latitude, "longitude": d.longitude, "radius": d.radius, 
                "code": d.country_id, "emissions": d.years[current_year], "name": d.name,"borderWidth": 0, "fillOpacity": 0.5})

        }
    })

    //wrangle data for fill colors and country codes
    fills_array = {}
    country_array = {}

    var gdp_scale = d3.scale.linear()
        .domain([0, 16163200000000/10])
        .rangeRound([220, 100]) //#66 to #cc

    var red_scale = d3.scale.linear()
        .domain([16163200000000/10, 17163200000000])
        .rangeRound([100, 17])

    var array = [90]
    for (var i = 0; i < 1; i++) {
    }

    that.data.forEach(function(d) {
        var gdp = d.gdp[current_year]
        var string;
        if (gdp > -1 && d.longitude != -1 && d.latitude != -1) {
            if (gdp > 16163200000000/10) {
                string = "#ff" + red_scale(gdp).toString(16) + "66";
            } else {
                string = "#ff" + gdp_scale(gdp).toString(16) + "66"
            }
            
            var obj = {}
            obj["fillKey"] = d.country_id
            fills_array[d.country_id] = string
            country_array[d.country_id] = obj

        } else {
            var obj = {}
            obj["fillKey"] = d.country_id
            fills_array[d.country_id] = '#ffee66'
            country_array[d.country_id] = obj
        }
        
    })

    this.displayData.fills_array = fills_array
    this.displayData.country_array = country_array

    this.updateVis();

}


/**
 * Method to wrangle data for population. 
  */
WorldVis.prototype.wrangleData_pop= function(){

    var that = this

    this.toggle = 1

    //update country hover color
    this.map.options.geographyConfig["highlightFillColor"] = "#0214A1";

    //update color key
    d3.select("#key_pop").style("display", "block");
    d3.select("#key_forest").style("display", "none");
    d3.select("#key_gdp").style("display", "none");

    //update buttons
    d3.select("#gdpBtn")
                          .attr("class", "history_btn");
                        d3.select("#popBtn")
                          .attr("class", "btn_on");  
                        d3.select("#forestBtn")
                          .attr("class", "history_btn"); 

    this.displayData = [];

    var current_year = this.year - 1960 //to get the indexing correct

    //scale the bubbles
    var x = d3.scale.linear()
        x.domain([0, 7200000])
        x.range([3, 80])



    //wrangle data for bubbles
    this.data.forEach(function(d){
        if (d.longitude != -1 && d.latitude != -1){
            if (d.years[current_year] > 0) {
                d.radius = x(d.years[current_year])
            } else {
                d.radius = 0
            }
            that.displayData.push({"latitude": d.latitude, "longitude": d.longitude, "radius": d.radius,               
                "code": d.country_id, "emissions": d.years[current_year], "name": d.name, "borderWidth": 0, "fillOpacity": 0.5})

        }
    })

    //wrangle data for fill colors and country codes
    fills_array = {}
    country_array = {}

    /*var pop_init = d3.scale.linear()
        .domain([0, 6804046000])
        .range([1, 6804046000])

    var pop_log = d3.scale.log()
        .domain([1, 6804046000])
        .range([0, Math.log(6804046000)])

    var pop_final = d3.scale.linear()
        .domain([0, Math.log(6804046000)])
        .range([0, 100])

    var pop_scale = d3.scale.linear()
        .domain([30, 70])
        .rangeRound([220, 150]) //#66 to #cc

    var pop_scale_large = d3.scale.linear()
        .domain([70, 100])
        .rangeRound([150, 17])*/

    var pop_scale = d3.scale.linear()
        .domain([0, 135069500/10])
        .rangeRound([220, 180]) //#dc to #b4


    var pop_scale_large = d3.scale.linear()
        .domain([135069500/10, 1350695000/8])
        .rangeRound([180, 17])


    var pop_scale_larger = d3.scale.linear()
        .domain([1350695000/8, 1350695000])
        .rangeRound([120, 17])


    that.data.forEach(function(d) {
        var pop = d.pop[current_year]
        //var value = pop_final(pop_log(pop_init(pop)));
        //if (pop > -1) {
        //    console.log(pop_final(pop_log(pop_init(pop))))
        //}
        var string;
        if (pop > -1 && d.longitude != -1 && d.latitude != -1) {
            /*if (value > 70) {
                string = "#" + pop_scale_large(value).toString(16) + "99" + "cc"//"#0599cc" 
            }
            else if (value > 30 && value <= 70) {
                string = "#" + pop_scale(value).toString(16) + "99" + "cc"//"#0599cc" 
            } else {
                string = "#F099cc" 
            }*/

            if (pop > 1350695000/8) {
                string = "#00" + pop_scale_larger(pop).toString(16) + "99"
            } else if (pop > 135069500/10 && pop <= 1350695000/8) {
                string = "#" + pop_scale_large(pop).toString(16) + "99" + "cc"//"#0599cc" 
            } else {
                string = "#" + pop_scale(pop).toString(16) + "99" + "cc"
            }
            
            var obj = {}
            obj["fillKey"] = d.country_id
            fills_array[d.country_id] = string
            country_array[d.country_id] = obj

        } else {
            var obj = {}
            obj["fillKey"] = d.country_id
            fills_array[d.country_id] = '#ffccff'
            country_array[d.country_id] = obj

        }
        
    })

    this.displayData.fills_array = fills_array
    this.displayData.country_array = country_array

    this.updateVis();

}

/**
 * Method to wrangle data for forest area. 
  */
WorldVis.prototype.wrangleData_forest= function(){

    var that = this

    this.toggle = 2

    //update country hover color
    this.map.options.geographyConfig["highlightFillColor"] = "#30611C";

    //update color key
    d3.select("#key_forest").style("display", "block");
    d3.select("#key_pop").style("display", "none");
    d3.select("#key_gdp").style("display", "none");

    //update buttons
    d3.select("#gdpBtn")
                          .attr("class", "history_btn");
                        d3.select("#popBtn")
                          .attr("class", "history_btn");
                        d3.select("#forestBtn")
                          .attr("class", "btn_on"); 

    this.displayData = [];

    var current_year = this.year - 1960 //to get the indexing correct

    //scale the bubbles
    var x = d3.scale.linear()
        x.domain([0, 7200000])
        x.range([3, 80])


    //wrangle data for bubbles
    this.data.forEach(function(d){
        if (d.longitude != -1 && d.latitude != -1){
            if (d.years[current_year] > 0) {
                d.radius = x(d.years[current_year])
            } else {
                d.radius = 0
            }
            
            that.displayData.push({"latitude": d.latitude, "longitude": d.longitude, "radius": d.radius, 
                "code": d.country_id, "emissions": d.years[current_year], "name": d.name,"borderWidth": 0, "fillOpacity": 0.5})

        }
    })

    //wrangle data for fill colors and country codes
    fills_array = {}
    country_array = {}

    var forest_scale = d3.scale.linear()
        .domain([0, 65])
        .rangeRound([200, 17]) //#66 to #cc

    var forest_scale_large = d3.scale.linear() //for the countries with anomalies
        .domain([66, 85])
        .rangeRound([102, 17])

    var forest_scale_larger = d3.scale.linear() //for the countries with anomalies
        .domain([86, 100])
        .rangeRound([102, 70])
    

    that.data.forEach(function(d) {
        var tree = d.forest_change[current_year]*100
        var forest = d.forest[current_year]

        var string;
        if (forest > -1 && d.longitude != -1 && d.latitude != -1) {
            if (forest > 85) {
                string = "#00" + forest_scale_larger(forest).toString(16) +"33";
            } else if (forest > 65 && forest < 86) {
                string = "#" + forest_scale_large(forest).toString(16) +"9966";
            } else {
                string = "#" + forest_scale(forest).toString(16) +"cc99"; 
            
            }

            
            var obj = {}
            obj["fillKey"] = d.country_id
            fills_array[d.country_id] = string
            country_array[d.country_id] = obj

        } else {
            var obj = {}
            obj["fillKey"] = d.country_id
            fills_array[d.country_id] = '#BADEA2'
            country_array[d.country_id] = obj

        }
        
    })


    this.displayData.fills_array = fills_array
    this.displayData.country_array = country_array

    this.updateVis();

}



/**
 * Drawing Method
 */
WorldVis.prototype.updateVis = function(){
    var that = this

    // update circles
    this.map.bubbles(this.displayData); //, {highlightOnHover: false});
    //geographyConfig: {
        //    popupOnHover: false,
        //    highlightOnHover: false
        //});
    
    
        

    this.map.updateChoropleth(
        this.displayData.fills_array);

    //Add tooltips to bubbles
    d3.selectAll(".datamaps-bubble") 
       .attr("id", function(d){ return ""+d.code+"_bub";})
       .style("fill", "#990033")
       .on("mouseover", function(d){
        //console.log(d3.select(this)[0][0].style["cssText"]);
        d3.select(this)[0][0].style["cssText"] = "stroke: rgb(255, 255, 255); stroke-width: 0px; fill-opacity: 0.8; fill: rgb(153, 0, 51)";
        //d3.select(this).style("fill", "#black")
        var circle = this

        that.mouseon = circle


        that.updateTooltip(circle)
        

        })

       .on("mouseout", function(d){
        d3.select(this)[0][0].style["cssText"] = "stroke: rgb(255, 255, 255); stroke-width: 0px; fill-opacity: 0.5; fill: rgb(153, 0, 51)";
        that.mouseon = null

        d3.select(".tooltip_bubbles")
            .style("visibility", "hidden");
          });


    //update text on the left
    var emissions;
    var population;
    var gdp;
    var forest;
    var region;
    var income;
    var country_name;

    that.data.forEach(function(d){ if(d.country_id == that.current_country) {
        if (d.years[that.year - 1960] > 0) {
            emissions = parseInt(d.years[that.year - 1960]);
        } else {emissions = "No data"}

        if (d.pop[that.year - 1960] > 0) {
            population = d.pop[that.year - 1960];
        } else {population = "No data"}
        
        if (d.gdp[that.year - 1960] > 0) {
            gdp = parseInt(d.gdp[that.year - 1960]);
        } else {gdp = "No data"}

        if (d.forest[that.year - 1960] > 0) {
            forest = parseInt(d.forest[that.year - 1960]);
        } else {forest = "No data"}

        income = d.income_group;
        region = d.region;
        country_name = d.name;

    }})

    d3.select("#year_text").html("<strong>Year: </strong>"+ this.year + "<br>");
    d3.select("#emissions_text").html("<strong>CO2 Emissions (kt): </strong>" + emissions + "<br>")
    d3.select("#region_text").html("<strong>Region: </strong>" + region + "<br>")
    d3.select("#income_text").html("<strong>Income group: </strong>" + income + "<br>")
    d3.select("#population_text").html("<strong>Population: </strong>" + population +"<br>")
    d3.select("#gdp_text").html("<strong>GDP ($USD): </strong>" + gdp + "<br>")
    d3.select("#forest_text").html("<strong>Forest Area %: </strong>" + forest + "<br>")
    d3.select(".emissions_label").html("Total Emissions for <strong>"+ country_name +"</strong>")
    

}


/**
 * Gets called by event handler and should create new aggregated data
 */
WorldVis.prototype.onSelectionChange= function (country){

    this.current_country = country;
    console.log(country);
    this.addLinePlot(country);
    this.updateVis();
   
}

/*
 *
 * ==================================
 * From here on only HELPER functions
 * ==================================
 *
 * */

 /**
 * creates the bottom slider
 */
WorldVis.prototype.addSlider = function(svg){
    var that = this;

    //Scale slider position values to year values
    var sliderScale = d3.scale.linear()

    sliderScale.domain([0, 360])
    sliderScale.rangeRound([1960,2010])

    var sliderDragged = function(){
        var value = Math.max(0, Math.min(353,d3.event.x));

        //update current year value
        that.year = sliderScale(value)

        d3.select(this)
            .attr("x", function () {
                return value;
                
            })

        if (that.toggle == 0) {
            that.wrangleData_gdp();
        } else if (that.toggle == 1) {
            that.wrangleData_pop();
        } else {
            that.wrangleData_forest();
        }
        
    }
    var sliderDragBehaviour = d3.behavior.drag()
        .on("drag", sliderDragged)

    var sliderGroup = svg.append("g").attr({
        class:"sliderGroup",
        "transform":"translate("+320+","+460+")"
    })

    sliderGroup.append("rect").attr({
        class:"sliderBg",
        x:0,
        width:360,
        height: 7
    }).style({
        fill:"lightgray"
    })

    sliderGroup.append("rect").attr({
        "class":"sliderHandle",
        x: 0,
        width:8,
        height:10,
        rx:2,
        ry:2
    }).style({
        fill:"#333333"
    }).call(sliderDragBehaviour)

    this.parentElement.append("button").attr({
        "id": "playBtn",
        "class": "play_button",
        "transform": "translate(300,-100)",
    }).text("Play").style("position", "absolute")


    this.animationOn = false;

    // Turn on and off slider animation

    this.playButton = document.getElementById("playBtn");
    this.playButton.addEventListener("click", function() { 

        if (that.animationOn == false){
        
            //update button text
            that.parentElement.select("#playBtn")
                .attr("class", "play_button_on")

            that.animationOn = true

            var start = 0

            function animationLoop(){
                setTimeout(function () { 
                    
                    var slider = svg.select(".sliderHandle")
                    var pos = parseInt(slider.attr("x")) + 1;

                    //update slider position
                    slider.attr({x: pos})

                    //update visualization
                    that.year = sliderScale(pos)

                    if (that.toggle == 0) {
                        that.wrangleData_gdp();
                        that.updateTooltip(that.mouseon)
                    } else if (that.toggle == 1) {
                        that.wrangleData_pop()
                        that.updateTooltip(that.mouseon)

                    } else {
                        that.wrangleData_forest()
                        that.updateTooltip(that.mouseon)
                    }

                    start = pos;
                    if(start < 354 && that.animationOn){
                        animationLoop()
                    }
                    else if (start > 353 && that.animationOn){
                        that.animationOff
                        that.parentElement.select("#playBtn")
                            .attr("class", "play_button");


                    }
                }, 1) 
            } 

            animationLoop()       

        }
        else{

            //update button text    
            that.parentElement.select("#playBtn")
                    .attr("class", "play_button")

            //reset animation boolean to exit animation loop
            that.animationOn = false
        }                
    });

    this.parentElement.append("button")
        .attr("class", "history_btn")
        .attr("id", "sixtiesBtn")
        .text("60s")

    //add functionality for explore buttons
    this.sixtiesButton = document.getElementById("sixtiesBtn");
    this.sixtiesButton.addEventListener("click", function() { 

        if (that.animationOn == false){
            
            that.parentElement.select("#sixties_text").style("display", "block");
            that.parentElement.select("#seventies_text").style("display", "none");
            that.parentElement.select("#nineties_text").style("display", "none");
            that.parentElement.select("#noughties_text").style("display", "none");

            //update button text
            that.parentElement.select("#sixtiesBtn")
                .attr("class", "btn_on")

            that.parentElement.select(".explore_label").style("display", "none")

            that.animationOn = true

            var start = 0
            svg.select(".sliderHandle").attr({x: 0});

            function animationLoop(){
                setTimeout(function () { 
                    
                    var slider = svg.select(".sliderHandle")
                    var pos = parseInt(slider.attr("x")) + 1;

                    //update slider position
                    slider.attr({x: pos})

                    //update visualization
                    that.year = sliderScale(pos)

                    if (that.toggle == 0) {
                        that.wrangleData_gdp();
                        that.updateTooltip(that.mouseon)
                    } else if (that.toggle == 1) {
                        that.wrangleData_pop()
                        that.updateTooltip(that.mouseon)

                    } else {
                        that.wrangleData_forest()
                        that.updateTooltip(that.mouseon)
                    }

                    start = pos;
                    if(start < 69 && that.animationOn){
                        animationLoop()
                    }
                    else if (start > 68 && that.animationOn){
                        that.animationOff
                        that.parentElement.select("#sixtiesBtn")
                            .attr("class", "history_btn");


                    }
                }, 1) 
            } 

            animationLoop()       

        }
        else{

            //update button text    
            that.parentElement.select("#sixtiesBtn")
                    .attr("class", "history_btn")

            //reset animation boolean to exit animation loop
            that.animationOn = false
        }                
    });

    this.parentElement.append("button")
        .attr("class", "history_btn")
        .attr("id", "seventiesBtn")
        .text("70s")

    //add functionality for explore buttons
    this.seventiesButton = document.getElementById("seventiesBtn");
    this.seventiesButton.addEventListener("click", function() { 

        if (that.animationOn == false){

            that.parentElement.select(".explore_label").style("display", "none")
            that.parentElement.select("#sixties_text").style("display", "none");
            that.parentElement.select("#seventies_text").style("display", "block");
            that.parentElement.select("#nineties_text").style("display", "none");
            that.parentElement.select("#noughties_text").style("display", "none");
        
            //update button text
            that.parentElement.select("#seventiesBtn")
                .attr("class", "btn_on")

            that.animationOn = true

            var start = 0
            svg.select(".sliderHandle").attr({x: 69});

            function animationLoop(){
                setTimeout(function () { 
                    
                    var slider = svg.select(".sliderHandle")
                    var pos = parseInt(slider.attr("x")) + 1;

                    //update slider position
                    slider.attr({x: pos})

                    //update visualization
                    that.year = sliderScale(pos)

                    if (that.toggle == 0) {
                        that.wrangleData_gdp();
                        that.updateTooltip(that.mouseon)
                    } else if (that.toggle == 1) {
                        that.wrangleData_pop()
                        that.updateTooltip(that.mouseon)

                    } else {
                        that.wrangleData_forest()
                        that.updateTooltip(that.mouseon)
                    }

                    start = pos;
                    if(start < 217 && start > 69 && that.animationOn){
                        animationLoop()
                    }
                    else if (start > 216 && that.animationOn){
                        that.animationOff
                        that.parentElement.select("#seventiesBtn")
                            .attr("class", "history_btn");


                    }
                }, 1) 
            } 

            animationLoop()       

        }
        else{

            //update button text    
            that.parentElement.select("#seventiesBtn")
                    .attr("class", "history_btn")

            //reset animation boolean to exit animation loop
            that.animationOn = false
        }                
    });
    
    this.parentElement.append("button")
        .attr("class", "history_btn")
        .attr("id", "ninetiesBtn")
        .text("90s")

    //add functionality for explore buttons
    this.ninetiesButton = document.getElementById("ninetiesBtn");
    this.ninetiesButton.addEventListener("click", function() { 

        if (that.animationOn == false){
            
            that.parentElement.select(".explore_label").style("display", "none")
            that.parentElement.select("#sixties_text").style("display", "none");
            that.parentElement.select("#seventies_text").style("display", "none");
            that.parentElement.select("#nineties_text").style("display", "block");
            that.parentElement.select("#noughties_text").style("display", "none");

            //update button text
            that.parentElement.select("#ninetiesBtn")
                .attr("class", "btn_on")

            that.animationOn = true

            var start = 0
            svg.select(".sliderHandle").attr({x: 216});

            function animationLoop(){
                setTimeout(function () { 
                    
                    var slider = svg.select(".sliderHandle")
                    var pos = parseInt(slider.attr("x")) + 1;

                    //update slider position
                    slider.attr({x: pos})

                    //update visualization
                    that.year = sliderScale(pos)

                    if (that.toggle == 0) {
                        that.wrangleData_gdp();
                        that.updateTooltip(that.mouseon)
                    } else if (that.toggle == 1) {
                        that.wrangleData_pop()
                        that.updateTooltip(that.mouseon)

                    } else {
                        that.wrangleData_forest()
                        that.updateTooltip(that.mouseon)
                    }

                    start = pos;
                    if(start < 285 && start > 216 && that.animationOn){
                        animationLoop()
                    }
                    else if (start > 284 && that.animationOn){
                        that.animationOff
                        that.parentElement.select("#ninetiesBtn")
                            .attr("class", "history_btn");


                    }
                }, 1) 
            } 

            animationLoop()       

        }
        else{

            //update button text    
            that.parentElement.select("#ninetiesBtn")
                    .attr("class", "history_btn")

            //reset animation boolean to exit animation loop
            that.animationOn = false
        }                
    });

    this.parentElement.append("button")
        .attr("class", "history_btn")
        .attr("id", "noughtiesBtn")
        .text("2000s")

    //add functionality for explore buttons
    this.noughtiesButton = document.getElementById("noughtiesBtn");
    this.noughtiesButton.addEventListener("click", function() { 

        if (that.animationOn == false){
            
            that.parentElement.select(".explore_label").style("display", "none")
            that.parentElement.select("#sixties_text").style("display", "none");
            that.parentElement.select("#seventies_text").style("display", "none");
            that.parentElement.select("#nineties_text").style("display", "none");
            that.parentElement.select("#noughties_text").style("display", "block");

            //update button text
            that.parentElement.select("#noughtiesBtn")
                .attr("class", "btn_on")

            that.animationOn = true

            var start = 0
            svg.select(".sliderHandle").attr({x: 284});

            function animationLoop(){
                setTimeout(function () { 
                    
                    var slider = svg.select(".sliderHandle")
                    var pos = parseInt(slider.attr("x")) + 1;

                    //update slider position
                    slider.attr({x: pos})

                    //update visualization
                    that.year = sliderScale(pos)

                    if (that.toggle == 0) {
                        that.wrangleData_gdp();
                        that.updateTooltip(that.mouseon)
                    } else if (that.toggle == 1) {
                        that.wrangleData_pop()
                        that.updateTooltip(that.mouseon)

                    } else {
                        that.wrangleData_forest()
                        that.updateTooltip(that.mouseon)
                    }

                    start = pos;
                    if(start < 354 && start > 284 && that.animationOn){
                        animationLoop()
                    }
                    else if (start > 353 && that.animationOn){
                        that.animationOff
                        that.parentElement.select("#noughtiesBtn")
                            .attr("class", "history_btn");


                    }
                }, 1) 
            } 

            animationLoop()       

        }
        else{

            //update button text    
            that.parentElement.select("#noughtiesBtn")
                    .attr("class", "history_btn")

            //reset animation boolean to exit animation loop
            that.animationOn = false
        }                
    });


}

/**
 * creates the world c02 totals line plot
 */
WorldVis.prototype.addLinePlot = function(country){
    var that = this;
    console.log(country);
    
    this.svg.selectAll(".lineGroup").remove()

    var lineGroup = this.svg.append("g").attr({
        class:"lineGroup",
        "transform":"translate("+321+","+380+")"
    })

    var linedata = []

    var years = [] 
    that.data.forEach(function(d){ if(d.country_id == country) {years = d.years}})

    years.forEach(function(d,i){{ linedata[i] = parseInt(d)}})

    var x = d3.scale.linear()
    var y = d3.scale.linear()
    var opac = d3.scale.linear()

    var ymax = Math.max.apply(null, linedata)
    var ymin = d3.min(linedata, function(d){if (d > 0){ return d}})

    y.domain([-1, ymax])
    y.range([0, 60])

    x.range([0,360])
    x.domain([0, 51])

    opac.domain([0, 53])
    opac.range([0.3, 1])
    
    var rects = lineGroup.selectAll("rect.co2_bar")
        .data(linedata)

    rects.enter().append("rect")
        .attr("class", "co2_bar")
        .style("fill", "#990033")
        .style("opacity", function(d, i) {return opac(i);})
        .attr("height", function(d){return y(d);})
        .attr("width", 6)
        .attr("x", function(d,i) {return x(i); })
        .attr("y", function(d){return 80 - y(d);})
        .on("mouseover", function(d, i) {
      //    console.log(i)
      });

    rects.exit().remove();
    //this.svg.selectAll("rect.co2_bar").style("fill", "black");

}

//function to update bubbles tooltip
WorldVis.prototype.updateTooltip = function(circle){

    var that = this

    //check if mouseis on a circle
    if (!circle){}
    else{
    
    var obj =  JSON.parse(circle.getAttribute("data-info"))

    var id = circle.getAttribute("id")
    var circ = d3.select("#"+id+"")
    var emissions 
    var name

    circ.each(function(d){emissions = d.emissions; name = d.name})

    var left = parseFloat(circle.getAttribute("cx")) + 50;
    var top;
    if (parseFloat(circle.getAttribute("cy")) > 350) {top = parseFloat(circle.getAttribute("cy")) - 100}
    else {top = parseFloat(circle.getAttribute("cy")) + 50;}
    
    //console.log(parseFloat(circle.getAttribute("cy")));

        d3.select(".tooltip_bubbles")
            .style("left", left+"px")
            .style("top", top+"px" )
            .style("visibility", "visible")
            .text("")
            .append("p")
            .attr("class", "tool_text")
            .style("font-weight", "bold")
            .text(name)
            .append("p")
            .attr("class", "tool_text")
            .style("font-weight","normal")
            .text("Year: "+ that.year+"")
            .append("p")
            .text("Emissions (kt): "+ parseInt(emissions))
    }
}
