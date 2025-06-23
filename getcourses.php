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
 * Get a list of courses and return JavaScript code for adding options to dropdown list
 *
 * @package    report_forumgraph
 * @copyright  2013 Andy Chan <ctchan.andy@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require('../../config.php');
require_once($CFG->dirroot.'/report/forumgraph/lib.php');

require_login();

$category = required_param('category', PARAM_INT);

$visible_courses = array();
$course_names = array();

// Get courses under first level of category
if ($first_level_courses = get_courses($category, 'c.sortorder ASC', 'c.id,c.sortorder,c.visible,c.fullname,c.shortname,c.summary')) {
    foreach ($first_level_courses as $flc) {
        $context = context_course::instance($flc->id);
        if (has_capability('moodle/course:view', $context)) {
            if ($DB->record_exists('forum_discussions', array('course'=>$flc->id))) {
                $visible_courses[] = $flc->id;
                $course_names[$flc->id] = $flc->fullname;
            }
        }
    }
}

report_forumgraph_get_category_courses($category, $visible_courses, $course_names);

$return = '';
// clear the list anyway
$return .= 'for (i=coursemenu.length-1; i>0; i--) { coursemenu.remove(i); }';
if (!empty($course_names)) {
    $index = 1;
    foreach ($course_names as $courseid => $coursename) {
        $return .= 'opt = document.createElement("option");';
        $return .= 'opt.value = "'.$courseid.'";';
        $return .= 'opt.text = "'.$coursename.'";';
        $return .= 'coursemenu.add(opt, null);';
        $index++;
    }
}

echo $return;
