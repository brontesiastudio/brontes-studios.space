(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [773],
  {
    1773: function (module, exports, require) {
      "use strict";
      require.d(exports, { Price: function () { return Price; } });
      var jsx = require(7437);

      function Price(props) {
        var layer = props.layer || {};
        return jsx.jsxs("div", {
          className: "rounded-2xl border-2 border-green-600 bg-green-50 p-5 text-center",
          children: [
            layer.titleHtml
              ? jsx.jsx("div", { className: "richtext", dangerouslySetInnerHTML: { __html: layer.titleHtml } })
              : null,
            layer.before ? jsx.jsx("p", { className: "mt-2 text-sm text-gray-600", children: layer.before }) : null,
            jsx.jsx("p", { className: "my-1 text-4xl font-black text-green-700", children: layer.value || "" }),
            layer.after ? jsx.jsx("p", { className: "text-sm text-gray-600", children: layer.after }) : null,
          ],
        });
      }
    },
  },
]);
