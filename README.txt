Forum Graph Report for Moodle
-------------------------------------

===ABOUT===
The Forum Graph Report analyse interactions in a single Forum activity and create a force-directed graph with the following features:
- Each node is a single user (node size depends on the no. of posts by the user).
- Each edge represent the interaction between 2 users (i.e. a user replied to another user post). Thickness indicating the no. of replies and arrow indicating who was repling.
- Force layout with draggable node.
- Two different node colours for teachers and students.
- Button to toggle the display of node label (user full name).
- Tooltip showing user full name, no. of discussions and no. of replies when rollovering node.
- Click on a node and a new window will popup showing the log (report_log in core Moodle) of the user posting/replying activities in the forum.
- A table summarising the total no. of discussions and replies in the forum, as well as the top three user who post the most.

===REMARKS===
The implementation of this report is in its early stage and it may have problems when it is installed in your Moodle. It was tested in Moodle 3.1.1 as of mid-August 2016.

One known problem is that courses not in any course categories cannot be selected now. Also it may not work on large forum with lots of posts.

Export graph as image/document is not supported now, but the graph itself is a <svg> HTML tag in the source code so it is possible to save it using some brower extensions or bookmarklets.

===CREDITS===
Developer: Andy Chan <ctchan.andy@gmail.com>, Programmer, CITE, HKU (http://www.cite.hku.hk)

=LINKS=
D3.js http://d3js.org/ (Library released under BSD license)
Force Layout https://github.com/mbostock/d3/wiki/Force-Layout