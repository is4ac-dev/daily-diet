import fastify from "fastify";
import { ZodError } from "zod";
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

app.register(userRoutes, {
  prefix: "/user",
});

app
  .listen({
    port: 3333,
  })
  .then(() => {
    console.log("HTTP Server Running!");
  });
