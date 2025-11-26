import "reflect-metadata";
import { DataSource } from "typeorm";
import dotenv from "dotenv";
dotenv.config();

import { User } from "./models/User";
import { Lembrete } from "./models/Lembrete";
import { Checklist } from "./models/Checklist";
import { Categoria } from "./models/Categoria";

export const AppDataSource = new DataSource({
  type: "mysql",
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 3306),
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "db_reminder",
  entities: [User, Lembrete, Checklist, Categoria],
  synchronize: false,
  logging: false,
});
