// Import with `import * as Sentry from "@sentry/node"` if you are using ESM

import * as Sentry from "@sentry/node";

Sentry.init({
	dsn: "https://95bd5fba960967030fcdff71aaa8afd6@o4509037778829312.ingest.de.sentry.io/4509056223346768",

	// Set sampling rate for profiling - this is evaluated only once per SDK.init
	profileSessionSampleRate: 1.0,
});
