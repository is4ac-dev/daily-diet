import type { FastifyRequest, FastifyReply } from "fastify";
import { knex } from "../database.js";
import crypto from "node:crypto";
import { formatDatabaseDate } from "../utils/date.js";

export async function auth(request: FastifyRequest, response: FastifyReply) {
  const authorization = request.headers.authorization;

  if (!authorization) {
    return response.status(401).send({
      message: "Access token is required",
    });
  }

  const [scheme, token] = authorization.split(" ");

  if (scheme !== "Bearer" || !token) {
    return response.status(401).send({
      message: "Invalid authorization format",
    });
  }

  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

  const session = await knex("sessions")
    .where("token_hash", tokenHash)
    .where("expires_at", ">", formatDatabaseDate(new Date()))
    .first();

  if (!session) {
    return response.status(401).send({
      message: "Invalid or expired access token",
    });
  }

  request.userId = session.user_id;
}
