import type { FastifyInstance } from "fastify";
import { knex } from "../database.js";
import z from "zod";
import bcrypt from "bcrypt";

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

  app.post("/", async (request, response) => {
    const createUserBodySchema = z.object({
      name: z.string(),
      email: z.email().toLowerCase(),
      password: z.string(),
    });

    const { name, email, password } = createUserBodySchema.parse(request.body);

    const emailInUse = await knex("users").where("email", email).first();

    if (emailInUse) {
      return response.status(409).send({
        message: "E-mail is not available",
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const [createdUser] = await knex("users")
      .insert({
        name,
        email,
        password: passwordHash,
      })
      .returning("user_id");

    if (!createdUser) {
      return response.status(500).send({
        message: "Could not create user",
      });
    }

    return response.status(201).send({
      userId: createdUser.user_id,
    });
  });
}
