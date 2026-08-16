import type { FastifyInstance } from "fastify";
import { knex } from "../database.js";
import z from "zod";
import { formatDatabaseDate } from "../utils/date.js";

export function mealRoutes(app: FastifyInstance) {
  app.get("/", async (request, response) => {
    const getMealQuerySchema = z.object({
      id: z.uuid().optional(),
    });

    const { id } = getMealQuerySchema.parse(request.query);

    if (id) {
      const meal = await knex("meals")
        .where("meal_id", id)
        .where("user_id", request.userId)
        .first();

      if (!meal) {
        return response.status(404).send({
          message: "Meal not found",
        });
      }

      return meal;
    }

    const meals = await knex("meals")
      .where("user_id", request.userId)
      .select("*");

    return { meals };
  });

  app.get("/metrics", async (request) => {
    const meals = await knex("meals")
      .where("user_id", request.userId)
      .select("healthy")
      .orderBy("eaten_at", "asc")
      .orderBy("created_at", "asc");

    let currentHealthySequence = 0;
    let bestHealthySequence = 0;

    for (const meal of meals) {
      if (meal.healthy) {
        currentHealthySequence += 1;
        bestHealthySequence = Math.max(
          bestHealthySequence,
          currentHealthySequence,
        );
      } else {
        currentHealthySequence = 0;
      }
    }

    const healthyMeals = meals.filter((meal) => meal.healthy).length;

    return {
      totalMeals: meals.length,
      healthyMeals,
      unhealthyMeals: meals.length - healthyMeals,
      bestHealthySequence,
    };
  });

  app.post("/", async (request, response) => {
    const createMealBodySchema = z.object({
      name: z.string(),
      description: z.string().optional(),
      healthy: z.boolean(),
      eatenAt: z.iso.datetime(),
    });

    const { name, description, healthy, eatenAt } =
      createMealBodySchema.parse(request.body);

    const [createdMeal] = await knex("meals")
      .insert({
        name,
        description: description || "",
        healthy,
        eaten_at: formatDatabaseDate(new Date(eatenAt)),
        user_id: request.userId,
      })
      .returning("meal_id");

    if (!createdMeal) {
      return response.status(500).send({
        message: "Could not create meal",
      });
    }

    return response.status(201).send({
      mealId: createdMeal?.meal_id,
    });
  });

  app.patch("/:id", async (request, response) => {
    const updateMealParamsSchema = z.object({
      id: z.uuid(),
    });
    const updateMealBodySchema = z
      .object({
        name: z.string().optional(),
        description: z.string().optional(),
        healthy: z.boolean().optional(),
        eatenAt: z.iso.datetime().optional(),
      })
      .refine(
        (data) => Object.values(data).some((value) => value !== undefined),
        { message: "At least one field must be provided" },
      );

    const { id } = updateMealParamsSchema.parse(request.params);
    const data = updateMealBodySchema.parse(request.body);

    const updateData = {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.description !== undefined && {
        description: data.description,
      }),
      ...(data.healthy !== undefined && { healthy: data.healthy }),
      ...(data.eatenAt !== undefined && {
        eaten_at: formatDatabaseDate(new Date(data.eatenAt)),
      }),
      updated_at: knex.fn.now(),
    };

    const updatedMeals = await knex("meals")
      .where("meal_id", id)
      .where("user_id", request.userId)
      .update(updateData)
      .returning("meal_id");

    if (updatedMeals.length === 0) {
      return response.status(404).send({
        message: "Meal not found",
      });
    }

    return response.status(204).send();
  });

  app.delete("/:id", async (request, response) => {
    const deleteMealParamsSchema = z.object({
      id: z.uuid(),
    });

    const { id } = deleteMealParamsSchema.parse(request.params);

    const deletedMeals = await knex("meals")
      .where("meal_id", id)
      .where("user_id", request.userId)
      .delete();

    if (deletedMeals === 0) {
      return response.status(404).send({
        message: "Meal not found",
      });
    }

    return response.status(204).send();
  });
}
