<?php
// This file is part of Mindmap module for Moodle - http://moodle.org/
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
 * Defines the APIs used by report_forumgraph
 *
 * @package    report_forumgraph
 * @copyright  2013 Andy Chan <ctchan.andy@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

defined('MOODLE_INTERNAL') || die;

require_once("$CFG->libdir/adminlib.php");
require_once($CFG->dirroot.'/course/lib.php');

/**
 * Get all child categories by the given parent category id
 * Replace the now deprecated get_child_categories()
 *
 * @param int $parentid id of the parent category to check
 * @return array all child categories
 */
function report_forumgraph_get_child_categories($parentid) {
    global $DB;
    $rv = array();
    $sql = context_helper::get_preload_record_columns_sql('ctx');
    $records = $DB->get_records_sql("SELECT c.*, $sql FROM {course_categories} c ".
            "JOIN {context} ctx on ctx.instanceid = c.id AND ctx.contextlevel = ? WHERE c.parent = ? ORDER BY c.sortorder",
            array(CONTEXT_COURSECAT, $parentid));
    foreach ($records as $category) {
        context_helper::preload_from_record($category);
        if (!$category->visible && !has_capability('moodle/category:viewhiddencategories', context_coursecat::instance($category->id))) {
            continue;
        }
        $rv[] = $category;
    }
    return $rv;
}

/**
 * Get all first level course categories for use in dropdown list
 *
 * @return array top level course categories
 */
function report_forumgraph_get_schooloptions() {
    $categories = report_forumgraph_get_child_categories(0);
    $schooloptions = array();
    if (!empty($categories)) {
        foreach ($categories as $category) {
            $schooloptions[$category->id] = $category->name;
        }
    }
    asort($schooloptions);
    
    return $schooloptions;
}

/**
 * Get two arrays storing all courses in the category
 * All sub-categories in different level are also retrieved recursively
 *
 * @param int $category category id for getting sub-categories/courses inside
 * @param array &$visible_courses store ids of all visible courses, passed by reference
 * @param array &$course_names store names of all visible courses, passed by reference
 */
function report_forumgraph_get_category_courses($category, &$visible_courses, &$course_names) {
    global $DB;
    // Big assumption: no courses are in the top level, i.e. not in any categories
    if ($categories = report_forumgraph_get_child_categories($category)) {
        $usearr = $categories;
        for ($i=0; $i<sizeof($usearr); $i++) {
            if ($usearr[$i]->coursecount > 0) {
                if ($courses = get_courses($usearr[$i]->id, 'c.sortorder ASC', 'c.id,c.sortorder,c.visible,c.fullname,c.shortname,c.summary')) {
                    $usearr[$i]->courses = array();
                    foreach ($courses as $course) {
                        $context = context_course::instance($course->id);
                        if (has_capability('moodle/course:view', $context)) {
                            if ($DB->record_exists('forum_discussions', array('course'=>$course->id))) {
                                $usearr[$i]->courses[] = $course;
                                $visible_courses[] = $course->id;
                                $course_names[$course->id] = "[".$usearr[$i]->name."] ".$course->fullname;
                            }
                        }
                    }
                }
            }
            report_forumgraph_get_category_courses($categories[$i]->id, $visible_courses, $course_names);
        }
    }
}

/**
 * Get all forums in the course for use in dropdown list
 *
 * @param int $cid course id
 * @return array all forum in the course
 */
function report_forumgraph_get_forumoptions($cid) {
    global $DB;
    $forumoptions = array();
    if ($course = $DB->get_record('course', array('id'=>$cid))) {
        if ($forums = $DB->get_records('forum', array('course'=>$cid), 'id DESC')) {
            foreach ($forums as $forum) {
                $cm = get_coursemodule_from_instance("forum", $forum->id, $cid);
                $context = context_module::instance($cm->id);
                //if (has_capability('mod/forum:addinstance', $context)) {
                if (has_capability('mod/forum:viewdiscussion', $context)) {
                    if ($DB->record_exists('forum_discussions', array('forum'=>$forum->id))) {
                        $forumoptions[$forum->id] = $forum->name;
                    }
                }
            }
        } else {
            $forumoptions[0] = get_string('noforumincourse', 'report_forumgraph');
        }
    }
    return $forumoptions;
}

/**
 * Generate node and edge arrays by analysing all forum posts
 * Node is the author, edge is the interaction (i.e. reply)
 * An array used for mapping used id to array index is also returned
 *
 * @param int $fid forum id
 * @return array 3 arrays: nodes, edges and user id mapping
 */
