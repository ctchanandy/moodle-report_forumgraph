/*
 * JavaScript function and variable for report_forumgraph
 */

var forumgraph = {};
var showingLabel = 1;
var edgeCurve = 1;

M.report_forumgraph = {};

M.report_forumgraph.init = function(Y, forum, modid, courseid, wwwroot) {
    forumgraph.forum = forum;
    forumgraph.modid = modid;
    forumgraph.courseid = courseid;
    forumgraph.wwwroot = wwwroot;
};

function loadCourseMenu(school) {
    var coursemenu = document.getElementById("menucourse");
    if (school == 0) {
        for (i=coursemenu.length-1; i>0; i--) { coursemenu.remove(i); }
        return;
    }
    var httpRequest;
    if (window.XMLHttpRequest) { // Mozilla, Safari, ...
        httpRequest = new XMLHttpRequest();
        if (httpRequest.overrideMimeType) {
            httpRequest.overrideMimeType('text/xml');
        }
    } else if (window.ActiveXObject) { // IE
        try {
            httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {}
        }
    }
    
    if (!httpRequest) {
        alert('Error: Cannot create an XMLHTTP instance!');
        return false;
    }
    httpRequest.onreadystatechange = function() {
        var cSelected = coursemenu.selectedIndex;
        runJS(httpRequest);
        if (cSelected > coursemenu.length) {
            coursemenu.selectedIndex = 0;
        } else {
            coursemenu.selectedIndex = cSelected;
        }
    };
    httpRequest.open('GET', 'getcourses.php?category='+school, true);
    httpRequest.send('');
    
    if (coursemenu.selectedIndex != 0) {
        loadForumMenu(coursemenu.options[coursemenu.selectedIndex].value);
    }
}

function loadForumMenu(course) {
    var forummenu = document.getElementById("menuforum");
    if (course == 0) {
        for (i=forummenu.length-1; i>0; i--) { forummenu.remove(i); }
        return;
    }
    var httpRequest;
    if (window.XMLHttpRequest) { // Mozilla, Safari, ...
        httpRequest = new XMLHttpRequest();
        if (httpRequest.overrideMimeType) {
            httpRequest.overrideMimeType('text/xml');
        }
    } else if (window.ActiveXObject) { // IE
        try {
            httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e) {
            try {
                httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
            }
            catch (e) {}
        }
    }
    
    if (!httpRequest) {
        alert('Error: Cannot create an XMLHTTP instance!');
        return false;
    }
    httpRequest.onreadystatechange = function() {
        var fSelected = forummenu.selectedIndex;
        runJS(httpRequest);
        forummenu.selectedIndex = fSelected;
    };
    httpRequest.open('GET', 'getforums.php?course='+course, true);
    httpRequest.send('');
    
    if (forummenu.selectedIndex != 0) {
        d3Graph();
    }
}

function toTimestamp(year,month,day,hour,minute,second) {
    var datum = new Date(Date.UTC(year,month-1,day,hour,minute,second));
    return datum.getTime()/1000;
}

function runJS(httpRequest) {
    var coursemenu = document.getElementById("menucourse");
    var forummenu = document.getElementById("menuforum");
    
    if (httpRequest.readyState == 4) {
        if (httpRequest.status == 200) {
            eval(httpRequest.responseText);
        } else {
            alert('There was a problem with the request.');
        }
    }
}

function nodeclick(d) {
    var param = 'chooselog=1&showusers=1&showcourses=1&date=0&modaction=c&edulevel=-1&logreader=logstore_standard&id='
                 +forumgraph.courseid+'&modid='+forumgraph.modid+'&user='+d.userid;
    window.open(forumgraph.wwwroot+'/report/log/index.php?'+param, '_blank', 'location=yes,height=600,width=800,scrollbars=yes,status=yes');
}

function toggleNodeLabel() {
    var svg = d3.select("#forumgraphsvg").transition();
    if (showingLabel) {
        svg.selectAll("text").style("display", "none");
        showingLabel = 0;
    } else {
        svg.selectAll("text").style("display", "inline");
        showingLabel = 1;
    }
}

