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
$PAGE->requires->jquery();

$course = optional_param('course', 0, PARAM_INT);
$forum = optional_param('forum', 0, PARAM_INT);
// optional date range filters (unix timestamps passed as ints)
$from = optional_param('from', '', PARAM_RAW_TRIMMED);
$to   = optional_param('to', '', PARAM_RAW_TRIMMED);

$hostid = $CFG->mnet_localhost_id;
if (empty($course)) {
    $site = get_site();
    $course = $site->id;
}

$params = array();

if ($course !== 0) {
    $params['course'] = $course;
}
if ($forum !== 0) {
    $params['forum'] = $forum;
}
// pass date range (YYYY-MM-DD strings) through page params so AMD module can pick them up
if (!empty($from)) {
    $params['from'] = $from;
}
if (!empty($to)) {
    $params['to'] = $to;
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


// forum menu
$forumoptions = report_forumgraph_get_forumoptions($course);
$forummenu = html_writer::select($forumoptions, "forum", $forum, get_string('choose', 'report_forumgraph'));

// Print the header.
$displaycoursename = isset($course_obj->fullname) ? $course_obj->fullname : '---';
$PAGE->set_url('/report/forumgraph/index.php', $params);
$PAGE->set_pagelayout('report');
$PAGE->set_title(get_string('forumgraph', 'report_forumgraph').': '.$displaycoursename);
$PAGE->set_heading(get_string('forumgraph', 'report_forumgraph').': '.$displaycoursename);
// load plugin styles
$PAGE->requires->css(new moodle_url('/report/forumgraph/styles.css'));

// register JS strings used by the frontend module
$PAGE->requires->strings_for_js(array(
    'graph_settings','color_scheme','palette_preview','node_color','node_label','label_size',
    'edge_color','node_size','edge_thickness','edge_style','show_arrows','layout','reset',
    'download_png','zoom_toggle_title','zoom_on','zoom_off','automatic_group_colors','single_color',
    'category10','vivid','pastel','warm','cool','full_name','first_name','last_name','username',
    'none_hide_labels','label_position','label_pos_right','label_pos_left','label_pos_center','label_color',
    'curve','straight','force_balanced','force_tight','force_loose','circular','grid',
    'loading_graph','export_downscale_warning','posts_label','discussions_label','replies_label','role_label',
    'last_seen','posts_last_7d','avg_posts_per_user','avgreplies','top_posters'
    ,'toggleauthorname','show_names','hide_names'
    , 'date_range_start','date_range_end','apply','posts_in_range','percent_of_total','range_stats_title'
    , 'date_range_help','show_all_posts','in_range','in_range_avg','in_range_simple','last_7_days','last_30_days','graph_touch_hint','wheel_zoom_off','wheel_zoom_on','range_summary','range_summary_all'
), 'report_forumgraph');

// safe get_string wrapper to avoid E_USER_NOTICE when new strings are not yet available.
function safe_get_string($identifier, $component = 'report_forumgraph') {
    try {
        $sm = get_string_manager();
        if (method_exists($sm, 'string_exists') && $sm->string_exists($identifier, $component)) {
            return get_string($identifier, $component);
        }
    } catch (Exception $e) {
        // fall through to fallback
    }
    return $identifier;
}

echo $OUTPUT->header();

// Submit buttons
$submit = '<input type="submit" value="'.get_string('view').'" />';

echo '<form action="index.php?course='.$course.'" method="post">'."\n";
echo '<div>';

// Table contain the dropdown menu for selection of school, course and forum
$table = new html_table();
$table->size  = array('25%', '75%');
$table->align = array('right','left');
$table->data  = array();

$cell5 = new html_table_cell();
$cell5->text = html_writer::label(get_string('forumname', 'report_forumgraph'), 'menuforum');
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

$table->data = array($row3, $row4);

echo html_writer::table($table);
echo '</div>';
echo '</form>';

// Print forum name as heading
$heading = '';
if ($forum) $heading = $forumoptions[$forum];
echo $OUTPUT->heading($heading);

if (!empty($course) && !empty($forum)) {
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
                $fullname = fullname($postuser);
                $shortname = shorten_text($fullname, 24);
                $mpu_str .= "<li><a href='$log_href' target='_blank' title='".s($fullname)."'><span class='fg-topcontrib-name'>".s($shortname)."</span></a> ($mpu->postcount)</li>";
            }
            $lastuser = array_pop($mpus);
            $samenumpostuser = $DB->get_records_sql("SELECT userid, COUNT(fp.userid) AS postcount FROM {forum_posts} fp WHERE discussion $in_sql GROUP BY fp.userid HAVING postcount = ".$lastuser->postcount, $in_params);
            if ($samenumpostuser) $mpu_str = substr($mpu_str, 0, -5)." ".get_string('andotherusers', 'report_forumgraph', count($samenumpostuser))."</li>";
            $mpu_str .= '</ol>';
        }
    }
    
    // Compact stats UI for the selected forum
    // compute additional useful metrics
    $discussioncount = count($discussions);
    $replycount = $replies_count;
    $unique_authors = $DB->count_records_sql("SELECT COUNT(DISTINCT userid) FROM {forum_posts} WHERE discussion $in_sql", $in_params);
    $total_posts = $DB->count_records_sql("SELECT COUNT(*) FROM {forum_posts} WHERE discussion $in_sql", $in_params);
    // unanswered threads: discussions with no replies
    $unanswered_threads = $DB->count_records_sql(
        "SELECT COUNT(*) FROM {forum_discussions} fd
           WHERE fd.forum = :forum
             AND NOT EXISTS (
                 SELECT 1 FROM {forum_posts} fp
                  WHERE fp.discussion = fd.id AND fp.parent <> 0
             )",
        array('forum' => $forum_obj->id)
    );
    $avg_replies = round($replycount / max(1, $discussioncount), 2);
    $lastpost_ts = $DB->get_field_sql("SELECT MAX(modified) FROM {forum_posts} WHERE discussion $in_sql", $in_params);
    $lastpost = $lastpost_ts ? userdate($lastpost_ts, get_string('strftimedateshort', 'langconfig')) : 'n/a';

        // compute forum-wide first post timestamp for date picker bounds
        $firstpost_ts = $DB->get_field_sql("SELECT MIN(created) FROM {forum_posts} WHERE discussion $in_sql", $in_params);
        $firstpost = $firstpost_ts ? date('Y-m-d', $firstpost_ts) : '';
        $lastpost_date = $lastpost_ts ? date('Y-m-d', $lastpost_ts) : '';

            // determine whether recent preset ranges contain any posts
            $has_last7 = $DB->count_records_select('forum_posts', "discussion $in_sql AND created >= :cutoff", array_merge($in_params, array('cutoff' => time() - 7 * 86400))) > 0;
            $has_last30 = $DB->count_records_select('forum_posts', "discussion $in_sql AND created >= :cutoff", array_merge($in_params, array('cutoff' => time() - 30 * 86400))) > 0;

        // convert submitted date strings to timestamps for DB filtering
        $from_ts = null;
        $to_ts = null;
        if (!empty($from)) {
            $t = strtotime($from);
            if ($t !== false) $from_ts = $t;
        }
        if (!empty($to)) {
            $t = strtotime($to);
            if ($t !== false) $to_ts = $t + 86399; // include full day end
        }

        // if page was loaded with a date range, compute posts in range and percentage
        $posts_in_range = 0;
        $percent_of_total = 0;
        if (!is_null($from_ts) || !is_null($to_ts)) {
            $fromq = $from_ts ? $from_ts : 0;
            $toq = $to_ts ? $to_ts : PHP_INT_MAX;
            $posts_in_range = $DB->count_records_sql("SELECT COUNT(*) FROM {forum_posts} WHERE discussion $in_sql AND created >= :from AND created <= :to", array_merge($in_params, array('from' => $fromq, 'to' => $toq)));
            if ($total_posts > 0) {
                $percent_of_total = round(($posts_in_range / $total_posts) * 100, 2);
            }
        }

    // Date range picker and comparison stats: place BEFORE the stat cards so users see controls first
    echo '<div class="fg-range-controls">';
    echo '<form id="fg-range-form" method="get" action="index.php">';
    echo '<input type="hidden" name="course" value="'.intval($course).'">';
    echo '<input type="hidden" name="forum" value="'.intval($forum).'">';
    echo '<label for="fg_date_from" title="'.safe_get_string('date_range_start','report_forumgraph').'">'.htmlspecialchars(get_string('date_range_start','report_forumgraph')).'</label> ';
    $from_val = $from ? htmlspecialchars($from) : $firstpost;
    $to_val = $to ? htmlspecialchars($to) : $lastpost_date;
    echo '<input id="fg_date_from" name="from" type="date" min="'.htmlspecialchars($firstpost).'" max="'.htmlspecialchars($lastpost_date).'" value="'. $from_val .'"> ';
    echo '<label for="fg_date_to" title="'.safe_get_string('date_range_end','report_forumgraph').'">'.htmlspecialchars(get_string('date_range_end','report_forumgraph')).'</label> ';
    echo '<input id="fg_date_to" name="to" type="date" min="'.htmlspecialchars($firstpost).'" max="'.htmlspecialchars($lastpost_date).'" value="'. $to_val .'"> ';
    // help icon with min/max in tooltip
    $range_help_text = get_string('date_range_help','report_forumgraph', $firstpost . ' - ' . $lastpost_date);
    echo '<span id="fg_date_help" class="fg-date-help" title="'.htmlspecialchars($range_help_text).'">?</span> ';
    echo '<button id="fg_apply_range" type="button">'.get_string('apply','report_forumgraph').'</button>';
    // quick preset buttons (only show if there is data in these recent windows)
    if ($has_last7) {
        echo '<button id="fg_preset_7" type="button">'.get_string('last_7_days','report_forumgraph').'</button>';
    }
    if ($has_last30) {
        echo '<button id="fg_preset_30" type="button">'.get_string('last_30_days','report_forumgraph').'</button>';
    }
    // Reset range button (server-side visible when a range is present)
    $showallstyle = (!empty($from) || !empty($to)) ? '' : 'style="display:none"';
    echo '<button id="fg_show_all" type="button" '.$showallstyle.'>'.get_string('show_all_posts','report_forumgraph').'</button>';
    echo '</form>';
    // range stats are integrated into stat cards; no separate server-rendered stats block
    // one-line summary shown above stat cards (server-rendered for initial load)
    // Always render a summary so the UI is consistent; hide via inline style only when metadata missing
    $summary_text = '';
    $summary_style = '';
    // prefer server-provided computed in-range values when page loaded with a range
    if (!is_null($from_ts) || !is_null($to_ts)) {
        $aobj = new stdClass();
        $aobj->from = $from_ts ? date('Y-m-d', $from_ts) : '';
        $aobj->to = $to_ts ? date('Y-m-d', $to_ts) : $lastpost_date;
        $aobj->count = (int)$posts_in_range;
        $aobj->percent = $percent_of_total;
        $summary_text = get_string('range_summary','report_forumgraph', $aobj);
    } else {
        // show overall summary when no range is set
        $aobj = new stdClass();
        $aobj->count = (int)$total_posts;
        $aobj->from = $firstpost ? $firstpost : '';
        $aobj->to = $lastpost_date ? $lastpost_date : '';
        $summary_text = get_string('range_summary_all','report_forumgraph', $aobj);
    }
    echo '<div id="fg_range_summary" class="fg-range-summary" '.$summary_style.'>'.htmlspecialchars($summary_text).'</div>';
    echo '</div>';

    echo $OUTPUT->box_start('generalbox', 'forumgraphstats');
    echo '<div class="fg-stats-wrapper">';

    echo '<div class="fg-stat-card">';
    echo '<div id="fg_stat_discussions" class="fg-stat-value">'.(int)$discussioncount.'</div>';
    echo '<div id="fg_stat_discussions_range" class="fg-stat-range"></div>';
    echo '<div class="fg-stat-label">'.get_string('discussions_label','report_forumgraph').'</div>';
    echo '</div>';

    echo '<div class="fg-stat-card">';
    echo '<div id="fg_stat_replies" class="fg-stat-value">'.(int)$replycount.'</div>';
    echo '<div id="fg_stat_replies_range" class="fg-stat-range"></div>';
    echo '<div class="fg-stat-label">'.get_string('replies_label','report_forumgraph').'</div>';
    echo '</div>';

    echo '<div class="fg-stat-card">';
    echo '<div id="fg_stat_users" class="fg-stat-value">'.(int)$unique_authors.'</div>';
    echo '<div id="fg_stat_users_range" class="fg-stat-range"></div>';
    echo '<div class="fg-stat-label">'.get_string('active_contributors','report_forumgraph').'</div>';
    echo '</div>';

    echo '<div class="fg-stat-card">';
    echo '<div id="fg_stat_unanswered" class="fg-stat-value">'.(int)$unanswered_threads.'</div>';
    echo '<div id="fg_stat_unanswered_range" class="fg-stat-range"></div>';
    echo '<div class="fg-stat-label">'.get_string('unanswered_threads','report_forumgraph').'</div>';
    echo '</div>';

    echo '<div class="fg-stat-card">';
    echo '<div id="fg_stat_avg_replies" class="fg-stat-value">'.htmlspecialchars($avg_replies).'</div>';
    echo '<div id="fg_stat_avg_replies_range" class="fg-stat-range"></div>';
    echo '<div class="fg-stat-label">'.get_string('avgreplies','report_forumgraph').'</div>';
    echo '</div>';

    echo '<div class="fg-stat-card">';
    echo '<div id="fg_stat_last_activity" class="fg-stat-value">'.htmlspecialchars($lastpost).'</div>';
    echo '<div class="fg-stat-label">'.get_string('last_activity','report_forumgraph').'</div>';
    echo '</div>';

    echo '<div class="fg-stat-card fg-stat-topposters">';
    echo '<div class="fg-stat-title">'.get_string('top_posters','report_forumgraph').'</div>';
    echo '<div class="fg-stat-content">'. $mpu_str .'</div>';
    echo '</div>';

    echo '</div>'; // stats container

    echo $OUTPUT->box_end();

    // Graph rendering container (required by the frontend module)
    echo $OUTPUT->box_start('generalbox', 'forumgraphsvg');
    echo '<div class="fg-help-popover">';
    echo '<button type="button" class="fg-help-btn" aria-label="'.get_string('graph_help_title','report_forumgraph').'">?</button>';
    echo '<div class="fg-help-tooltip" role="tooltip">';
    echo '<div class="fg-help-title">'.get_string('graph_help_title','report_forumgraph').'</div>';
    echo '<ul class="fg-help-list">';
    echo '<li>'.get_string('graph_help_pan','report_forumgraph').'</li>';
    echo '<li>'.get_string('graph_help_zoom','report_forumgraph').'</li>';
    echo '<li>'.get_string('graph_help_drag','report_forumgraph').'</li>';
    echo '<li>'.get_string('graph_help_drag_release','report_forumgraph').'</li>';
    echo '<li>'.get_string('graph_help_fit','report_forumgraph').'</li>';
    echo '</ul>';
    echo '</div>';
    echo '</div>';
    // Touch hint for mobile devices (localized) and persistent zoom badge for desktop
    echo '<div id="fg_touch_hint" class="fg-touch-hint">'.htmlspecialchars(get_string('graph_touch_hint','report_forumgraph')).'</div>';
    echo $OUTPUT->box_end();
}

$js_course = $course ? $course : 0;
$js_cmid   = isset($cm) ? $cm->id : 0;
$js_forum  = $forum ? $forum : 0;
$js_wwwroot = $CFG->wwwroot;

$js_from = !empty($from) && isset($from_ts) && $from_ts ? (int)$from_ts : 0;
$js_to = !empty($to) && isset($to_ts) && $to_ts ? (int)$to_ts : 0;
// pass current totals to the AMD module so it can compute per-stat percentages
$js_discussions = isset($discussioncount) ? (int)$discussioncount : 0;
$js_replies = isset($replycount) ? (int)$replycount : 0;
$js_users = isset($unique_authors) ? (int)$unique_authors : 0;
$js_total_posts = isset($total_posts) ? (int)$total_posts : 0;
$PAGE->requires->js_call_amd('report_forumgraph/module', 'init', array($js_forum, $js_cmid, $js_course, $js_wwwroot, $js_from, $js_to, $js_discussions, $js_replies, $js_users, $js_total_posts));

echo $OUTPUT->footer();