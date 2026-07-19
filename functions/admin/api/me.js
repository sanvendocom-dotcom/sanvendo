import { securityHeaders } from "../../_lib/access.js";

export function onRequestGet(context) {
  const user = context.data.adminUser;

  return new Response(
    JSON.stringify({
      success: true,
      user: {
        email: user?.email || "",
      },
      logoutUrl: "/cdn-cgi/access/logout",
    }),
    {
      status: 200,
      headers: securityHeaders(),
    }
  );
}

export function onRequest() {
  return new Response(
    JSON.stringify({ success: false, message: "Method not allowed." }),
    {
      status: 405,
      headers: {
        ...securityHeaders(),
        Allow: "GET",
      },
    }
  );
}
