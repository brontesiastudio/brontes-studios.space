(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [332],
  {
    1332: function (module, exports, require) {
      "use strict";
      require.d(exports, { Video: function () { return Video; } });
      var jsx = require(7437);

      function Video(props) {
        var layer = props.layer || {};
        return jsx.jsx("div", {
          className: "w-full overflow-hidden rounded-2xl bg-black",
          style: layer.ratio ? { aspectRatio: String(layer.ratio) } : undefined,
          dangerouslySetInnerHTML: { __html: layer.embed || "" },
        });
      }
    },
  },
]);
