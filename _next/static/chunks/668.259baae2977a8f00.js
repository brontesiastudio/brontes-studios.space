(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [668],
  {
    6773: function (module, exports, require) {
      "use strict";
      require.d(exports, { Chart: function () { return Chart; } });
      var jsx = require(7437);

      function Chart(props) {
        var layer = props.layer || {};
        return jsx.jsx("div", {
          className: "space-y-4 rounded-2xl border border-gray-200 p-4",
          children: (layer.datasets || []).map(function (dataset, datasetIndex) {
            return jsx.jsxs("div", {
              children: [
                jsx.jsx("p", { className: "mb-2 font-bold", children: dataset.label || "Resultado" }),
                jsx.jsx("div", {
                  className: "space-y-2",
                  children: (dataset.points || []).map(function (point, pointIndex) {
                    var value = Math.max(0, Math.min(100, Number(point.value) || 0));
                    return jsx.jsxs("div", {
                      children: [
                        jsx.jsxs("div", {
                          className: "mb-1 flex justify-between text-xs text-gray-600",
                          children: [jsx.jsx("span", { children: point.label || "" }), jsx.jsx("span", { children: point.tooltip || value + "%" })],
                        }),
                        jsx.jsx("div", {
                          className: "h-2 overflow-hidden rounded-full bg-gray-200",
                          children: jsx.jsx("div", {
                            className: "h-full rounded-full",
                            style: { width: value + "%", backgroundColor: dataset.color || "#22c55e" },
                          }),
                        }),
                      ],
                    }, pointIndex);
                  }),
                }),
              ],
            }, datasetIndex);
          }),
        });
      }
    },
  },
]);
