/* empty css                                  */
import { e as createComponent, k as renderComponent, l as renderHead, r as renderTemplate } from '../chunks/astro/server_DblOTofr.mjs';
import 'piccolore';
import { jsxs, Fragment, jsx } from 'react/jsx-runtime';
export { renderers } from '../renderers.mjs';

const Head = () => {
  return /* @__PURE__ */ jsxs(Fragment, { children: [
    /* @__PURE__ */ jsx("meta", { charSet: "UTF-8" }),
    /* @__PURE__ */ jsx("meta", { name: "viewport", content: "width=device-width, initial-scale=1.0" }),
    /* @__PURE__ */ jsx("title", { children: "Saarthi - Campus Calm" }),
    /* @__PURE__ */ jsx("meta", { name: "description", content: "Mental wellness platform for college students" }),
    /* @__PURE__ */ jsx("link", { rel: "preconnect", href: "https://fonts.googleapis.com" }),
    /* @__PURE__ */ jsx("link", { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" })
  ] });
};

const $$ = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`<html lang="en" class="w-full h-full"> <head>${renderComponent($$result, "Head", Head, {})}${renderHead()}</head> <body class="w-full h-full"> <div id="root" class="w-full h-full"> ${renderComponent($$result, "AppRouter", null, { "client:only": "react", "client:component-hydration": "only", "client:component-path": "@/components/Router", "client:component-export": "default" })} </div> </body></html>`;
}, "C:/Users/dell/Desktop/campus-calm-main/src/pages/[...slug].astro", void 0);

const $$file = "C:/Users/dell/Desktop/campus-calm-main/src/pages/[...slug].astro";
const $$url = "/[...slug]";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
