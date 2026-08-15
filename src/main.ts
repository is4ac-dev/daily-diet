import fastify from "fastify";
import { ZodError } from "zod";

import { auth } from "./middlewares/auth.js";

import { publicUserRoutes } from "./routes/publicUser.js";
import { authRoutes } from "./routes/auth.js";
import { userRoutes } from "./routes/user.js";

const app = fastify();

app.setErrorHandler((error, request, response) => {
  if (error instanceof ZodError) {
    return response.status(400).send({
      statusCode: 400,
      error: "Bad Request",
      message: "Invalid request data",
      issues: error.issues,
    });
  }

  request.log.error(error);

  return response.status(500).send({
    statusCode: 500,
    error: "Internal Server Error",
    message: "An unexpected error occurred",
  });
});

app.register(authRoutes, {
  prefix: "/auth",
});

app.register(publicUserRoutes, {
  prefix: "/user",
});

app.register(async (protectedApp) => {
  protectedApp.addHook("preHandler", auth);

  protectedApp.register(userRoutes, {
    prefix: "user",
  });
});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP Server Running!");
  });