function d3Graph() {
    // D3 script
    var width = 800,
        height = 600,
        markerWidth = 6,
        markerHeight = 6,
        refX = 10,
        refY = 0;

    var color = d3.scale.category10();

    var force = d3.layout.force()
        .charge(-300)
        .linkDistance(120)
        .size([width, height]);

    var svg = d3.select("#forumgraphsvg").append("svg")
            .attr("width", width)
            .attr("height", height);
    
    // Tooltips
    var div = d3.select("#forumgraphsvg").append("div")   
            .attr("class", "forumgraphtooltip")               
            .style("opacity", 0);
    
    // build the arrow.
    svg.append("svg:defs").selectAll("marker")
        .data(["end"])
        .enter().append("svg:marker")
        .attr("id", "end")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", refX)
        .attr("refY", refY)
        .attr("markerWidth", markerWidth)
        .attr("markerHeight", markerHeight)
        .attr("orient", "auto")
        .append("svg:path")
        .attr("d", "M0,-5L10,0L0,5");
    
    d3.json("getjson.php?forum="+forumgraph.forum, function(error, graph) {
        force.nodes(graph.nodes)
            .links(graph.links)
            .start();
        
        var linkedByIndex = {};
        graph.links.forEach(function(d) {
            linkedByIndex[d.source.index + "," + d.target.index] = 1;
        });
        
        function isConnected(a, b) {
            return linkedByIndex[a.index + "," + b.index] || linkedByIndex[b.index + "," + a.index] || a.index == b.index;
        }
        
        var path = svg.append("svg:g").selectAll("path")
            .data(graph.links)
            .enter().append("svg:path")
            .attr("class", "link")
            .attr("marker-end", "url(#end)")
            .style("stroke-width", function(d) { return Math.sqrt(d.value); });

        var node = svg.selectAll(".node")
            .data(graph.nodes)
            .enter().append("g")
            .attr("class", "node")
            .style("fill", function(d) { return color(d.group); })
            .on("mouseover", fade(.1, true))
            .on("mouseout", fade(1, false))
            .on("click", nodeclick)
            .call(force.drag);
        
        // add the nodes
        node.append("circle")
            .attr("r", function(d) {
                if (d.size) {
                    d.radius = Math.sqrt(d.size)*5;
                } else {
                    d.radius = 5;
                }
                return d.radius;
            });
        
        // add the text (label)
        node.append("text")
            .attr("x", 12)
            .attr("dy", ".35em")
            .text(function(d) { return d.name; });
        
        force.on("tick", function() {
            path.attr("d", function(d) {
                var dx = d.target.x - d.source.x,
                    dy = d.target.y - d.source.y,
                    dr = Math.sqrt(dx * dx + dy * dy);
                
                // x and y distances from center to outside edge of target node
                var offsetX = (dx * d.target.radius) / dr;
                var offsetY = (dy * d.target.radius) / dr;
                
                return "M" + 
                    d.source.x + "," + 
                    d.source.y + "A" + 
                    dr + "," + dr + " 0 0,1 " + 
                    (d.target.x - offsetX) + "," + 
                    (d.target.y - offsetY);
            });

            node.attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
        });
        
        var k = Math.sqrt(node.length / (width * height));
        force.charge(-10 / k)
             .gravity(100 * k);
        
        function fade(opacity, mouseover) {
            return function(d) {
                node.style("stroke-opacity", function(o) {
                    thisOpacity = isConnected(d, o) ? 1 : opacity;
                    this.setAttribute('fill-opacity', thisOpacity);
                    return thisOpacity;
                });

                path.style("opacity", function(o) {
                    return o.source === d || o.target === d ? 1 : opacity;
                });
                
                if (mouseover) {
                    div.transition()
                        .duration(100)
                        .style("opacity", .9);
                    div.html(d.name+"<br /><strong>"+d.discussion+"</strong>D <strong>"+d.reply+"</strong>R")
                        .style("left", (d3.event.pageX) + "px")
                        .style("top", (d3.event.pageY - 50) + "px");
                } else {
                    div.transition()
                        .duration(200)
                        .style("opacity", 0);
                }
            };
        }
    });
}

require(['jquery'], function($) {
    $(function() {
        var schoolmenu = document.getElementById("menuschool");
        var coursemenu = document.getElementById("menucourse");
        var forummenu = document.getElementById("menuforum");
        if (schoolmenu.selectedIndex != 0) {
            loadCourseMenu(schoolmenu.options[schoolmenu.selectedIndex].value);
        }
    });
});
