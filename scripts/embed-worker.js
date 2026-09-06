// Build-time helper only. Never deployed.
//
// Running this under `wrangler dev --remote` gives the build step a real
// Workers AI binding using the developer's existing wrangler login, so no
// API token is written to disk or passed through the environment.

export default {
  async fetch(request, env) {
    const url = new URL(request.url)
    if (url.pathname === '/health') return new Response('ok')
    if (request.method !== 'POST') return new Response('post texts', { status: 405 })

    const { texts, model } = await request.json()
    const result = await env.AI.run(model, { text: texts })
    return Response.json({ vectors: result.data })
  },
}
