import type { FastifyInstance } from "fastify";
import { knex } from "../database.js";
import z from "zod";

export function userRoutes(app: FastifyInstance) {
  app.get("/", async (request, response) => {
    const getUserQuerySchema = z.object({
      id: z.uuid().optional(),
    });

    const { id } = getUserQuerySchema.parse(request.query);

    if (id) {
      const user = await knex("users").where("user_id", id).first();

      if (!user) {
        return response.status(404).send({
          message: "User not found",
        });
      }

      return user;
    }

    const users = await knex("users").select("*");

    return { users };
  });
}
