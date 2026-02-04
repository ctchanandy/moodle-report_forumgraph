<?php
// This file is part of Moodle - http://moodle.org/
//
// Moodle is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// Moodle is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with Moodle.  If not, see <http://www.gnu.org/licenses/>.

/**
 * Lang strings (en).
 *
 * Language strings to be used by report/forumgraph
 *
 * @package    report_forumgraph
 * @copyright  2013 Andy Chan <ctchan.andy@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
$string['forumgraph:view'] = 'View Forum Graph';
$string['pluginname'] = 'Forum Graph';
$string['forumgraph'] = 'Forum Graph';
$string['choose'] = 'Choose...';
$string['firstlevelcategory'] = 'First level course categories';
$string['usecount'] = 'Use count';
$string['nothingtodisplay'] = 'Nothing to display.';
$string['forumparticipation'] = 'Forum participation';
$string['forumname'] = 'Forum name';
$string['discussioncount'] = 'Discussions count';
$string['replycount'] = 'Replies count';
$string['viewcount'] = 'View count';
$string['usercount'] = 'User count';
$string['allcourses'] = 'All courses';
$string['usertype'] = 'Users';
$string['mostpostuser'] = 'User with most posts';
$string['andotherusers'] = 'and other {$a} users';

$string['noforumincourse'] = 'No forum in course';
$string['toggleauthorname'] = 'Toggle author name';
$string['errornotopcategory'] = 'Selected course must be inside a course category.';

$string['privacy:metadata'] = 'The Forum Graph report displays existing forum and user data and does not store any additional personal data. When generating the graph it reads and temporarily exposes the following personal data from core tables: user id, full name, username, role, last access timestamp, counts of posts, discussions and replies, and forum post timestamps. These data are displayed in the graph and tooltips and are not stored permanently by this plugin.';

// UI strings for JavaScript
$string['graph_settings'] = 'Graph settings';
$string['color_scheme'] = 'Color scheme';
$string['palette_preview'] = 'Palette preview';
$string['node_color'] = 'Node color';
$string['node_label'] = 'Node label';
$string['label_position'] = 'Label position';
$string['label_color'] = 'Label color';
$string['label_size'] = 'Label size';
$string['edge_color'] = 'Edge color';
$string['node_size'] = 'Node size';
$string['edge_thickness'] = 'Edge thickness';
$string['edge_style'] = 'Edge style';
$string['show_arrows'] = 'Show arrowheads';
$string['layout'] = 'Layout';
$string['reset'] = 'Reset';
$string['download_png'] = 'Download PNG';
$string['zoom_toggle_title'] = 'Toggle wheel-zoom (or use Ctrl/Cmd + wheel)';
$string['zoom_on'] = 'Zoom: On';
$string['zoom_off'] = 'Zoom: Off';
$string['automatic_group_colors'] = 'Group colors (automatic)';
$string['single_color'] = 'Single color';
$string['category10'] = 'Category10';
$string['vivid'] = 'Vivid';
$string['pastel'] = 'Pastel';
$string['warm'] = 'Warm';
$string['cool'] = 'Cool';
$string['full_name'] = 'Full name';
$string['first_name'] = 'First name';
$string['last_name'] = 'Last name';
$string['username'] = 'Username';
$string['none_hide_labels'] = 'None (hide labels)';
$string['label_pos_right'] = 'Right';
$string['label_pos_left'] = 'Left';
$string['label_pos_center'] = 'Center (below)';
$string['curve'] = 'Curve';
$string['straight'] = 'Straight';
$string['force_balanced'] = 'Force (balanced)';
$string['force_tight'] = 'Force (tight)';
$string['force_loose'] = 'Force (spaced)';
$string['circular'] = 'Circular';
$string['grid'] = 'Grid';
$string['loading_graph'] = 'Loading graph...';
$string['export_downscale_warning'] = 'Export size is large; the image will be downscaled to avoid huge files.';
$string['posts_label'] = 'Posts';
$string['discussions_label'] = 'Discussions';
$string['replies_label'] = 'Replies';
$string['role_label'] = 'Role';
$string['last_seen'] = 'Last seen:';
$string['posts_last_7d'] = 'Posts (last 7d)';
$string['avg_posts_per_user'] = 'Avg posts / user';
$string['active_contributors'] = 'Active contributors';
$string['unanswered_threads'] = 'Unanswered threads';
$string['last_activity'] = 'Last activity';
$string['avgreplies'] = 'Avg replies / discussion';
$string['top_posters'] = 'Top contributors';
$string['show_names'] = 'Show Names';
$string['hide_names'] = 'Hide Names';

$string['graph_help_title'] = 'Tips';
$string['graph_help_pan'] = 'Pan: click and drag empty space.';
$string['graph_help_zoom'] = 'Zoom: use the Zoom toggle, or hold Ctrl/Cmd and scroll.';
$string['graph_help_drag'] = 'Drag node: move a node to explore connections.';
$string['graph_help_drag_release'] = 'Release: nodes resume layout movement.';
$string['graph_help_fit'] = 'Fit to graph: double‑click the graph.';

$string['date_range_start'] = 'Start date';
$string['date_range_end'] = 'End date';
$string['apply'] = 'Apply';
$string['posts_in_range'] = 'Posts in range: {$a}';
$string['percent_of_total'] = 'Percent of total posts: {$a}%';
$string['range_stats_title'] = 'Selected period stats';

$string['date_range_help'] = 'Limits: {$a}; used to include only posts created in this interval.';
$string['last_7_days'] = 'Last 7d';
$string['last_30_days'] = 'Last 30d';
$string['show_all_posts'] = 'Reset range';
$string['in_range'] = '{$a} in range ({$b}%)';
$string['in_range_avg'] = 'in range: {$a}';
$string['in_range_simple'] = 'in range: {$a}';

$string['graph_touch_hint'] = 'Pinch to zoom, drag to pan, tap node for details';
$string['wheel_zoom_off'] = 'Wheel zoom off';
$string['wheel_zoom_on'] = 'Wheel zoom on';
$string['range_summary'] = 'Showing posts from {$a->from} → {$a->to} ({$a->count} posts, {$a->percent}% of total)';
$string['range_summary_all'] = 'Showing all posts ({$a->count} total; {$a->from} → {$a->to})';
