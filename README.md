# Vue 3 + HyperExpress + Vite SSR

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
git clone https://github.com/benoitlahoz/hyper-express-vite-vue.git
cd hyper-express-vite-vue
yarn
```

## License

[MIT](./LICENSE)
