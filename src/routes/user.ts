import type { FastifyInstance } from "fastify";
import { knex } from "../database.js";

export function userRoutes(app: FastifyInstance) {
  app.get("/", async (request, response) => {
    const user = await knex("users")
      .where("user_id", request.userId)
      .select("user_id", "name", "email", "created_at")
      .first();

    if (!user) {
      return response.status(404).send({
        message: "User not found",
      });
    }

    return user;
  });
}
