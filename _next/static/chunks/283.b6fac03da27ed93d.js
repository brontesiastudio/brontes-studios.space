(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [283],
  {
    4283: function (module, exports, require) {
      "use strict";
      require.d(exports, { Loading: function () { return Loading; } });
      var jsx = require(7437);
      var React = require(2265);

      function Loading(props) {
        var layer = props.layer || {};
        React.useEffect(function () {
          var timer = setTimeout(function () {
            if (props.onDone) props.onDone();
          }, layer.durationMs || 2500);
          return function () { clearTimeout(timer); };
        }, [layer.durationMs, props.onDone]);

        return jsx.jsxs("div", {
          className: "rounded-2xl bg-gray-50 p-6 text-center",
          children: [
            jsx.jsx("div", {
              className: "mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-green-600",
              "aria-hidden": true,
            }),
            jsx.jsx("h3", { className: "font-bold text-lg", children: layer.title || "Carregando..." }),
            layer.description
              ? jsx.jsx("p", { className: "mt-2 text-gray-600", children: layer.description })
              : null,
          ],
        });
      }
    },
  },
]);
