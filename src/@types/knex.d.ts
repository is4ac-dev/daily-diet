import type { Knex } from "knex";

interface User {
  user_id: string;
  name: string;
  email: string;
  password: string;
  created_at: Date;
}

interface Meal {
  meal_id: string;
  user_id: string;
  name: string;
  description: string | null;
  healthy: boolean;
  created_at: Date;
}

declare module "knex/types/tables.js" {
  interface Tables {
    users: Knex.CompositeTableType<
      User,
      Omit<User, "user_id" | "created_at">,
      Partial<Omit<User, "user_id" | "created_at">>
    >;

    meals: Knex.CompositeTableType<
      Meal,
      Omit<Meal, "meal_id" | "created_at">,
      Partial<Omit<Meal, "meal_id" | "created_at">>
    >;
  }
}
