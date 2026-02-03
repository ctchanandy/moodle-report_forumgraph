/* eslint-disable no-console, no-eval, jsdoc/require-jsdoc, no-inner-declarations, max-len, curly */
/* global d3, ActiveXObject */
/*
 * JavaScript function and variable for report_forumgraph (AMD)
 */

define([], function () {
  "use strict";

  var forumgraph = {};
  var api = null;
  var i;

  function loadForumMenu(course) {
    var forummenu = document.getElementById("menuforum");
    if (course == 0) {
      for (i = forummenu.length - 1; i > 0; i--) {
        forummenu.remove(i);
      }
      return;
    }
    var httpRequest;
    if (window.XMLHttpRequest) {
      // Mozilla, Safari, ...
      httpRequest = new XMLHttpRequest();
      if (httpRequest.overrideMimeType) {
        httpRequest.overrideMimeType("text/javascript");
      }
    } else if (window.ActiveXObject) {
      // IE
      try {
        httpRequest = new ActiveXObject("Msxml2.XMLHTTP");
      } catch (e) {
        try {
          httpRequest = new ActiveXObject("Microsoft.XMLHTTP");
        } catch (e) {}
      }
    }

    if (!httpRequest) {
      alert("Error: Cannot create an XMLHTTP instance!");
      return false;
    }
    httpRequest.onreadystatechange = function () {
      var fSelected = forummenu.selectedIndex;
      runJS(httpRequest);
      forummenu.selectedIndex = fSelected;
    };
    var fSelected = forummenu.selectedIndex;
    fetch("getforums.php?course=" + encodeURIComponent(course), {
      credentials: "same-origin",
    })
      .then(function (response) {
        if (!response.ok) throw new Error("Network response was not ok");
        return response.json();
      })
      .then(function (data) {
        // clear existing options except the first
        for (i = forummenu.length - 1; i > 0; i--) {
          forummenu.remove(i);
        }
        data.forEach(function (item) {
          var opt = document.createElement("option");
          opt.value = item.id;
          opt.text = item.name;
          forummenu.add(opt, null);
        });
        // restore selection
        if (fSelected > forummenu.length - 1) fSelected = 0;
        forummenu.selectedIndex = fSelected;
        if (forummenu.selectedIndex != 0) {
          d3Graph();
        }
      })
      .catch(function (err) {
        console.error("Failed to load forums:", err);
      });
  }

  function runJS(httpRequest) {
    if (httpRequest.readyState == 4) {
      if (httpRequest.status == 200) {
        eval(httpRequest.responseText);
      } else {
        alert("There was a problem with the request.");
      }
    }
  }

  function nodeclick(d) {
    var param =
      "chooselog=1&showusers=1&showcourses=1&date=0&modaction=c&edulevel=-1&logreader=logstore_standard&id=" +
      forumgraph.courseid +
      "&modid=" +
      forumgraph.modid +
      "&user=" +
      d.userid;
    window.open(
      forumgraph.wwwroot + "/report/log/index.php?" + param,
      "_blank",
      "location=yes,height=600,width=800,scrollbars=yes,status=yes",
    );
  }

  // toggleNodeLabel was removed: label visibility is controlled by the sidebar 'Node label' select.

  function d3Graph() {
    // Load D3 via the AMD wrapper to avoid anonymous-define warnings from UMD builds.
    // The wrapper handles injecting the d3 script while temporarily disabling AMD `define`.
    function startWithD3(cb) {
      // Prefer the global loader if available (avoids RequireJS load errors).
      if (window.report_forumgraph_d3loader) {
        try {
          window.report_forumgraph_d3loader.ensureD3(
            function () {
              cb();
            },
            function (err) {
              console.error(err);
              cb();
            },
          );
          return;
        } catch (e) {}
      }
      // Otherwise try to load the AMD loader script directly (avoids RequireJS fetch issues).
      try {
        var loaderScript = document.createElement("script");
        loaderScript.src = "/report/forumgraph/amd/src/d3-loader.js";
        loaderScript.onload = function () {
          if (window.report_forumgraph_d3loader) {
            try {
              window.report_forumgraph_d3loader.ensureD3(
                function () {
                  cb();
                },
                function (err) {
                  console.error(err);
                  cb();
                },
              );
              return;
            } catch (e) {}
          }
          // final fallback: inject d3 directly
          if (window.d3) return cb();
          var backupDefine = window.define;
          try {
            window.define = undefined;
          } catch (e) {
            backupDefine = undefined;
          }
          var s = document.createElement("script");
          s.src = "/report/forumgraph/d3.v7.min.js";
          s.onload = function () {
            try {
              window.define = backupDefine;
            } catch (e) {}
            cb();
          };
          s.onerror = function () {
            try {
              window.define = backupDefine;
            } catch (e) {}
            console.error("Failed to load d3");
            cb();
          };
          document.head.appendChild(s);
        };
        loaderScript.onerror = function () {
          // loader failed; inject d3 as fallback
          if (window.d3) return cb();
          var backupDefine = window.define;
          try {
            window.define = undefined;
          } catch (e) {
            backupDefine = undefined;
          }
          var s = document.createElement("script");
          s.src = "/report/forumgraph/d3.v7.min.js";
          s.onload = function () {
            try {
              window.define = backupDefine;
            } catch (e) {}
            cb();
          };
          s.onerror = function () {
            try {
              window.define = backupDefine;
            } catch (e) {}
            console.error("Failed to load d3");
            cb();
          };
          document.head.appendChild(s);
        };
        document.head.appendChild(loaderScript);
        return;
      } catch (e) {}
      // final fallback: direct injection
      if (window.d3) return cb();
      var backupDefine = window.define;
      try {
        window.define = undefined;
      } catch (e) {
        backupDefine = undefined;
      }
      var s = document.createElement("script");
      s.src = "/report/forumgraph/d3.v7.min.js";
      s.onload = function () {
        try {
          window.define = backupDefine;
        } catch (e) {}
        cb();
      };
      s.onerror = function () {
        try {
          window.define = backupDefine;
        } catch (e) {}
        console.error("Failed to load d3");
        cb();
      };
      document.head.appendChild(s);
    }

    startWithD3(function () {
      // helper to get localized strings registered via strings_for_js
      function gs(key) {
        try {
          return M.util.get_string(key, "report_forumgraph");
        } catch (e) {
          return key;
        }
      }
      var simulation = null;
      var hideLoading = null;
      // D3 v7 implementation
      // compute initial size from container for responsive behavior
      var containerEl = document.getElementById("forumgraphsvg");
      var width = (containerEl && containerEl.clientWidth) || 800;
      var height =
        (containerEl && containerEl.clientHeight) ||
        Math.max(400, Math.floor(width * 0.75));
      var markerWidth = 6,
        markerHeight = 6,
        refX = 10,
        refY = 0;

      var color = d3.scaleOrdinal(d3.schemeCategory10);

      // persistent settings with sensible defaults
      var SETTINGS_KEY = "forumgraph-settings";
      var defaultSettings = {
        // colorScheme: 'group' uses automatic group colors; 'single' uses nodeColor; other values pick a named palette
        colorScheme: "group",
        nodeColor: "#1f77b4",
        edgeColor: "#999999",
        nodeScale: 1.0,
        edgeScale: 1.0,
        linkStyle: "curve", // 'curve' or 'straight'
        showArrows: true,
        layout: "force", // 'force' | 'circular' | 'grid'
        showLabels: true,
        labelType: "full", // 'full' | 'first' | 'last' | 'username'
        labelPosition: "right", // 'right' | 'left' | 'center'
        labelColor: "#000000",
        labelSize: 12,
      };

      // small helper to escape HTML for tooltip content
      function escapeHtml(str) {
        return String(str || "")
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
          .replace(/"/g, "&quot;");
      }

      // named palettes
      var palettes = {
        category10: d3.schemeCategory10,
        vivid: [
          "#e41a1c",
          "#377eb8",
          "#4daf4a",
          "#984ea3",
          "#ff7f00",
          "#ffff33",
          "#a65628",
          "#f781bf",
        ],
        pastel: [
          "#a6cee3",
          "#1f78b4",
          "#b2df8a",
          "#33a02c",
          "#fb9a99",
          "#e31a1c",
          "#fdbf6f",
          "#ff7f00",
        ],
        warm: [
          "#e4572e",
          "#f4a261",
          "#f7e6a6",
          "#ffd166",
          "#ef476f",
          "#ffd6a5",
        ],
        cool: [
          "#0077b6",
          "#00b4d8",
          "#90e0ef",
          "#ade8f4",
          "#caf0f8",
          "#023e8a",
        ],
      };

      function getPaletteColors(name) {
        if (!name || name === "group") return null;
        if (palettes[name]) return palettes[name];
        return palettes["category10"];
      }

      function getNodeFill(d) {
        var scheme = settings.colorScheme || "group";
        if (scheme === "group") return color(d.group);
        if (scheme === "single") return settings.nodeColor;
        var p = getPaletteColors(scheme);
        if (p && p.length) {
          var idx =
            d.group !== undefined && d.group !== null ? d.group : d.index || 0;
          return p[idx % p.length];
        }
        return settings.nodeColor;
      }

      function getLabel(d) {
        var t = settings.labelType || "full";
        var name = (d.name || "").toString();
        if (t === "full") return name;
        var trimmed = name.trim();
        if (!trimmed) return "";
        // handle "Lastname, Firstname" formats
        if (trimmed.indexOf(",") !== -1) {
          var parts = trimmed.split(",");
          var last = parts[0].trim();
          var rest = (parts[1] || "").trim();
          var first = rest.split(/\s+/)[0] || rest;
          if (t === "first") return first || last;
          if (t === "last") return last || first;
        }
        // default tokenization: backend stores "lastname firstname" so first name is last token
        var toks = trimmed.split(/\s+/);
        if (t === "first")
          return toks.length > 0 ? toks[toks.length - 1] : trimmed;
        if (t === "last") return toks.length > 0 ? toks[0] : trimmed;
        if (t === "username") return d.username || d.user || name;
        return name;
      }
      var settings = (function () {
        try {
          var s = localStorage.getItem(SETTINGS_KEY);
          return s ? JSON.parse(s) : Object.assign({}, defaultSettings);
        } catch (e) {
          return Object.assign({}, defaultSettings);
        }
      })();

      // Derive showLabels from labelType so 'none' hides labels
      if (typeof settings.labelType === "undefined")
        settings.labelType = defaultSettings.labelType;
      if (typeof settings.labelPosition === "undefined")
        settings.labelPosition = defaultSettings.labelPosition;
      if (typeof settings.labelColor === "undefined")
        settings.labelColor = defaultSettings.labelColor;
      settings.showLabels = settings.labelType !== "none";

      function saveSettings() {
        try {
          localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        } catch (e) {}
      }

      // remove any previous svg to avoid duplicates causing layout issues
      d3.select("#forumgraphsvg").selectAll("svg").remove();
      var svg = d3
        .select("#forumgraphsvg")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMidYMid meet");

      // enforce pixel height via inline style to prevent CSS auto-height from expanding
      svg.style("display", "block").style("height", height + "px");

      // helper to update svg size and re-fit graph on container resize
      function updateSize() {
        var newW = (containerEl && containerEl.clientWidth) || 800;
        // derive height from width to avoid circular layout sizing
        var newH = Math.max(400, Math.floor(newW * 0.6));
        if (newW === width && newH === height) return;
        width = newW;
        height = newH;
        svg
          .attr("width", width)
          .attr("height", height)
          .attr("viewBox", "0 0 " + width + " " + height);
        // enforce inline height and ensure pan/zoom rect covers new area
        try {
          svg.style("height", height + "px");
          svg
            .select("rect")
            .attr("width", width)
            .attr("height", height)
            .style("width", width + "px")
            .style("height", height + "px");
        } catch (e) {}
        try {
          if (typeof simulation !== "undefined" && simulation) {
            simulation.force("center", d3.forceCenter(width / 2, height / 2));
          }
        } catch (e) {}
        try {
          if (typeof fitToGraph === "function") fitToGraph();
        } catch (e) {}
      }

      // watch for container size changes and update
      if (window.ResizeObserver && containerEl) {
        try {
          var ro = new ResizeObserver(function () {
            updateSize();
          });
          ro.observe(containerEl);
        } catch (e) {
          window.addEventListener("resize", updateSize);
        }
      } else {
        window.addEventListener("resize", updateSize);
      }

      // transparent rect to capture pan/zoom events (not transformed)
      // insert it before the graph container so node groups remain on top and receive pointer events
      svg
        .append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all");

      // container for all graph elements to be transformed by zoom/pan
      var container = svg.append("g").attr("id", "graphcontainer");

      // wheel zoom toggle state (controls whether mouse-wheel zoom is active)
      var wheelZoomEnabled = false;

      // add simple controls container with Download PNG button
      try {
        var svgContainerEl = document.getElementById("forumgraphsvg");
        if (svgContainerEl) {
          var controls = document.createElement("div");
          controls.className = "forumgraph-controls";
          controls.innerHTML =
            '<button id="forumgraph-zoom-toggle" type="button" class="fg-toggle" aria-pressed="false" title="' +
            gs("zoom_toggle_title") +
            '"><span class="fg-zoom-indicator" aria-hidden="true"></span>' +
            gs("zoom_off") +
            "</button>" +
            '<button id="forumgraph-download-png" type="button" title="' +
            gs("download_png") +
            '">' +
            gs("download_png") +
            "</button>";
          svgContainerEl.insertBefore(controls, svgContainerEl.firstChild);
          // Hide-names button removed: label visibility is controlled by the Node label select ("None").

          // wire zoom toggle button (changes wheel-zoom behaviour)
          var zbtn = document.getElementById("forumgraph-zoom-toggle");
          if (zbtn) {
            function updateZoomButtonState(on) {
              zbtn.setAttribute("aria-pressed", on ? "true" : "false");
              zbtn.classList.toggle("active", on);
              zbtn.title = gs("zoom_toggle_title");
              // update visible text label while keeping the indicator span
              zbtn.innerHTML =
                '<span class="fg-zoom-indicator" aria-hidden="true"></span>' +
                (on ? gs("zoom_on") : gs("zoom_off"));
            }
            zbtn.addEventListener("click", function () {
              wheelZoomEnabled = !wheelZoomEnabled;
              updateZoomButtonState(wheelZoomEnabled);
            });
            // initialize label text
            updateZoomButtonState(false);
          }

          document
            .getElementById("forumgraph-download-png")
            .addEventListener("click", function () {
              var btn = this;
              btn.disabled = true;
              // hide transient tooltip
              var tip = document.querySelector(".forumgraphtooltip");
              var tipDisplay = tip ? tip.style.display : null;
              if (tip) tip.style.display = "none";

              try {
                var orig = svg.node();
                var clone = orig.cloneNode(true);

                // apply current zoom transform if present
                var z =
                  orig.__zoom || (svg.node() && svg.node().__zoom) || null;
                var containerClone = clone.querySelector("#graphcontainer");
                if (z && containerClone) {
                  // z may be a d3 zoom transform object
                  if (typeof z.toString === "function") {
                    containerClone.setAttribute("transform", z.toString());
                  } else {
                    containerClone.setAttribute(
                      "transform",
                      "translate(" +
                        (z.x || 0) +
                        "," +
                        (z.y || 0) +
                        ") scale(" +
                        (z.k || 1) +
                        ")",
                    );
                  }
                }

                // inline computed styles for a limited set of elements
                (function inlineStyles(source, target) {
                  var selectors = ["path", "circle", "text", "rect", "g"];
                  selectors.forEach(function (sel) {
                    var sEls = source.querySelectorAll(sel);
                    var tEls = target.querySelectorAll(sel);
                    for (var i = 0; i < sEls.length; i++) {
                      var sEl = sEls[i];
                      var tEl = tEls[i];
                      if (!tEl) continue;
                      var cs = window.getComputedStyle(sEl);
                      var parts = [];
                      if (cs.fill) parts.push("fill:" + cs.fill);
                      if (cs.stroke) parts.push("stroke:" + cs.stroke);
                      if (cs.strokeWidth)
                        parts.push("stroke-width:" + cs.strokeWidth);
                      if (cs.opacity) parts.push("opacity:" + cs.opacity);
                      if (cs.fontSize) parts.push("font-size:" + cs.fontSize);
                      if (cs.fontFamily)
                        parts.push("font-family:" + cs.fontFamily);
                      if (parts.length)
                        tEl.setAttribute("style", parts.join(";"));
                    }
                  });
                })(orig, clone);

                // remove any tooltip nodes from clone
                var clonedTip = clone.querySelector(".forumgraphtooltip");
                if (clonedTip && clonedTip.parentNode)
                  clonedTip.parentNode.removeChild(clonedTip);
                // remove sidebar controls from export clone
                var clonedSidebar = clone.querySelector(".forumgraph-sidebar");
                if (clonedSidebar && clonedSidebar.parentNode)
                  clonedSidebar.parentNode.removeChild(clonedSidebar);

                // ensure defs are present and markers use strokeWidth units (they were set earlier)

                // determine dimensions
                var bbox = orig.getBBox
                  ? orig.getBBox()
                  : { x: 0, y: 0, width: width, height: height };
                var svgWidth =
                  +orig.getAttribute("width") || bbox.width || width;
                var svgHeight =
                  +orig.getAttribute("height") || bbox.height || height;
                var pixelRatio = window.devicePixelRatio || 1;

                // cap dimensions
                var maxPx = 4096 * pixelRatio;
                if (
                  svgWidth * pixelRatio > maxPx ||
                  svgHeight * pixelRatio > maxPx
                ) {
                  alert(gs("export_downscale_warning"));
                }
                var outW = Math.min(svgWidth, maxPx / pixelRatio);
                var outH = Math.min(svgHeight, maxPx / pixelRatio);

                clone.setAttribute("width", svgWidth);
                clone.setAttribute("height", svgHeight);
                clone.setAttribute(
                  "viewBox",
                  "0 0 " + svgWidth + " " + svgHeight,
                );

                var serializer = new XMLSerializer();
                var svgStr = serializer.serializeToString(clone);
                var blob = new Blob([svgStr], {
                  type: "image/svg+xml;charset=utf-8",
                });
                var url = URL.createObjectURL(blob);
                var img = new Image();
                img.onload = function () {
                  try {
                    var canvas = document.createElement("canvas");
                    canvas.width = Math.round(outW * pixelRatio);
                    canvas.height = Math.round(outH * pixelRatio);
                    canvas.style.width = outW + "px";
                    canvas.style.height = outH + "px";
                    var ctx = canvas.getContext("2d");
                    ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
                    ctx.drawImage(img, 0, 0, svgWidth, svgHeight);
                    URL.revokeObjectURL(url);
                    var png = canvas.toDataURL("image/png");
                    var a = document.createElement("a");
                    a.href = png;
                    a.download =
                      "forumgraph-" + (forumgraph.forum || "graph") + ".png";
                    document.body.appendChild(a);
                    a.click();
                    a.remove();
                  } catch (e) {
                    console.error("Export error", e);
                    URL.revokeObjectURL(url);
                  } finally {
                    if (tip && tipDisplay !== null)
                      tip.style.display = tipDisplay;
                    btn.disabled = false;
                  }
                };
                img.onerror = function (e) {
                  console.error("SVG -> Image load error", e);
                  URL.revokeObjectURL(url);
                  if (tip && tipDisplay !== null)
                    tip.style.display = tipDisplay;
                  btn.disabled = false;
                };
                img.src = url;
              } catch (err) {
                console.error("Export failed", err);
                var tip2 = document.querySelector(".forumgraphtooltip");
                if (tip2 && tip2.style) tip2.style.display = tipDisplay;
                btn.disabled = false;
              }
            });
        }
      } catch (e) {}

      // Tooltips appended to body for proper positioning. Create once and reuse.
      var body = d3.select("body");
      var div = body.select(".forumgraphtooltip");
      if (div.empty()) {
        div = body
          .append("div")
          .attr("class", "forumgraphtooltip")
          .style("position", "absolute")
          .style("pointer-events", "none")
          .style("opacity", 0);
      }

      // build the arrow marker (place defs at svg root so ids resolve)
      var defs = svg.append("defs");
      defs
        .append("marker")
        .attr("id", "end")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", refX)
        .attr("refY", refY)
        .attr("markerWidth", markerWidth)
        .attr("markerHeight", markerHeight)
        .attr("orient", "auto")
        .attr("markerUnits", "strokeWidth")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5")
        .attr("fill", "#999");

      // zoom behaviour
      var zoom = d3
        .zoom()
        .scaleExtent([0.2, 4])
        .on("zoom", function (event) {
          // clamp translation so the graph cannot be panned completely away
          var t = event.transform;
          // if graph bbox known, clamp translation to keep it at least partially visible
          if (container.node().__graphBBox) {
            var bbox = container.node().__graphBBox;
            var margin = 40;
            var k = t.k;
            var minTx = -bbox.maxX * k + margin;
            var maxTx = -bbox.minX * k + width - margin;
            var minTy = -bbox.maxY * k + margin;
            var maxTy = -bbox.minY * k + height - margin;
            var tx = Math.max(minTx, Math.min(maxTx, t.x));
            var ty = Math.max(minTy, Math.min(maxTy, t.y));
            t = d3.zoomIdentity.translate(tx, ty).scale(k);
            // update internal zoom state so future interactions see the clamped transform
            svg.node().__zoom = t;
          }
          container.attr("transform", t);
        });

      svg.call(zoom).on("dblclick.zoom", null);

      // Replace the default wheel handler with a guarded wheel listener that
      // requires either the Zoom toggle to be on or the user to hold Ctrl/Cmd.
      try {
        // remove the built-in wheel handler installed by d3.zoom
        svg.on("wheel.zoom", null);
        var wheelHandler = function (e) {
          // allow if toggle on OR user explicitly holds Ctrl/Cmd
          if (!(wheelZoomEnabled || e.ctrlKey || e.metaKey)) return;
          e.preventDefault(); // avoid page scroll
          // mild sensitivity
          var factor = e.deltaY > 0 ? 1 / 1.18 : 1.18;
          var point = d3.pointer(e, svg.node());
          try {
            svg.transition().duration(120).call(zoom.scaleBy, factor, point);
          } catch (err) {
            // fallback: attempt direct transform
            try {
              var z = svg.node().__zoom || d3.zoomIdentity;
              var newK = Math.max(0.2, Math.min(4, z.k * factor));
              var t = d3.zoomIdentity.translate(z.x, z.y).scale(newK);
              svg.call(zoom.transform, t);
            } catch (e) {}
          }
        };
        svg.node().addEventListener("wheel", wheelHandler, { passive: false });
      } catch (err) {
        console.warn("Custom wheel handler failed", err);
      }

      d3.json("getjson.php?forum=" + forumgraph.forum)
        .then(function (graph) {
          var linkedByIndex = {};
          graph.links.forEach(function (d) {
            linkedByIndex[d.source + "," + d.target] = 1;
          });

          // prepare group color mapping: fallback to node index when group missing
          var groupValues = Array.from(
            new Set(
              graph.nodes.map(function (n) {
                return n.group !== undefined && n.group !== null
                  ? n.group
                  : n.index;
              }),
            ),
          );
          try {
            color.domain(groupValues);
          } catch (e) {}

          function isConnected(a, b) {
            return (
              linkedByIndex[a.index + "," + b.index] ||
              linkedByIndex[b.index + "," + a.index] ||
              a.index === b.index
            );
          }

          // Loading overlay helpers (kept in outer scope so fitToGraph can hide it)
          var svgContainer = document.getElementById("forumgraphsvg");
          var loadingOverlay = svgContainer
            ? svgContainer.querySelector(".forumgraph-loading")
            : null;
          function createLoading() {
            if (loadingOverlay) return;
            var wrapper = document.createElement("div");
            wrapper.className = "forumgraph-loading";
            wrapper.style.position = "absolute";
            wrapper.style.left = "0";
            wrapper.style.top = "0";
            wrapper.style.width = "100%";
            wrapper.style.height = "100%";
            wrapper.style.display = "flex";
            wrapper.style.alignItems = "center";
            wrapper.style.justifyContent = "center";
            wrapper.style.background = "rgba(255,255,255,0.85)";
            wrapper.style.zIndex = "9999";
            wrapper.innerHTML =
              '<div style="text-align:center"><div style="width:28px;height:28px;border-radius:50%;border:4px solid rgba(0,0,0,0.1);border-top-color:#3498db;animation:forumgraph-spin 1s linear infinite;margin:0 auto 8px"></div><div>' +
              gs("loading_graph") +
              "</div></div>";
            if (svgContainer) {
              svgContainer.style.position =
                svgContainer.style.position || "relative";
              svgContainer.appendChild(wrapper);
              loadingOverlay = wrapper;
            }
          }
          function showLoading() {
            createLoading();
            if (loadingOverlay) loadingOverlay.style.display = "flex";
          }
          hideLoading = function () {
            if (loadingOverlay) loadingOverlay.style.display = "none";
          };

          // simple spinner CSS injection (only once)
          if (!document.getElementById("forumgraph-spinner-style")) {
            var s = document.createElement("style");
            s.id = "forumgraph-spinner-style";
            s.innerHTML =
              "@keyframes forumgraph-spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}";
            document.head.appendChild(s);
          }

          var link = container
            .append("g")
            .attr("class", "links")
            .selectAll("path")
            .data(graph.links)
            .enter()
            .append("path")
            .attr("class", "link")
            .attr("marker-end", settings.showArrows ? "url(#end)" : null)
            .style("stroke-width", function (d) {
              return (Math.sqrt(d.value) || 1) * settings.edgeScale;
            })
            .style("stroke", settings.edgeColor)
            .style("fill", "none");

          var node = container
            .append("g")
            .attr("class", "nodes")
            .selectAll(".node")
            .data(graph.nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .style("fill", function (d) {
              return getNodeFill(d);
            })
            .on("mouseover", function (event, d) {
              mouseover(event, d);
            })
            .on("mouseout", function (event, d) {
              mouseout(event, d);
            })
            .on("click", function (event, d) {
              nodeclick(d);
            });

          node
            .append("circle")
            .attr("r", function (d) {
              d.radius = d.size ? Math.sqrt(d.size) * 5 : 5;
              return d.radius * settings.nodeScale;
            })
            .style("fill", function (d) {
              return getNodeFill(d);
            });

          // Ensure circles receive pointer events so hover/click handlers fire.
          node.select("circle").style("pointer-events", "all");

          var textSel = node
            .append("text")
            .style("display", settings.showLabels ? "inline" : "none")
            .style("font-size", (settings.labelSize || 12) + "px")
            .style("fill", settings.labelColor || "#000000")
            .text(function (d) {
              return getLabel(d);
            });

          function updateLabelPosition() {
            var pos = settings.labelPosition || "right";
            var pad = 12;
            textSel.each(function (d) {
              var r = (d.radius || 0) * (settings.nodeScale || 1);
              var text = d3.select(this);
              if (pos === "left") {
                text
                  .attr("x", -(r + pad))
                  .attr("dy", ".35em")
                  .attr("text-anchor", "end");
              } else if (pos === "center") {
                text
                  .attr("x", 0)
                  .attr("dy", r + pad + "px")
                  .attr("text-anchor", "middle");
              } else {
                text
                  .attr("x", r + pad)
                  .attr("dy", ".35em")
                  .attr("text-anchor", "start");
              }
            });
          }
          updateLabelPosition();

          // Sidebar controls
          (function createSidebar() {
            var container = document.getElementById("forumgraphsvg");
            if (!container) return;
            // ensure wrapper exists and move container into it so sidebar appears beside graph
            var parent = container.parentNode;
            var wrapper = parent.querySelector(".forumgraph-wrapper");
            if (!wrapper) {
              wrapper = document.createElement("div");
              wrapper.className = "forumgraph-wrapper";
              parent.insertBefore(wrapper, container);
              wrapper.appendChild(container);
            } else {
              // make sure container is inside wrapper
              if (container.parentNode !== wrapper)
                wrapper.appendChild(container);
            }
            var existing = wrapper.querySelector(".forumgraph-sidebar");
            if (existing) existing.parentNode.removeChild(existing);
            var sb = document.createElement("aside");
            sb.className = "forumgraph-sidebar";
            sb.innerHTML =
              '<div class="fg-content">' +
              "<h3>" +
              gs("graph_settings") +
              "</h3>" +
              '<div class="fg-row">' +
              gs("color_scheme") +
              ': <select id="fg_palette">' +
              '<option value="group">' +
              gs("automatic_group_colors") +
              "</option>" +
              '<option value="single">' +
              gs("single_color") +
              "</option>" +
              '<option value="category10">' +
              gs("category10") +
              "</option>" +
              '<option value="vivid">' +
              gs("vivid") +
              "</option>" +
              '<option value="pastel">' +
              gs("pastel") +
              "</option>" +
              '<option value="warm">' +
              gs("warm") +
              "</option>" +
              '<option value="cool">' +
              gs("cool") +
              "</option>" +
              "</select></div>" +
              '<div class="fg-row">' +
              gs("palette_preview") +
              ': <div id="fg_palette_preview" class="fg-palette-preview"></div></div>' +
              '<div class="fg-row">' +
              gs("node_color") +
              ': <input type="color" id="fg_node_color" value="#1f77b4"></div>' +
              '<div class="fg-row">' +
              gs("node_label") +
              ': <select id="fg_label_type">' +
              '<option value="full">' +
              gs("full_name") +
              "</option>" +
              '<option value="first">' +
              gs("first_name") +
              "</option>" +
              '<option value="last">' +
              gs("last_name") +
              "</option>" +
              '<option value="username">' +
              gs("username") +
              "</option>" +
              '<option value="none">' +
              gs("none_hide_labels") +
              "</option>" +
              "</select></div>" +
              '<div class="fg-row">' +
              gs("label_position") +
              ': <select id="fg_label_position">' +
              '<option value="right">' +
              gs("label_pos_right") +
              "</option>" +
              '<option value="left">' +
              gs("label_pos_left") +
              "</option>" +
              '<option value="center">' +
              gs("label_pos_center") +
              "</option>" +
              "</select></div>" +
              '<div class="fg-row">' +
              gs("label_color") +
              ': <input type="color" id="fg_label_color" value="#000000"></div>' +
              '<div class="fg-row">' +
              gs("label_size") +
              ': <input id="fg_label_size" type="range" min="8" max="22" step="1"></div>' +
              '<div class="fg-row">' +
              gs("edge_color") +
              ': <input type="color" id="fg_edge_color" value="#999999"></div>' +
              '<div class="fg-row">' +
              gs("node_size") +
              ': <input id="fg_node_scale" type="range" min="0.5" max="3" step="0.1"></div>' +
              '<div class="fg-row">' +
              gs("edge_thickness") +
              ': <input id="fg_edge_scale" type="range" min="0.5" max="3" step="0.1"></div>' +
              '<div class="fg-row">' +
              gs("edge_style") +
              ': <select id="fg_link_style">' +
              '<option value="curve">' +
              gs("curve") +
              "</option>" +
              '<option value="straight">' +
              gs("straight") +
              "</option>" +
              "</select></div>" +
              '<label class="fg-row"><input type="checkbox" id="fg_show_arrows"> ' +
              gs("show_arrows") +
              "</label>" +
              '<div class="fg-row">' +
              gs("layout") +
              ': <select id="fg_layout">' +
              '<option value="force">' +
              gs("force_balanced") +
              "</option>" +
              '<option value="force-tight">' +
              gs("force_tight") +
              "</option>" +
              '<option value="force-loose">' +
              gs("force_loose") +
              "</option>" +
              '<option value="circular">' +
              gs("circular") +
              "</option>" +
              '<option value="grid">' +
              gs("grid") +
              "</option>" +
              "</select></div>" +
              '<div class="fg-actions"><button id="fg_reset">' +
              gs("reset") +
              "</button></div>" +
              "</div>";
            wrapper.appendChild(sb);

            var el = function (id) {
              return document.getElementById(id);
            };
            el("fg_node_color").value = settings.nodeColor || "#1f77b4";
            el("fg_palette").value = settings.colorScheme || "group";
            el("fg_edge_color").value = settings.edgeColor || "#999999";
            el("fg_node_scale").value = settings.nodeScale || 1.0;
            el("fg_edge_scale").value = settings.edgeScale || 1.0;
            el("fg_link_style").value = settings.linkStyle || "curve";
            el("fg_show_arrows").checked = !!settings.showArrows;
            el("fg_layout").value = settings.layout || "force";
            // initialize new label controls
            try {
              el("fg_label_type").value = settings.labelType || "full";
            } catch (e) {}
            try {
              el("fg_label_position").value = settings.labelPosition || "right";
            } catch (e) {}
            try {
              el("fg_label_color").value = settings.labelColor || "#000000";
            } catch (e) {}
            try {
              el("fg_label_size").value = settings.labelSize || 12;
            } catch (e) {}

            // palette selection: group | single | named palette
            var picker = el("fg_node_color");
            if (picker)
              picker.parentNode.style.display =
                el("fg_palette").value === "single" ? "block" : "none";

            // add small inline help aria and keyboard accessibility
            try {
              var help = sb.querySelector("h3");
              if (help) help.setAttribute("aria-label", gs("graph_settings"));
            } catch (e) {}

            // ensure interactive elements are keyboard-focusable
            [
              "fg_reset",
              "fg_palette",
              "fg_node_color",
              "fg_edge_color",
              "fg_node_scale",
              "fg_edge_scale",
              "fg_link_style",
              "fg_show_arrows",
              "fg_layout",
              "fg_label_type",
              "fg_label_position",
              "fg_label_color",
              "fg_label_size",
            ].forEach(function (id) {
              try {
                var elm = document.getElementById(id);
                if (elm) elm.tabIndex = 0;
              } catch (e) {}
            });

            updateLabelPosition();
            function renderPalettePreview(name) {
              var preview = el("fg_palette_preview");
              if (!preview) return;
              try {
                try {
                  el("fg_label_color").addEventListener("input", function () {
                    settings.labelColor = this.value;
                    node
                      .select("text")
                      .style("fill", settings.labelColor || "#000000");
                    saveSettings();
                  });
                } catch (e) {}
                el("fg_label_position").addEventListener("change", function () {
                  settings.labelPosition = this.value;
                  updateLabelPosition();
                  saveSettings();
                });
              } catch (e) {}
              preview.innerHTML = "";
              if (!name || name === "group") {
                preview.textContent = gs("automatic_group_colors");
                preview.style.display = "block";
                updateLabelPosition();
                return;
              }
              if (name === "single") {
                // show a single swatch matching the selected node color
                var s = document.createElement("span");
                s.className = "fg-swatch";
                s.style.background =
                  settings && settings.nodeColor
                    ? settings.nodeColor
                    : "#1f77b4";
                preview.appendChild(s);
                preview.style.display = "inline-flex";
                return;
              }
              var cols = getPaletteColors(name) || palettes["category10"];
              preview.style.display = "flex";
              cols.forEach(function (c) {
                var s = document.createElement("span");
                s.className = "fg-swatch";
                s.style.background = c;
                preview.appendChild(s);
              });
            }

            el("fg_palette").addEventListener("change", function () {
              settings.colorScheme = this.value;
              if (picker)
                picker.parentNode.style.display =
                  this.value === "single" ? "block" : "none";
              node.select("circle").style("fill", function (d) {
                return getNodeFill(d);
              });
              renderPalettePreview(this.value);
              saveSettings();
            });
            el("fg_node_color").addEventListener("input", function () {
              settings.nodeColor = this.value;
              if (settings.colorScheme === "single")
                node.select("circle").style("fill", settings.nodeColor);
              saveSettings();
            });
            // initial preview
            try {
              renderPalettePreview(el("fg_palette").value);
            } catch (e) {}
            el("fg_edge_color").addEventListener("input", function () {
              settings.edgeColor = this.value;
              link.style("stroke", settings.edgeColor);
              saveSettings();
            });
            el("fg_node_scale").addEventListener("input", function () {
              settings.nodeScale = parseFloat(this.value);
              node.select("circle").attr("r", function (d) {
                return d.radius * settings.nodeScale;
              });
              updateLabelPosition();
              // update link paths so edges touch resized nodes
              link.attr("d", function (d) {
                var dx = d.target.x - d.source.x,
                  dy = d.target.y - d.source.y,
                  dr = Math.sqrt(dx * dx + dy * dy) || 1;
                var sourceRadius =
                  (d.source.radius || 0) * (settings.nodeScale || 1);
                var targetRadius =
                  (d.target.radius || 0) * (settings.nodeScale || 1);
                var sourceOffsetX = (dx * sourceRadius) / dr;
                var sourceOffsetY = (dy * sourceRadius) / dr;
                var targetOffsetX = (dx * targetRadius) / dr;
                var targetOffsetY = (dy * targetRadius) / dr;
                if (settings.linkStyle === "straight") {
                  return (
                    "M" +
                    (d.source.x + sourceOffsetX) +
                    "," +
                    (d.source.y + sourceOffsetY) +
                    "L" +
                    (d.target.x - targetOffsetX) +
                    "," +
                    (d.target.y - targetOffsetY)
                  );
                }
                return (
                  "M" +
                  (d.source.x + sourceOffsetX) +
                  "," +
                  (d.source.y + sourceOffsetY) +
                  "A" +
                  dr +
                  "," +
                  dr +
                  " 0 0,1 " +
                  (d.target.x - targetOffsetX) +
                  "," +
                  (d.target.y - targetOffsetY)
                );
              });
              saveSettings();
            });
            el("fg_edge_scale").addEventListener("input", function () {
              settings.edgeScale = parseFloat(this.value);
              link.style("stroke-width", function (d) {
                return (Math.sqrt(d.value) || 1) * settings.edgeScale;
              });
              saveSettings();
            });
            el("fg_link_style").addEventListener("change", function () {
              settings.linkStyle = this.value;
              // force a redraw of link paths immediately
              link.attr("d", function (d) {
                var dx = d.target.x - d.source.x,
                  dy = d.target.y - d.source.y,
                  dr = Math.sqrt(dx * dx + dy * dy) || 1;
                var sourceRadius =
                  (d.source.radius || 0) * (settings.nodeScale || 1);
                var targetRadius =
                  (d.target.radius || 0) * (settings.nodeScale || 1);
                var sourceOffsetX = (dx * sourceRadius) / dr;
                var sourceOffsetY = (dy * sourceRadius) / dr;
                var targetOffsetX = (dx * targetRadius) / dr;
                var targetOffsetY = (dy * targetRadius) / dr;
                if (settings.linkStyle === "straight")
                  return (
                    "M" +
                    (d.source.x + sourceOffsetX) +
                    "," +
                    (d.source.y + sourceOffsetY) +
                    "L" +
                    (d.target.x - targetOffsetX) +
                    "," +
                    (d.target.y - targetOffsetY)
                  );
                return (
                  "M" +
                  (d.source.x + sourceOffsetX) +
                  "," +
                  (d.source.y + sourceOffsetY) +
                  "A" +
                  dr +
                  "," +
                  dr +
                  " 0 0,1 " +
                  (d.target.x - targetOffsetX) +
                  "," +
                  (d.target.y - targetOffsetY)
                );
              });
              saveSettings();
            });
            el("fg_show_arrows").addEventListener("change", function () {
              settings.showArrows = this.checked;
              link.attr("marker-end", settings.showArrows ? "url(#end)" : null);
              saveSettings();
            });
            el("fg_layout").addEventListener("change", function () {
              settings.layout = this.value;
              // update select tooltip/title
              try {
                el("fg_layout").title = layoutDescriptions[this.value] || "";
              } catch (e) {}
              applyLayout(settings.layout);
              saveSettings();
            });
            // set initial title/help text for layout select
            try {
              el("fg_layout").title =
                layoutDescriptions[el("fg_layout").value] || "";
            } catch (e) {}
            // label controls wiring
            try {
              el("fg_label_type").addEventListener("change", function () {
                settings.labelType = this.value;
                // determine whether labels should be shown
                settings.showLabels = settings.labelType !== "none";
                node
                  .select("text")
                  .text(function (d) {
                    return getLabel(d);
                  })
                  .style("display", settings.showLabels ? "inline" : "none");
                saveSettings();
              });
            } catch (e) {}
            try {
              el("fg_label_size").addEventListener("input", function () {
                settings.labelSize = parseInt(this.value, 10) || 12;
                node
                  .select("text")
                  .style("font-size", settings.labelSize + "px");
                saveSettings();
              });
            } catch (e) {}
            el("fg_reset").addEventListener("click", function () {
              settings = Object.assign({}, defaultSettings);
              saveSettings();
              // update UI
              el("fg_palette").value = settings.colorScheme || "group";
              var picker = el("fg_node_color");
              if (picker) picker.value = settings.nodeColor;
              el("fg_edge_color").value = settings.edgeColor;
              el("fg_node_scale").value = settings.nodeScale;
              el("fg_edge_scale").value = settings.edgeScale;
              el("fg_link_style").value = settings.linkStyle;
              el("fg_show_arrows").checked = settings.showArrows;
              el("fg_layout").value = settings.layout;
              try {
                el("fg_label_type").value = settings.labelType || "full";
              } catch (e) {}
              try {
                el("fg_label_size").value = settings.labelSize || 12;
              } catch (e) {}
              try {
                el("fg_label_color").value = settings.labelColor || "#000000";
              } catch (e) {}
              try {
                el("fg_label_position").value =
                  settings.labelPosition || "right";
              } catch (e) {}
              // apply visuals
              node.select("circle").style("fill", function (d) {
                return getNodeFill(d);
              });
              try {
                renderPalettePreview(settings.colorScheme);
              } catch (e) {}
              link
                .style("stroke", settings.edgeColor)
                .style("stroke-width", function (d) {
                  return (Math.sqrt(d.value) || 1) * settings.edgeScale;
                })
                .attr("marker-end", settings.showArrows ? "url(#end)" : null);
              node.select("circle").attr("r", function (d) {
                return d.radius * settings.nodeScale;
              });
              // update label visibility according to labelType
              try {
                var show = settings.labelType !== "none";
                node.select("text").style("display", show ? "inline" : "none");
                updateLabelPosition();
              } catch (e) {}
              try {
                node
                  .select("text")
                  .style("fill", settings.labelColor || "#000000");
              } catch (e) {}
              applyLayout(settings.layout);
            });
            // collapse/handle removed: sidebar is always visible
          })();

          // show loading overlay while layout runs
          showLoading();

          // adaptive max ticks
          var maxTicks = Math.max(200, graph.nodes.length * 20);
          var tickCount = 0;
          var fitCalled = false;

          simulation = d3
            .forceSimulation(graph.nodes)
            .force(
              "link",
              d3.forceLink(graph.links).distance(function () {
                return Math.max(60, 120 - Math.min(60, graph.nodes.length / 5));
              }),
            )
            .force("charge", d3.forceManyBody().strength(-300))
            .force("center", d3.forceCenter(width / 2, height / 2));

          // layout switcher: apply different layouts
          var layoutDescriptions = {
            force: gs("force_balanced"),
            "force-tight": gs("force_tight"),
            "force-loose": gs("force_loose"),
            circular: gs("circular"),
            grid: gs("grid"),
          };

          function resetNodePositions() {
            try {
              var cx = width / 2,
                cy = height / 2;
              graph.nodes.forEach(function (n) {
                n.x = cx + (Math.random() - 0.5) * 20;
                n.y = cy + (Math.random() - 0.5) * 20;
                n.vx = 0;
                n.vy = 0;
                n.fx = null;
                n.fy = null;
              });
            } catch (e) {}
          }

          var __autoFitTimer = null;
          function scheduleAutoFit(delay, maxAttempts) {
            delay = typeof delay === "number" ? delay : 700;
            maxAttempts = typeof maxAttempts === "number" ? maxAttempts : 6;
            if (__autoFitTimer) {
              clearTimeout(__autoFitTimer);
              __autoFitTimer = null;
            }
            var attempts = 0;
            function tryFit() {
              attempts++;
              try {
                if (
                  container &&
                  container.node() &&
                  container.node().__graphBBox
                ) {
                  fitToGraph();
                } else if (attempts < maxAttempts) {
                  __autoFitTimer = setTimeout(tryFit, delay);
                }
              } catch (e) {
                if (attempts < maxAttempts)
                  __autoFitTimer = setTimeout(tryFit, delay);
              }
            }
            __autoFitTimer = setTimeout(tryFit, delay);
          }

          function configureForces(mode) {
            // Choose parameters based on mode: link distance and charge strength primarily
            var linkDistanceFn;
            var chargeStrength;
            switch (mode) {
              case "force-tight":
                linkDistanceFn = function () {
                  return Math.max(
                    30,
                    60 - Math.min(40, graph.nodes.length / 5),
                  );
                };
                chargeStrength = -120; // milder repulsion
                break;
              case "force-loose":
                linkDistanceFn = function () {
                  return Math.max(
                    120,
                    220 - Math.min(60, graph.nodes.length / 5),
                  );
                };
                chargeStrength = -700; // stronger repulsion to spread nodes
                break;
              default:
                linkDistanceFn = function () {
                  return Math.max(
                    60,
                    120 - Math.min(60, graph.nodes.length / 5),
                  );
                };
                chargeStrength = -300;
            }

            // update forces
            try {
              simulation.force(
                "link",
                d3.forceLink(graph.links).distance(linkDistanceFn).strength(1),
              );
              simulation.force(
                "charge",
                d3.forceManyBody().strength(chargeStrength),
              );
              // add a collide force so nodes don't overlap; radius uses node radius and current scale
              simulation.force(
                "collide",
                d3
                  .forceCollide()
                  .radius(function (d) {
                    return (d.radius || 5) * (settings.nodeScale || 1) + 4;
                  })
                  .strength(0.8),
              );
              simulation.force("center", d3.forceCenter(width / 2, height / 2));
              simulation.alpha(1).alphaDecay(0.03).velocityDecay(0.6).restart();
              // schedule an auto-fit so the view recenters/zooms to the graph after forces start
              scheduleAutoFit(400, 8);
            } catch (e) {
              console.error("Failed to configure forces", e);
            }
          }

          function applyLayout(mode) {
            if (mode && mode.indexOf("force") === 0) {
              // reset node positions to a neutral starting state to avoid cumulative spreading
              resetNodePositions();
              // resume/adjust force simulation with parameters for the requested mode
              simulation.nodes(graph.nodes);
              configureForces(mode);
              return;
            }
            // stop force simulation and place nodes deterministically
            try {
              simulation.stop();
            } catch (e) {}
            if (mode === "circular") {
              var cx = width / 2,
                cy = height / 2,
                r = Math.min(width, height) * 0.35;
              graph.nodes.forEach(function (n, i) {
                var a = (i / graph.nodes.length) * Math.PI * 2;
                n.x = cx + Math.cos(a) * r;
                n.y = cy + Math.sin(a) * r;
              });
            } else if (mode === "grid") {
              var cols = Math.ceil(Math.sqrt(graph.nodes.length));
              var spacing = Math.max(
                60,
                Math.min(160, Math.floor(Math.min(width, height) / cols)),
              );
              graph.nodes.forEach(function (n, i) {
                var col = i % cols;
                var row = Math.floor(i / cols);
                n.x = col * spacing + 50;
                n.y = row * spacing + 50;
              });
            }
            // apply immediate visual update
            node.attr("transform", function (d) {
              return "translate(" + d.x + "," + d.y + ")";
            });
            link.attr("d", function (d) {
              if (settings.linkStyle === "straight") {
                return (
                  "M" +
                  d.source.x +
                  "," +
                  d.source.y +
                  "L" +
                  d.target.x +
                  "," +
                  d.target.y
                );
              }
              var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy) || 1;
              var offsetX = (dx * d.target.radius) / dr;
              var offsetY = (dy * d.target.radius) / dr;
              return (
                "M" +
                d.source.x +
                "," +
                d.source.y +
                "A" +
                dr +
                "," +
                dr +
                " 0 0,1 " +
                (d.target.x - offsetX) +
                "," +
                (d.target.y - offsetY)
              );
            });
            if (!settings.showArrows) link.attr("marker-end", null);
            fitToGraph();
          }

          // speed up convergence and damping
          simulation.alpha(1).alphaDecay(0.05).velocityDecay(0.6).restart();

          // ensure size/center are correct after simulation exists
          try {
            updateSize();
            // apply user-selected layout (may restart or stop simulation)
            try {
              applyLayout(settings.layout);
            } catch (e) {}
          } catch (e) {}

          // when simulation finishes, ensure fit and hide overlay
          simulation.on("end", function () {
            if (!fitCalled) {
              fitCalled = true;
              fitToGraph();
              if (typeof hideLoading === "function") hideLoading();
            }
          });

          // add dragging (use pointer relative to container so drag works while zoomed)
          node.call(
            d3
              .drag()
              .on("start", function (event, d) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                var p = d3.pointer(event, container.node());
                d.fx = p[0];
                d.fy = p[1];
              })
              .on("drag", function (event, d) {
                var p = d3.pointer(event, container.node());
                d.fx = p[0];
                d.fy = p[1];
              })
              .on("end", function (event, d) {
                if (!event.active) simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
              }),
          );

          simulation.on("tick", function () {
            link.attr("d", function (d) {
              var dx = d.target.x - d.source.x,
                dy = d.target.y - d.source.y,
                dr = Math.sqrt(dx * dx + dy * dy) || 1;
              var sourceRadius =
                (d.source.radius || 0) * (settings.nodeScale || 1);
              var targetRadius =
                (d.target.radius || 0) * (settings.nodeScale || 1);
              var sourceOffsetX = (dx * sourceRadius) / dr;
              var sourceOffsetY = (dy * sourceRadius) / dr;
              var targetOffsetX = (dx * targetRadius) / dr;
              var targetOffsetY = (dy * targetRadius) / dr;
              if (settings.linkStyle === "straight") {
                return (
                  "M" +
                  (d.source.x + sourceOffsetX) +
                  "," +
                  (d.source.y + sourceOffsetY) +
                  "L" +
                  (d.target.x - targetOffsetX) +
                  "," +
                  (d.target.y - targetOffsetY)
                );
              }
              return (
                "M" +
                (d.source.x + sourceOffsetX) +
                "," +
                (d.source.y + sourceOffsetY) +
                "A" +
                dr +
                "," +
                dr +
                " 0 0,1 " +
                (d.target.x - targetOffsetX) +
                "," +
                (d.target.y - targetOffsetY)
              );
            });

            node.attr("transform", function (d) {
              return "translate(" + d.x + "," + d.y + ")";
            });
            // store latest bbox for clamping
            var minX = d3.min(graph.nodes, function (d) {
              return d.x - (d.radius || 0);
            });
            var maxX = d3.max(graph.nodes, function (d) {
              return d.x + (d.radius || 0);
            });
            var minY = d3.min(graph.nodes, function (d) {
              return d.y - (d.radius || 0);
            });
            var maxY = d3.max(graph.nodes, function (d) {
              return d.y + (d.radius || 0);
            });
            container.node().__graphBBox = {
              minX: minX,
              maxX: maxX,
              minY: minY,
              maxY: maxY,
            };

            // early-stabilization detection: stop and fit early to improve UX
            tickCount++;
            if (
              !fitCalled &&
              ((simulation.alpha() < 0.03 && tickCount > 15) ||
                tickCount > maxTicks)
            ) {
              fitCalled = true;
              try {
                simulation.stop();
              } catch (e) {}
              fitToGraph();
              if (typeof hideLoading === "function") hideLoading();
            }
          });

          function mouseover(event, d) {
            node.style("stroke-opacity", function (o) {
              var thisOpacity = isConnected(d, o) ? 1 : 0.1;
              this.setAttribute("fill-opacity", thisOpacity);
              return thisOpacity;
            });

            link.style("opacity", function (o) {
              return o.source === d || o.target === d ? 1 : 0.1;
            });

            div
              .style("display", "block")
              .transition()
              .duration(100)
              .style("opacity", 0.9);
            // Use page coordinates to position tooltip reliably.
            var left = (event.pageX || event.clientX + window.scrollX) + 10;
            var top = (event.pageY || event.clientY + window.scrollY) - 40;
            // Build richer tooltip content with stats and last seen / role
            try {
              var lastSeen = d.lastaccess
                ? new Date(d.lastaccess * 1000).toLocaleString()
                : "n/a";
              var role = d.role || "";
              var html =
                '<div class="fg-tooltip-name"><strong>' +
                escapeHtml(d.name) +
                "</strong></div>" +
                '<div class="fg-tooltip-stats">' +
                gs("posts_label") +
                ": " +
                (d.size || 0) +
                " &nbsp; " +
                gs("discussions_label") +
                ": " +
                (d.discussion || 0) +
                " &nbsp; " +
                gs("replies_label") +
                ": " +
                (d.reply || 0) +
                "</div>" +
                (role
                  ? '<div class="fg-tooltip-role">' +
                    gs("role_label") +
                    ": " +
                    escapeHtml(role) +
                    "</div>"
                  : "") +
                '<div class="fg-tooltip-last">' +
                gs("last_seen") +
                " " +
                escapeHtml(lastSeen) +
                "</div>";
              div
                .html(html)
                .style("left", left + "px")
                .style("top", top + "px");
            } catch (e) {
              div
                .html(escapeHtml(d.name))
                .style("left", left + "px")
                .style("top", top + "px");
            }
          }

          function mouseout() {
            node.style("stroke-opacity", function () {
              this.setAttribute("fill-opacity", 1);
              return 1;
            });

            link.style("opacity", 1);

            div
              .transition()
              .duration(200)
              .style("opacity", 0)
              .on("end", function () {
                div.style("display", "none");
              });
          }
        })
        .then(function () {
          // no-op: previous then handled graph rendering
        })
        .catch(function (error) {
          console.error("Error loading graph data:", error);
        });

      // fit graph to view after simulation ends
      function fitToGraph() {
        if (!container.node().__graphBBox) return;
        var bbox = container.node().__graphBBox;

        // padding: prefer a percentage of viewport, but keep a sensible minimum
        var paddingPercent = 0.08; // base 8% padding
        var minPadPx = 20;
        // On narrow screens reduce padding so auto-fit doesn't over-zoom out
        if (width <= 600) paddingPercent = 0.04;

        // account for overlay controls (top-right) only if they overlap the svg
        var extraPadRight = 0,
          extraPadTop = 0;
        try {
          var ctrl = document.querySelector(".forumgraph-controls");
          if (ctrl) {
            var crect = ctrl.getBoundingClientRect();
            var svgRect = svg.node().getBoundingClientRect();
            // add extra padding only when controls visually overlap the svg area
            var overlapsHoriz = crect.left < svgRect.right && crect.right > svgRect.left;
            var overlapsVert = crect.top < svgRect.bottom && crect.bottom > svgRect.top;
            if (overlapsHoriz && overlapsVert) {
              extraPadRight = Math.ceil(crect.width + 12);
              extraPadTop = Math.ceil(crect.height + 8);
            }
          }
        } catch (e) {}

        var basePadX = Math.max(minPadPx, Math.round(width * paddingPercent));
        var basePadY = Math.max(minPadPx, Math.round(height * paddingPercent));

        // Separate left/right and top/bottom padding so extra right/top UI
        // controls don't bias centering.
        var leftPad = basePadX;
        var rightPad = basePadX + extraPadRight;
        var topPad = basePadY + extraPadTop;
        var bottomPad = basePadY;

        var bboxWidth = Math.max(1, bbox.maxX - bbox.minX);
        var bboxHeight = Math.max(1, bbox.maxY - bbox.minY);

        var availW = Math.max(1, width - leftPad - rightPad);
        var availH = Math.max(1, height - topPad - bottomPad);

        var scale = Math.min(availW / bboxWidth, availH / bboxHeight);
        // allow a bit more zoom-out so nodes near edges are visible; on small screens
        // prefer to zoom in slightly more so graph fills the area.
        scale = scale * (width <= 600 ? 0.98 : 0.95);
        scale = Math.max(0.2, Math.min(4, scale));

        // center-based transform: map bbox center to available center area
        var bboxCenterX = (bbox.minX + bbox.maxX) / 2;
        var bboxCenterY = (bbox.minY + bbox.maxY) / 2;
        var centerX = leftPad + availW / 2;
        var centerY = topPad + availH / 2;

        var tx = centerX - scale * bboxCenterX;
        var ty = centerY - scale * bboxCenterY;

        var transform = d3.zoomIdentity.translate(tx, ty).scale(scale);
        svg
          .transition()
          .duration(700)
          .call(zoom.transform, transform)
          .on("end", function () {
            if (typeof hideLoading === "function") hideLoading();
          });
      }
      // attach a double-click handler to reset view
      svg.on("dblclick", function () {
        fitToGraph();
      });
    });
  }

  api = {
    init: function (forum, modid, courseid, wwwroot) {
      forumgraph.forum = forum;
      forumgraph.modid = modid;
      forumgraph.courseid = courseid;
      forumgraph.wwwroot = wwwroot;
      if (forumgraph.courseid != 0) {
        loadForumMenu(forumgraph.courseid);
      }
    },
  };

  return api;
});
