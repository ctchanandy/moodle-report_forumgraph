# Forum Graph report for Moodle 5.0

`report_forumgraph` visualizes interactions in a single forum using a force‑directed graph.

## Features

- Each node represents a user (node size scales by post count).
- Each edge represents replies between users (thickness scales by reply count; optional arrows show direction).
- Zoom/pan with fit‑to‑graph, export to PNG, and palette/layout controls.
- Sidebar controls for label options, layouts, colors, and sizes.
- Tooltips show posts, discussions, replies, role, and last‑seen time.
- Click a node to open the standard log report for that user in the forum.

## Compatibility

- Moodle 5.0 (required build: 2024042200).

## Installation

1. Copy this plugin to `report/forumgraph`.
2. Visit Site administration → Notifications to complete the upgrade.

## Privacy

This report does not store personal data. It reads existing forum and user data to render the graph.

## Third‑party libraries

This plugin bundles D3.js v7. D3 is released under the BSD 3‑Clause license.
See https://d3js.org/ for details.

## Manual validation checklist

- Open a forum with activity and ensure the graph renders.
- Try zoom/pan, fit‑to‑graph (double‑click), and PNG export.
- Toggle label options and verify tooltips show posts/discussions/replies.
- Verify permissions: users without `report/forumgraph:view` cannot access the report.
