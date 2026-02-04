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
 * Create the JSON file with nodes and edges data
 *
 * @package    report_forumgraph
 * @copyright  2013 Andy Chan <ctchan.andy@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');
require_once($CFG->dirroot.'/report/forumgraph/lib.php');

require_login();

$forum = required_param('forum', PARAM_INT);
// optional date range (unix timestamps). If 0 or missing, treat as no bound.
$from = optional_param('from', 0, PARAM_INT);
$to   = optional_param('to', 0, PARAM_INT);
$from = $from ? $from : null;
$to = $to ? $to : null;

global $DB;
// Check forum exists and user has capability in the course context.
$forumrec = $DB->get_record('forum', array('id' => $forum), '*', MUST_EXIST);
$context = context_course::instance($forumrec->course);
require_capability('report/forumgraph:view', $context);

// Ensure from/to are sensible
if ($from !== null && $to !== null && $from > $to) {
	// swap
	$tmp = $from;
	$from = $to;
	$to = $tmp;
}

// Retrieve nodes/edges and metadata for the optional time range
list($nodes, $edges, $uid_mapping, $meta) = report_forumgraph_get_forum_nodes_edges($forum, $from, $to);
$json = report_forumgraph_create_json($nodes, $edges, $uid_mapping, $meta);

header('Content-Type: application/json; charset=utf-8');
echo $json;