function report_forumgraph_get_forum_nodes_edges($fid, $from = null, $to = null) {
    global $DB;
    if ($forum = $DB->get_record('forum', array('id'=>$fid))) {
        if ($dids = $DB->get_records('forum_discussions', array('forum'=>$fid), '', 'id')) {
            $discussion_ids = array();
            foreach ($dids as $d) {
                $discussion_ids[] = $d->id;
            }
            list($in_sql, $in_params) = $DB->get_in_or_equal($discussion_ids, SQL_PARAMS_NAMED);
            // compute forum-wide bounds and totals (based on creation time)
            $firstpost_ts = $DB->get_field_sql("SELECT MIN(created) FROM {forum_posts} WHERE discussion $in_sql", $in_params);
            $lastpost_ts  = $DB->get_field_sql("SELECT MAX(created) FROM {forum_posts} WHERE discussion $in_sql", $in_params);
            $total_posts = $DB->count_records_select('forum_posts', "discussion $in_sql", $in_params);

            // build selection for posts, optionally constrained by provided timestamps
            $select = "discussion $in_sql";
            $params = $in_params;
            if (!is_null($from)) {
                $select .= " AND created >= :from";
                $params['from'] = $from;
            }
            if (!is_null($to)) {
                $select .= " AND created <= :to";
                $params['to'] = $to;
            }

            if ($posts = $DB->get_records_select('forum_posts', $select, $params)) {
                $context = context_course::instance($forum->course);
                $nodes = array();
                $edges = array();
                $uid_mapping = array();
                $count = 0;
                foreach ($posts as $post) {
                    $author = $DB->get_record('user', array('id'=>$post->userid));
                    $sql = "SELECT roleid FROM {role_assignments} WHERE userid = :userid AND contextid = :contextid GROUP BY userid";
                    $authorrole = $DB->get_field_sql($sql, array('userid'=>$post->userid, 'contextid'=>$context->id));
                    
                    // nodes array
                    if (!isset($nodes[$author->id])) {
                        $nodes[$author->id]['name'] = $author->lastname." ".$author->firstname;
                        $nodes[$author->id]['userid'] = $author->id;
                        $nodes[$author->id]['username'] = isset($author->username) ? $author->username : '';
                        $nodes[$author->id]['size'] = 1;
                        $nodes[$author->id]['discussion'] = $post->parent ? 0:1;
                        $nodes[$author->id]['reply'] = $post->parent ? 1:0;
                        $nodes[$author->id]['group'] = ($authorrole==5)?1:5;
                        // capture last access timestamp and role shortname for richer tooltips
                        $nodes[$author->id]['lastaccess'] = isset($author->lastaccess) ? (int)$author->lastaccess : 0;
                        $roleshort = '';
                        if ($authorrole) {
                            $roleshort = $DB->get_field('role', 'shortname', array('id' => $authorrole));
                        }
                        $nodes[$author->id]['role'] = $roleshort;
                        $uid_mapping[$author->id] = $count;
                        $count++;
                    } else {
                        $nodes[$author->id]['size']++;
                        if (!($post->parent)) $nodes[$author->id]['discussion']++ ;
                        if ($post->parent) $nodes[$author->id]['reply']++;
                    }
                    
                    // edges array
                    if ($post->parent) {
                        if (!isset($posts[$post->parent])) {
                            // Parent post is outside the filtered set; skip to avoid invalid mapping.
                            continue;
                        }
                        $parent = $posts[$post->parent];
                        if ($post->userid != $parent->userid) {
                            if (!isset($edges[$post->userid."_".$parent->userid]) && !isset($edges[$parent->userid."_".$post->userid])) {
                                $edges[$post->userid."_".$parent->userid] = 1;
                            } else {
                                if (isset($edges[$post->userid."_".$parent->userid])) {
                                    $edges[$post->userid."_".$parent->userid]++;
                                } else {
                                    $edges[$parent->userid."_".$post->userid]++;
                                }
                            }
                        }
                    }
                }
                // posts_in_range is the count of posts returned by the query
                $posts_in_range = count($posts);
                // compute additional range stats
                $unique_authors_in_range = count($nodes);
                $discussion_ids_in_range = array();
                $discussion_has_reply = array();
                $replies_in_range = 0;
                foreach ($posts as $p) {
                    $discussion_ids_in_range[] = $p->discussion;
                    if (!empty($p->parent)) {
                        $replies_in_range++;
                        $discussion_has_reply[$p->discussion] = true;
                    }
                }
                $unique_discussions_in_range = array_unique($discussion_ids_in_range);
                $discussioncount_in_range = count($unique_discussions_in_range);
                $unanswered_in_range = 0;
                foreach ($unique_discussions_in_range as $did) {
                    if (empty($discussion_has_reply[$did])) {
                        $unanswered_in_range++;
                    }
                }

                $meta = array(
                    'first_post_ts' => (int)$firstpost_ts,
                    'last_post_ts' => (int)$lastpost_ts,
                    'total_posts' => (int)$total_posts,
                    'posts_in_range' => (int)$posts_in_range,
                    'unique_authors_in_range' => (int)$unique_authors_in_range,
                    'discussioncount_in_range' => (int)$discussioncount_in_range,
                    'replies_in_range' => (int)$replies_in_range,
                    'unanswered_in_range' => (int)$unanswered_in_range,
                );
                $return = array($nodes, $edges, $uid_mapping, $meta);
                return $return;
            }
        }
    }
    return false;
}

