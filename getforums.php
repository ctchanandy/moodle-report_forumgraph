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
 * Get a list of forum and return JavaScript code for adding options to dropdown list
 *
 * @package    report_forumgraph
 * @copyright  2013 Andy Chan <ctchan.andy@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

require_once('../../config.php');
require_once($CFG->dirroot.'/report/forumgraph/lib.php');

require_login();

$course = required_param('course', PARAM_INT);

$forums = array();

$forums = report_forumgraph_get_forumoptions($course);

$return = '';
// clear the list anyway
$return .= 'for (i=forummenu.length-1; i>0; i--) { forummenu.remove(i); }';
if (!empty($forums)) {
    $index = 1;
    foreach ($forums as $fid => $forumname) {
        $return .= 'opt = document.createElement("option");';
        $return .= 'opt.value = "'.$fid.'";';
        $return .= 'opt.text = "'.$forumname.'";';
        $return .= 'forummenu.add(opt, null);';
        $index++;
    }
}

echo $return;
