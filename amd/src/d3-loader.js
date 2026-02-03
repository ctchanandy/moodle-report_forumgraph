// AMD loader wrapper for D3 v7 for report_forumgraph
// Ensures D3 is available while preventing anonymous-define warnings
define([], function () {
  return {
    ensureD3: function (cb, errcb) {
      if (window.d3) {
        try {
          if (cb) {
            cb(window.d3);
          }
        } catch (e) {}
        return;
      }
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
        if (cb) {
          cb(window.d3);
        }
      };
      s.onerror = function () {
        try {
          window.define = backupDefine;
        } catch (e) {}
        if (errcb) {
          errcb(new Error("Failed to load d3"));
        }
      };
      document.head.appendChild(s);
    },
  };
});

// Also expose a global fallback so callers can use the loader without RequireJS.
try {
  if (!window.report_forumgraph_d3loader) {
    window.report_forumgraph_d3loader = (function () {
      return {
        ensureD3: function (cb, errcb) {
          if (window.d3) {
            try {
              if (cb) {
                cb(window.d3);
              }
            } catch (e) {}
            return;
          }
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
            if (cb) {
              cb(window.d3);
            }
          };
          s.onerror = function () {
            try {
              window.define = backupDefine;
            } catch (e) {}
            if (errcb) {
              errcb(new Error("Failed to load d3"));
            }
          };
          document.head.appendChild(s);
        },
      };
    })();
  }
} catch (e) {}
