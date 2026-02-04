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
 * Lang strings (zh_tw).
 *
 * Language strings to be used by report/forumgraph
 *
 * @package    report_forumgraph
 * @copyright  2013 Andy Chan <ctchan.andy@gmail.com>
 * @license    http://www.gnu.org/copyleft/gpl.html GNU GPL v3 or later
 */

$string['pluginname'] = '討論區圖表';
$string['forumgraph'] = '討論區圖表';
$string['choose'] = '選擇...';
$string['firstlevelcategory'] = '第一層課程類別';
$string['usecount'] = '使用次數';
$string['nothingtodisplay'] = '沒有任何可顯示的數據。';
$string['forumparticipation'] = '論壇參與';
$string['forumname'] = '論壇名稱';
$string['discussioncount'] = '討論串數量';
$string['replycount'] = '回覆數量';
$string['viewcount'] = '檢視數量';
$string['usercount'] = '參與用戶數量';
$string['allcourses'] = '全部課程';
$string['usertype'] = '用戶';
$string['mostpostuser'] = '張貼最多的用戶';
$string['andotherusers'] = '和其他 {$a} 位用戶';

$string['noforumincourse'] = '課程內沒有討論區';
$string['toggleauthorname'] = '顯示/隱藏作者姓名';
$string['errornotopcategory'] = '選擇的課程必需要在一個課程類別內。';

$string['privacy:metadata'] = '討論區圖表報表只顯示既有的論壇與用戶資料，並不儲存任何額外的個人資料。產生圖表時會讀取並暫時顯示以下個人資料：使用者 ID、姓名、使用者名稱、角色、最後存取時間、貼文/討論/回覆數量，以及論壇貼文時間戳記。這些資料只會顯示於圖表與提示中，外掛不會永久儲存。';

// UI strings for JavaScript
$string['graph_settings'] = '圖表設定';
$string['color_scheme'] = '配色方案';
$string['palette_preview'] = '調色盤預覽';
$string['node_color'] = '節點顏色';
$string['node_label'] = '節點標籤';
$string['label_position'] = '標籤位置';
$string['label_color'] = '標籤顏色';
$string['label_size'] = '標籤大小';
$string['edge_color'] = '邊線顏色';
$string['node_size'] = '節點大小';
$string['edge_thickness'] = '邊線粗細';
$string['edge_style'] = '邊線樣式';
$string['show_arrows'] = '顯示箭頭';
$string['layout'] = '版面配置';
$string['reset'] = '重設';
$string['download_png'] = '下載 PNG';
$string['zoom_toggle_title'] = '切換滑鼠滾輪縮放（或使用 Ctrl/Cmd + 滾輪）';
$string['zoom_on'] = '縮放：開';
$string['zoom_off'] = '縮放：關';
$string['automatic_group_colors'] = '群組顏色（自動）';
$string['single_color'] = '單一顏色';
$string['category10'] = 'Category10';
$string['vivid'] = '鮮明';
$string['pastel'] = '柔和';
$string['warm'] = '暖色';
$string['cool'] = '冷色';
$string['full_name'] = '全名';
$string['first_name'] = '名字';
$string['last_name'] = '姓氏';
$string['username'] = '使用者名稱';
$string['none_hide_labels'] = '無（隱藏標籤）';
$string['label_pos_right'] = '右側';
$string['label_pos_left'] = '左側';
$string['label_pos_center'] = '置中（下方）';
$string['curve'] = '曲線';
$string['straight'] = '直線';
$string['force_balanced'] = '力導向（平衡）';
$string['force_tight'] = '力導向（緊密）';
$string['force_loose'] = '力導向（分散）';
$string['circular'] = '圓形';
$string['grid'] = '網格';
$string['loading_graph'] = '正在載入圖表…';
$string['export_downscale_warning'] = '匯出尺寸過大，將縮小圖片以避免檔案過大。';
$string['posts_label'] = '貼文';
$string['discussions_label'] = '討論';
$string['replies_label'] = '回覆';
$string['role_label'] = '角色';
$string['last_seen'] = '最後存取：';
$string['posts_last_7d'] = '近 7 天貼文數';
$string['avg_posts_per_user'] = '每位用戶平均貼文';
$string['active_contributors'] = '活躍貢獻者';
$string['unanswered_threads'] = '未回覆討論串';
$string['last_activity'] = '最近活動';
$string['avgreplies'] = '每討論平均回覆';
$string['top_posters'] = '貢獻最多的用戶';
$string['show_names'] = '顯示姓名';
$string['hide_names'] = '隱藏姓名';

$string['graph_help_title'] = '提示';
$string['graph_help_pan'] = '平移：按住空白區域拖曳。';
$string['graph_help_zoom'] = '縮放：使用縮放切換或按住 Ctrl/Cmd 加滾輪。';
$string['graph_help_drag'] = '拖曳節點：移動節點以觀察連結。';
$string['graph_help_drag_release'] = '放開後：節點會繼續自動佈局。';
$string['graph_help_fit'] = '適合視窗：在圖表上雙擊。';

$string['date_range_start'] = '開始日期';
$string['date_range_end'] = '結束日期';
$string['apply'] = '套用';
$string['posts_in_range'] = '期間內貼文：{$a}';
$string['percent_of_total'] = '佔總貼文百分比：{$a}%';
$string['range_stats_title'] = '所選期間統計';

$string['date_range_help'] = '範圍：{$a}；僅納入此期間建立的貼文。';
$string['last_7_days'] = '近 7 天';
$string['last_30_days'] = '近 30 天';
$string['show_all_posts'] = '重設範圍';
$string['in_range'] = '{$a} 範圍內 ({$b}%)';
$string['in_range_avg'] = '範圍內：{$a}';
$string['in_range_simple'] = '範圍內：{$a}';

$string['graph_touch_hint'] = '雙指縮放、拖移以平移，點擊節點查看詳細資料';
$string['wheel_zoom_off'] = '滾輪縮放已關閉';
$string['wheel_zoom_on'] = '滾輪縮放已開啟';
$string['range_summary'] = '顯示貼文：{$a->from} → {$a->to}（{$a->count} 篇，佔總數 {$a->percent}%）';
$string['range_summary_all'] = '顯示全部貼文（共 {$a->count} 篇；{$a->from} → {$a->to}）';
