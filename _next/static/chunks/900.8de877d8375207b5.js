(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [900],
  {
    900: function (module, exports, require) {
      "use strict";
      require.d(exports, { Carousel: function () { return Carousel; } });
      var jsx = require(7437);

      function Carousel(props) {
        var items = (props.layer && props.layer.items) || [];
        return jsx.jsxs("div", {
          className: "w-full",
          children: [
            jsx.jsx("div", {
              className: "flex gap-3 overflow-x-auto snap-x snap-mandatory pb-2",
              children: items.map(function (item, index) {
                return jsx.jsxs("figure", {
                  className: "min-w-full snap-center",
                  children: [
                    jsx.jsx("img", {
                      src: item.src,
                      alt: item.alt || item.caption || "Imagem do carrossel",
                      loading: index === 0 ? "eager" : "lazy",
                      decoding: "async",
                      className: "block w-full rounded-2xl object-cover bg-gray-50",
                    }),
                    item.caption
                      ? jsx.jsx("figcaption", {
                          className: "mt-2 text-center text-sm text-gray-600",
                          children: item.caption,
                        })
                      : null,
                  ],
                }, index);
              }),
            }),
            items.length > 1
              ? jsx.jsx("p", {
                  className: "mt-1 text-center text-xs text-gray-500",
                  children: "Deslize para ver mais",
                })
              : null,
          ],
        });
      }
    },
  },
]);
