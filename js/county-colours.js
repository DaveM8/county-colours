// javascript web app to create a map of ireland showing
// how each county voted based on how the TD's voted

var voted = null;
var nextDiv = 0;
var currentDiv = null;
var grand_totals = [0,0,0];

var YES =0;
var NO = 1;
var ABS = 2;

function countyCounts()
{
    
    var members = httpGetJSON("data/tds_by_con.json");
    var countys = httpGetJSON("data/con_to_county.json");
    var results = httpGetJSON("data/cons.json");

    var counts = {};
    for(var con in results.county){
	// create a count field in format[yes, no, absent]
	//console.log(con)
	counts[results.county[con]] = [0,0,0];
    }
    

    for(var key in voted.no){
	console.log("No " + key + " " +voted.no[key]);
	counts[countys.county[members.member[voted.no[key]]]][NO] += 1;
	grand_totals[NO] += 1; 
    }

    for (key in voted.yes){
	console.log("Yes " + key + " "+ voted.yes[key]);
	counts[countys.county[members.member[voted.yes[key]]]][YES] += 1;
	grand_totals[YES] += 1;
    }
    for (key in voted.absent){
	console.log("Absent " + key + " " + voted.absent[key]); 
	counts[countys.county[members.member[voted.absent[key]]]][ABS] += 1;
	grand_totals[ABS] += 1;
    }
    var totals = {};
    for(key in counts){
	console.log("counts " + key + " " + counts[key]);
	var max_index = null;
	var max = -1;
	for(var i=0; i<counts[key].length; ++i){
	    if (counts[key][i] > max){
		max = counts[key][i];
		max_index = i;
	    }
	}
	switch(max_index){
	case YES:
	    totals[key] = "yes";
	    break;
	case NO:
	    totals[key] = 'no';
	    break;
	case ABS:
	    totals[key] = 'absent';
	    break;
	}
    
    }

    var edge_case = {"Carlow-Kilkenny" : ["Carlow", "Kilkenny"],
		     "Cavan-Monaghan" : ["Cavan","Monaghan"],
		     "Kerry North-West Limerick" : ["Limerick"],
		     "Laois-Offaly" : ["Laois", "Offaly"],
		     "Longford-Westmeath" : ["Longford", "Westmeath"],
		     "Roscommon-South Leitrim" :["Roscommon", "Leitrim"],
		     "Sligo-North Leitrim" : ["Sligo"]
		    };

    var new_totals = {};
    for(key in totals){
	var v = edge_case[key];
	if(v != undefined){
	    for(var k in v){
		new_totals[v[k]] = totals[key];
	    }
	} else{
	    new_totals[key] = totals[key];
	}
    }
    return new_totals;
}


//var voted = httpGetJSON("data/test.json");
//var results = countyCounts();
//$("#title").append("<h2>" + voted.title + "</h2>");
//draw_map(results);
//fill_table();


function fill_table(){
    $("#" + currentDiv).append('<div id="results-' + currentDiv + '"></div>');
    $("#results-" + currentDiv).append('<div id="no"><ul id="no-'+currentDiv+'" class="no-ul"></ul></div>');
    $("#results-" + currentDiv).append('<div id="yes"><ul id="yes-'+currentDiv+'" class="yes-ul"></ul></div>');
    $("#results-" + currentDiv).append('<div id="absent"><ul id="absent-'+currentDiv+'"class="absent-ul"></ul></div>');
    
    for(var i in voted.no)
	$("#no-" + currentDiv).append('<li class="no">' + voted.no[i] + '</li>');
    $("#no-" +currentDiv).prepend('<li class="list-head no-ul">Voted No '+grand_totals[NO]+'</li>');
    for(i in voted.yes)
	$("#yes-" + currentDiv).append('<li class="yes">' + voted.yes[i] + '</li>');
    $("#yes-" + currentDiv).prepend('<li class="list-head yes-ul">Voted Yes ' +grand_totals[YES]+'</li>');
    for(i in voted.absent)
	$("#absent-" +currentDiv).append('<li class="absent">' + voted.absent[i] + '</li>');
    $("#absent-" +currentDiv).prepend('<li class="list-head absent-ul">Absent ' + grand_totals[ABS]+'</li>');
}

function httpGetJSON(theUrl){
    var xmlHttp = null;
    xmlHttp = new XMLHttpRequest();
    xmlHttp.open("GET", theUrl, false);
    xmlHttp.send(null);
    return JSON.parse(xmlHttp.responseText);
}

function draw_map(data){
    
    var width = 600;
    var height = 500;
    
    var projection = d3.geo.albers()
      .rotate([0,0])
      .center([-9.3, 53.2])
      .scale(7000)
      .translate([width/2, height/2])
      .precision(.1);
  
    var path = d3.geo.path()
      .projection(projection);

    
   // var nextDiv = getNextDiv();
    //var mapid = "map-" + nextDiv.substring(1);
    // put a map div to select maps for css
    //console.log(mapid + " " + nextDiv);
    //$(nextDiv).append('<div id=' + mapid + ' class="map"></div>');
    console.log(currentDiv);
    var select = "#map-title-" + currentDiv;
    var svg = d3.select(select).append("svg")
      .attr("width", width)
      .attr("height", height);
    var g =svg.append("g");
    
    d3.json("data/ireland_topo_pretty.json", function(error, ireland){
	var county = topojson.feature(ireland, ireland.objects.county);
	// put the values for each county into the topojson
	var geoms = ireland.objects.county.geometries;
	for(var k in geoms){
	    geoms[k].properties.value = data[geoms[k].properties.id];
	    //console.log(data[geoms[k].properties.id]);
	    //console.log(geoms[k].properties.value)
	}
	
	svg.append("g")
            .attr("class", "feature feature--county")
            .selectAll("path")
            .data(topojson.feature(ireland, ireland.objects.county).features)
            .enter()
            .append("path")
            .attr("d", path)
	    .style("fill", function(d){
		// Get data value
		var value = d.properties.value;
		if(value){
		    // the value exsits
		    if (value === "no"){
			return "#ff0000";
		    }else if (value === "yes"){
			return "#00ff00";
		    }
		    else{
			return "#eeeeee";
		    }
		    // no value exists
		    return "#ffffff";
		}
	    });
	svg.append("path")
            .datum(topojson.mesh(ireland, ireland.objects.county, function(a, b)
                                 { return a !== b; }))
            .attr("class", "boundary boundary--county")
            .style("stroke-width", "1px")
            .attr("d", path);
	
     
	svg.selectAll("text")
            .data(county.features)
            .enter().append("text")
            .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
            .attr("dy", ".35em")
            .text( function(d) { return d.properties.id; });
    });
}

function new_map(path){
    // draw a new map and fill out the result tables
    grand_totals = [0,0,0];
    voted = httpGetJSON(path);
    nextDiv += 1;
    currentDiv = "current-" + nextDiv;
    $("#main").prepend('<div class="one-vote" id="' +currentDiv+ '"></div>');
    $("#" + currentDiv).append('<div class="map-class" id="map-title-' + currentDiv +'"></div>');
    //console.log(voted.title);
    $("#map-title-" +currentDiv).append('<h2 class="title-for-map">' + voted.title + "</h2>");
    var results = countyCounts();
    draw_map(results);
    fill_table();
}
