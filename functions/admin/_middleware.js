import {
  adminErrorResponse,
  authorizeAdmin,
} from "../_lib/access.js";

export async function onRequest(context) {
  const authorization = await authorizeAdmin(context);

  if (!authorization.ok) {
    return adminErrorResponse(context.request, authorization);
  }

  context.data.adminUser = authorization;
  return context.next();
}
