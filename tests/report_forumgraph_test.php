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

defined('MOODLE_INTERNAL') || die();

global $CFG;
require_once($CFG->dirroot . '/report/forumgraph/lib.php');

/**
 * Basic PHPUnit tests for report_forumgraph utility functions.
 *
 * @package   report_forumgraph
 * @copyright Andy Chan
 * @license   http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */
class report_forumgraph_testcase extends advanced_testcase {

    public function test_create_json_structure() {
        $nodes = array(
            10 => array('name' => 'Alice Example', 'userid' => 10, 'size' => 2, 'discussion' => 1, 'reply' => 1, 'group' => 1),
            11 => array('name' => 'Bob Example',   'userid' => 11, 'size' => 1, 'discussion' => 0, 'reply' => 1, 'group' => 5),
        );
        $edges = array('10_11' => 2);
        $uid_mapping = array(10 => 0, 11 => 1);

        $json = report_forumgraph_create_json($nodes, $edges, $uid_mapping);
        $this->assertNotEmpty($json);

        $data = json_decode($json, true);
        $this->assertIsArray($data);
        $this->assertArrayHasKey('nodes', $data);
        $this->assertArrayHasKey('links', $data);
        $this->assertCount(2, $data['nodes']);
        $this->assertCount(1, $data['links']);
        $this->assertEquals('Alice Example', $data['nodes'][0]['name']);
        $this->assertEquals(10, $data['nodes'][0]['userid']);
    }

    public function test_get_forum_nodes_edges_returns_false_for_missing_forum() {
        // Use a very large id that should not exist in the test DB.
        $this->assertFalse(report_forumgraph_get_forum_nodes_edges(99999999));
    }

}
