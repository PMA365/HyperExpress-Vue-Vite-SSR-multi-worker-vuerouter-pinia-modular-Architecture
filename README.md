# Vue 3 + HyperExpress + Vite SSR + Vuerouter + Pinia + Multi Workers SSR

this is a updated version of this Repository from dear benoitlahoz :

```sh
https://github.com/benoitlahoz/hyper-express-vite-vue.git
```

[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-%230074c1.svg)](http://www.typescriptlang.org/) [![GitHub license](https://img.shields.io/github/license/Naereen/StrapDown.js.svg)](https://github.com/Naereen/StrapDown.js/blob/master/LICENSE) [![PR Welcome Badge](https://badgen.net/https/pr-welcome-badge.vercel.app/api/badge/sinchang/pr-welcome-badge)](https://github.com/benoitlahoz/hyper-express-vite-vue/issues?q=archived:false+is:issue+is:open+sort:updated-desc+label%3A%22help%20wanted%22%2C%22good%20first%20issue%22)

This **experimental** template introduces a way to use [HyperExpress](https://github.com/kartikk221/hyper-express) as server and [LiveDirectory](https://github.com/kartikk221/live-directory) to serve static files, in a server-side rendered site.

It is based on [create-vite-extra](https://github.com/bluwy/create-vite-extra/tree/master) template [template-ssr-vue-ts](https://github.com/bluwy/create-vite-extra/tree/master/template-ssr-vue-ts). It might be useful to look at the difference between the two implementations.

## Motivation

HyperExpress is a high performance webserver.

It may not be noticeable by strictly using this template to serve SSR in small websites, but if one would need to add an API, stream large files, etc., with the power of [uWebsockets.js](https://github.com/uNetworking/uWebSockets.js) under the hood, it will definitely make the difference.

And if one needs to use WebSockets but prefers working with the [socket.io](https://socket.io/) API, [socket.io provide a very simple way](https://socket.io/docs/v4/server-api/#serverattachappapp-options) to use the underlying HyperExpress `uws` object.

### Warning

One main problem that was preventing the use of HyperExpress for Server-Side Rendering with Vite was an incompatibility between HyperExpress request and response objects and Vite middlewares used in development.

Before writing a polyfill for each of these middlewares, this was resolved by adding some compatible methods on HyperExpress Request and Response objects (see PR [#324](https://github.com/kartikk221/hyper-express/pull/327#issue-2722812184)).

Hopefully this PR will be merged soon.
In the meantime, this package has our own fork of HyperExpress as dependency, but it's obviously exprimental, as it has not been extensively tested. It works, but... **USE AT YOUR OWN RISKS**...

## Installation

```sh
git clone https://github.com/PMA365/HyperExpress-Vue-Vite-SSR-multi-worker-vuerouter-pinia-modular-Architecture.git
cd HyperExpress-Vue-Vite-SSR-multi-worker-vuerouter-pinia-modular-Architecture
pnpm install
```

For Using Jsdoc insted of typescript for server side and client side
we need to install jsdoc

```sh
pnpm install -g jsdoc

```

then

```sh
pnpm add --save-dev jsdoc

```

## License

[MIT](./LICENSE)

---

> [!NOTE]
> You should add this line to your tsconfig.json
> to solve the cannot import pinia problem
> The "resolvePackageJsonExports": false option tells the TypeScript compiler to not resolve package.json exports.
> This can help resolve issues with dependencies that have incorrect or missing exports in their package.json files

```bash
"compilerOptions": {
  "resolvePackageJsonExports": false,

}
```

---

> [!NOTE]

Pinia Store in SSR
In an SSR (Server Side Rendering) application, a memory leak can occur if a getter is accessed in the server-side rendering process, as noted in a discussion on GitHub.
This issue arises because the store is recreated for each request, and if a getter is cached or accessed improperly, it can lead to memory leaks. To prevent this, one approach is to avoid caching getters on the server side or to ensure that getters are not accessed before the state is properly hydrated.

Additionally, it's important to ensure that the Pinia instance is passed to any useStore calls when running SSR to prevent cross-request state pollution.
This means that if you are using a getter within a store action, you should pass the Pinia instance explicitly to avoid potential state leaks between concurrent sessions.

Therefore, while removing the Pinia store entirely is not the recommended approach, ensuring proper handling of getters and passing the Pinia instance correctly can help mitigate memory leaks in SSR applications.
