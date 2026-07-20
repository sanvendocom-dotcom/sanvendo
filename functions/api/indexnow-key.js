export async function onRequestGet(context) {
  const key = String(context.env.INDEXNOW_KEY || "").trim();
  if (!key) {
    return new Response("Not configured", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=UTF-8", "Cache-Control": "no-store" },
    });
  }

  return new Response(key, {
    headers: {
      "Content-Type": "text/plain; charset=UTF-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
