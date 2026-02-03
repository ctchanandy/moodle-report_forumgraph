<?php
// This file is part of Moodle - http://moodle.org/

/**
 * Privacy provider for report_forumgraph.
 * This report only reads personal data stored elsewhere (forum posts, user profiles)
 * and does not store any additional personal data.
 *
 * @package    report_forumgraph
 * @copyright  2013 Andy Chan
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

namespace report_forumgraph\privacy;

defined('MOODLE_INTERNAL') || die();

class provider implements \core_privacy\local\metadata\null_provider {
    /**
     * Get the language string identifier with the component's language
     * for the null_provider implementation.
     *
     * @return string
     */
    public static function get_reason(): string {
        return 'privacy:metadata';
    }
}
