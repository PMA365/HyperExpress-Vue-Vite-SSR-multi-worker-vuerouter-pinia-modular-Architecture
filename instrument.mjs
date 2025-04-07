// Adjust the Node.js call for your application to use the --import parameter and point it at instrument.js, which contains your Sentry.init() code:

// Bash

// Copied
// # Note: This is only available for Node v18.19.0 onwards.
// node --import ./instrument.mjs app.mjs
// If it is not possible for you to pass the --import flag to the Node.js binary, you can alternatively use the NODE_OPTIONS environment variable as follows:

// Bash

// Copied
// NODE_OPTIONS="--import ./instrument.mjs" npm run star

//We do not support ESM in Node versions before 18.19.0
import * as Sentry from "@sentry/node";
// Ensure to call this before requiring any other modules!
Sentry.init({
	dsn: "https://examplePublicKey@o0.ingest.sentry.io/0",
});
