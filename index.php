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
 * Forum report, with a force-directed graph showing interactions of posts
 * A JavaScript library, D3.js (http://d3js.org/, BSD license) is used to plot the SVG graph
 *
 * @package    report_forumgraph
 * @copyright  2013 Andy Chan <ctchan.andy@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');
require_once($CFG->dirroot.'/report/forumgraph/lib.php');
require_once($CFG->libdir.'/adminlib.php');

$PAGE->requires->js('/report/forumgraph/d3.v3.min.js');

$school = optional_param('school', 0, PARAM_INT);
$course = optional_param('course', 0, PARAM_INT);
$forum = optional_param('forum', 0, PARAM_INT);

$hostid = $CFG->mnet_localhost_id;
if (empty($course)) {
    $site = get_site();
    $course = $site->id;
}

$params = array();
if ($school !== 0) {
    $params['school'] = $school;
}
if ($course !== 0) {
    $params['course'] = $course;
}
if ($forum !== 0) {
    $params['forum'] = $forum;
}

if ($hostid == $CFG->mnet_localhost_id) {
    $course_obj = $DB->get_record('course', array('id'=>$course), '*', MUST_EXIST);
} else {
    $course_stub           = $DB->get_record('mnet_log', array('hostid'=>$hostid, 'course'=>$course), '*', true);
    $course_obj->id        = $course;
    $course_obj->shortname = $course_stub->coursename;
    $course_obj->fullname  = $course_stub->coursename;
}

require_login($course_obj);

$strreports = get_string('reports');

$context = context_course::instance($course);

require_capability('report/forumgraph:view', $context);

if ($course && $forum) {
    $cm = get_coursemodule_from_instance("forum", $forum, $course);
}

// get school
if (!$school) {
    if ($course) {
        // if course is available
        $course_obj = $DB->get_record('course', array("id"=>$course));
        if ($course_obj->category) {
            $course_category = $DB->get_record('course_categories', array("id"=>$course_obj->category));
            if ($course_category->parent) {
                $categories = explode('/', $course_category->path);
                $school = $categories[1];
            } else {
                $school = $course_category->id;
            }
        }
    }
}

// school menu
$schooloptions = report_forumgraph_get_schooloptions();
$schoolmenu = html_writer::select($schooloptions, "school", $school, get_string('choose', 'report_forumgraph'), array('onchange'=>'loadCourseMenu(this.options[this.selectedIndex].value);'));

// course menu
if ($course || (!$course && $school)) {
    $courses = array();
    $coursenames = array();
    
    // 20140721: get courses under first level of category
    if ($first_level_courses = get_courses($school, 'c.sortorder ASC', 'c.id,c.sortorder,c.visible,c.fullname,c.shortname,c.summary')) {
        foreach ($first_level_courses as $flc) {
            $context = context_course::instance($flc->id);
            if (has_capability('moodle/course:view', $context)) {
                if ($DB->record_exists('forum_discussions', array('course'=>$flc->id))) {
                    $courses[] = $flc->id;
                    $coursenames[$flc->id] = $flc->fullname;
                }
            }
        }
    }
    
    report_forumgraph_get_category_courses($school, $courses, $coursenames);
    $coursemenu = html_writer::select($coursenames, 'course', $course, get_string('choose', 'report_forumgraph'), array('onchange'=>'loadForumMenu(this.options[this.selectedIndex].value)'));
    
} else {
    $coursemenu = html_writer::select(array(), 'course', $course, get_string('choose', 'report_forumgraph'), array('onchange'=>'loadForumMenu(this.options[this.selectedIndex].value)'));
}

// forum menu
$forumoptions = report_forumgraph_get_forumoptions($course);
$forummenu = html_writer::select($forumoptions, "forum", $forum, get_string('choose', 'report_forumgraph'));

// Print the header.
$displaycoursename = isset($coursenames[$course]) ? $coursenames[$course] : '---';
$PAGE->set_url('/report/forumgraph/index.php', $params);
$PAGE->set_pagelayout('report');
$PAGE->set_title(get_string('forumgraph', 'report_forumgraph').$displaycoursename);
$PAGE->set_heading(get_string('forumgraph', 'report_forumgraph').$displaycoursename);

echo $OUTPUT->header();

// Submit buttons
$submit = '<input type="submit" value="'.get_string('view').'" />';

echo '<form action="index.php" method="post">'."\n";
echo '<div>';

// Table contain the dropdown menu for selection of school, course and forum
$table = new html_table();
$table->size  = array('25%', '75%');
$table->align = array('right','left');
$table->data  = array();

$cell1 = new html_table_cell();
$cell1->text = html_writer::label(get_string('firstlevelcategory', 'report_forumgraph'), 'menuschool');
$cell2 = new html_table_cell();
$cell2->text = $schoolmenu;
$row1 = new html_table_row();
$row1->cells = array($cell1, $cell2);

$cell3 = new html_table_cell();
$cell3->text = html_writer::label(get_string('course'), 'menucourse');
$cell4 = new html_table_cell();
$cell4->text = $coursemenu;
$row2 = new html_table_row();
$row2->cells = array($cell3, $cell4);

$cell5 = new html_table_cell();
$cell5->text = html_writer::label(get_string('forum', 'forum'), 'menuforum');
$cell6 = new html_table_cell();
$cell6->text = $forummenu;
$row3 = new html_table_row();
$row3->cells = array($cell5, $cell6);

$cell7 = new html_table_cell();
$cell7->text = '';
$cell8 = new html_table_cell();
$cell8->text = $submit;
$row4 = new html_table_row();
$row4->cells = array($cell7, $cell8);

$table->data = array($row1, $row2, $row3, $row4);

echo html_writer::table($table);
echo '</div>';
echo '</form>';

// Print forum name as heading
$heading = '';
if ($forum) $heading = $forumoptions[$forum];
echo $OUTPUT->heading($heading);

if (!empty($school) && !empty($course) && !empty($forum)) {
    // Get some important information and statisitic for the selected forum
    $forum_obj = $DB->get_record('forum', array('id'=>$forum));
    $discussions = $DB->get_records('forum_discussions', array('forum'=>$forum_obj->id));
    
    $mpu_str = '';
    if ($discussions) {
        $discussion_ids = array_keys($discussions);
        
        // Get total no. of replies in forum
        $query_params = array('parent'=>0);
        list($in_sql, $in_params) = $DB->get_in_or_equal($discussion_ids, SQL_PARAMS_NAMED);
        $params = array_merge($in_params, $query_params);
        $replies_count = $DB->count_records_sql("SELECT COUNT(*) FROM {forum_posts} WHERE discussion $in_sql AND parent <> :parent", $params);
        
        // Get top 3 users who posted most
        $limit = 3;
        $mpus = $DB->get_records_sql("SELECT userid, COUNT(fp.userid) AS postcount FROM {forum_posts} fp WHERE discussion $in_sql GROUP BY fp.userid ORDER BY postcount DESC LIMIT $limit", $in_params);
        
        if ($mpus) {
            $mpu_str .= '<ol id="topposters">';
            foreach ($mpus as $mpu) {
                $log_href = $CFG->wwwroot.'/report/log/index.php?chooselog=1&showusers=1&showcourses=1&date=0&modaction=add&logformat=showashtml&host_course=1%2F';
                $log_href .= $course.'&modid='.$cm->id.'&user='.$mpu->userid;
                $postuser = $DB->get_record('user', array('id'=>$mpu->userid));
                $mpu_str .= "<li><a href='$log_href' target='_blank'>".fullname($postuser)."</a> ($mpu->postcount)</li>";
            }
            $lastuser = array_pop($mpus);
            $samenumpostuser = $DB->get_records_sql("SELECT userid, COUNT(fp.userid) AS postcount FROM {forum_posts} fp WHERE discussion $in_sql GROUP BY fp.userid HAVING postcount = ".$lastuser->postcount, $in_params);
            if ($samenumpostuser) $mpu_str = substr($mpu_str, 0, -5)." ".get_string('andotherusers', 'report_forumgraph', count($samenumpostuser))."</li>";
            $mpu_str .= '</ol>';
        }
    }
    
    // Get top 3 discussion with most replies
    
    
    // Table showing some important information and statisitic for the selected forum
    $summarytable = new html_table();
    $summarytable->size  = array('25%', '75%');
    $summarytable->align = array('right','left');
    
    $cell1 = new html_table_cell();
    $cell1->text = get_string('discussioncount', 'report_forumgraph');
    $cell2 = new html_table_cell();
    $cell2->text = count($discussions);
    $row1 = new html_table_row();
    $row1->cells = array($cell1, $cell2);
    
    $cell3 = new html_table_cell();
    $cell3->text = get_string('replycount', 'report_forumgraph');
    $cell4 = new html_table_cell();
    $cell4->text = $replies_count;
    $row2 = new html_table_row();
    $row2->cells = array($cell3, $cell4);
    
    $cell5 = new html_table_cell();
    $cell5->text = get_string('mostpostuser', 'report_forumgraph');
    $cell6 = new html_table_cell();
    $cell6->text = $mpu_str;
    $row3 = new html_table_row();
    $row3->cells = array($cell5, $cell6);
    
    $summarytable->data = array($row1, $row2, $row3);
    echo html_writer::table($summarytable);
    
    echo $OUTPUT->box_start('generalbox', 'forumgraphsvg');
    // button to show node label
    echo $OUTPUT->box_start('generalbox', 'forumgraphoption');
    echo '<input name="toggleNodeLabelButton" type="button" value="'.get_string('toggleauthorname', 'report_forumgraph').'" onclick="toggleNodeLabel()" />';
    echo $OUTPUT->box_end();
    echo $OUTPUT->box_end();
}

$js_course = $course ? $course : 0;
$js_cmid   = isset($cm) ? $cm->id : 0;
$js_forum  = $forum ? $forum : 0;
$js_wwwroot = $CFG->wwwroot;

$PAGE->requires->js_init_call('M.report_forumgraph.init', array($js_forum, $js_cmid, $js_course, $js_wwwroot));

echo $OUTPUT->footer();
