import astroWorker from "@astrojs/cloudflare/entrypoints/server";

import { canonicalHostRedirect } from "./lib/canonical-host.js";

const worker: typeof astroWorker = {
  async fetch(request, env, context) {
    const redirect = canonicalHostRedirect(request);

    if (redirect) {
      return redirect;
    }

    return astroWorker.fetch(request, env, context);
  },
};

export default worker;
