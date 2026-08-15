import type { FastifyInstance } from "fastify";
import { knex } from "../database.js";
import z from "zod";
import bcrypt from "bcrypt";
import crypto from "node:crypto";
import { formatDatabaseDate } from "../utils/date.js";

export function authRoutes(app: FastifyInstance) {
  app.post("/", async (request, response) => {
    const authUserBodySchema = z.object({
      email: z.email().toLowerCase(),
      password: z.string(),
    });

    const { email, password } = authUserBodySchema.parse(request.body);

    const [user] = await knex("users")
      .where("email", email)
      .select("password", "user_id");

    if (!user) {
      return response.status(404).send({
        message: "User not found",
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) {
      return response.status(401).send({
        message: "Invalid email or password",
      });
    }

    const token = crypto.randomBytes(32).toString("hex");

    const tokenHash = crypto.createHash("sha256").update(token).digest("hex");

    await knex("sessions").insert({
      user_id: user.user_id,
      token_hash: tokenHash,
      expires_at: formatDatabaseDate(
        new Date(Date.now() + 1000 * 60 * 60 * 2),
      ),
    });

    return { token };
  });
}
