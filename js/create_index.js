// lay all of the

var tree = httpGetJSON("data/file_tree.json");

var link = '<a href="%%href%%" class="map-link" onclick="new_map("%%path%%");return false;">%%text%%</a>';

$("#side").append('<ul id="my-list" class="collapsibleList"></ul>');
for(var year in tree ){
    $("#my-list").append('<li>'+year+'<ul class="collapsibleList" id="year-' + year + '"></ul></li>');
    //$("#year-" + year).append('<ul class="collapsibleList id="month-' +year+'"><ul>');
    for(var month in tree[year]){
	var the_month = month;
	$("#year-" + year).append('<li>'+ the_month +'<ul class="collapsibleList" id="' + year + '-' + the_month + '"><ul></li>');
	for( var day in tree[year][month]){
	    //var the_day = tree[year][month][day];
	    var the_day=day;
	    //console.log("#" + year + "-" + the_month);
	    $("#" + year + "-" + the_month).append('<li>' + the_day + '<ul class="collapsibleList" id="' + year +'-'+ the_month+ '-' + the_day+ '"><ul></li>');
	    for( var now in tree[year][month][day]){
		for(var i=0; i<tree[year][month][day].length; ++i){
		    for( now in tree[year][month][day][i]){
			var text = link.replace("%%href%%", "json/" +now);
			text = text.replace("%%text%%", tree[year][month][day][i][now]);
			text = text.replace('%%path%%', "json/" +now );
			//console.log(text);
			$("#" +year +'-'+ the_month+ '-' + the_day).append('<li>' + text + '</li>');
		    }
		}
	    }
	}
    }
}
// make the list with the ID 'newList' collapsible

CollapsibleLists.apply();

$('.map-link').click( function() {
    console.log($(this));
    console.log($(this).attr('href'));
    new_map($(this).attr('href'));
    return false;
});