/**
 * Create JSON file by iterating nodes and edges array
 * Simply treat it as string instead of using build-in PHP function
 *
 * @param array $nodes Nodes array
 * @param array $edges Edges array
 * @param array $uid_mapping Array of user id mapping to index of nodes array
 * @return array 3 arrays: nodes, edges and user id mapping
 */
function report_forumgraph_create_json($nodes, $edges, $uid_mapping, $meta = array()) {
    $lastnode = end($nodes);
    reset($nodes);
    $json = '{';
    $json .= '"nodes":[';
    foreach ($nodes as $node) {
        $json .= '{"name":"'.$node['name'].'", '.
                  '"userid":'.$node['userid'].', '.
                  '"username":"'.(isset($node['username'])? $node['username'] : '').'", '.
                  '"size":'.$node['size'].', '.
                  '"discussion":'.$node['discussion'].', '.
                  '"reply":'.$node['reply'].', '.
                  '"group":'.$node['group'].', '.
                  '"lastaccess":'.(isset($node['lastaccess']) ? $node['lastaccess'] : 0).', '.
                  '"role":"'.(isset($node['role']) ? addslashes($node['role']) : '').'"}';
        if ($node['name'] != $lastnode['name']) $json .= ',';
    }
    $json .= '],';
    
    $json .= '"links":[';
    $edgeitems = array();
    foreach ($edges as $idpair=>$value) {
        $pair = explode('_', $idpair);
        $source = (int)$pair[0];
        $target = (int)$pair[1];
        if (!isset($uid_mapping[$source]) || !isset($uid_mapping[$target])) {
            // skip edges missing valid node mappings to avoid invalid JSON
            continue;
        }
        $edgeitems[] = '{"source":'.$uid_mapping[$source].', "target":'.$uid_mapping[$target].', "value":'.$value.'}';
    }
    $json .= implode(',', $edgeitems);
    $json .= ']';
    // append metadata if provided
    if (!empty($meta) && is_array($meta)) {
        $json .= ',';
        $json .= '"meta":{';
        $mkeys = array_keys($meta);
        foreach ($mkeys as $i => $k) {
            $json .= '"'.addslashes($k).'":'.(is_numeric($meta[$k]) ? (int)$meta[$k] : '"'.addslashes($meta[$k]).'"');
            if ($i < count($mkeys) - 1) $json .= ',';
        }
        $json .= '}';
    }
    $json .= '}';
    return $json;
}

/**
 * This function extends the navigation with the report items
 *
 * @param navigation_node $navigation The navigation node to extend
 * @param stdClass $course The course to object for the report
 * @param stdClass $context The context of the course
 */
function report_forumgraph_extend_navigation_course($navigation, $course, $context) {
    if (has_capability('report/forumgraph:view', $context)) {
        $url = new moodle_url('/report/forumgraph/index.php', array('course'=>$course->id));
        $navigation->add(get_string('pluginname', 'report_forumgraph'), $url, navigation_node::TYPE_SETTING, null, null, new pix_icon('i/report', ''));
    }
}

/**
 * Add report link into activity (module) settings navigation.
 *
 * @param navigation_node $navigation The module settings node to extend
 * @param cm_info $cm The course module
 */
function report_forumgraph_extend_navigation_module(navigation_node $navigation, cm_info $cm) {
    if (empty($cm->modname) || $cm->modname !== 'forum') {
        return;
    }
    $context = context_module::instance($cm->id);
    if (!has_capability('report/forumgraph:view', $context)) {
        return;
    }
    $url = new moodle_url('/report/forumgraph/index.php', array(
        'course' => $cm->course,
        'forum' => $cm->instance,
    ));
    $navigation->add(get_string('forumgraph', 'report_forumgraph'), $url, navigation_node::TYPE_SETTING, null, null, new pix_icon('i/report', ''));
}
