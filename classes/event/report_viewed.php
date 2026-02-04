<?php
namespace report_forumgraph\event;

defined('MOODLE_INTERNAL') || die();

/**
 * Event class for viewing the forumgraph report.
 *
 * @package    report_forumgraph
 */
class report_viewed extends \core\event\base {
    protected function init() {
        $this->data['crud'] = 'r';
        $this->data['edulevel'] = self::LEVEL_TEACHING;
        $this->data['objecttable'] = 'course';
    }

    public static function get_name() {
        return get_string('eventreportviewed', 'report_forumgraph');
    }

    public function get_description() {
        $forum = isset($this->other['forum']) ? $this->other['forum'] : 0;
        $desc = "The user with id '{$this->userid}' viewed the forum graph report for the course with id '{$this->objectid}'";
        if ($forum) {
            $desc .= " (forum id {$forum})";
        }
        $desc .= '.';
        return $desc;
    }

    public function get_url() {
        $params = array('course' => $this->objectid);
        if (isset($this->other['forum']) && $this->other['forum']) {
            $params['forum'] = $this->other['forum'];
        }
        return new \moodle_url('/report/forumgraph/index.php', $params);
    }

    protected function validate_data() {
        parent::validate_data();
        if (!$this->context instanceof \context_course) {
            throw new \coding_exception('Context must be course context.');
        }
    }
}
