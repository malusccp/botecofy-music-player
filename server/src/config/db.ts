import mongoose from "mongoose";
import { env } from "./env.js";

/** Conecta ao MongoDB. Chamada uma vez na subida da aplicação. */
export async function connectDatabase(uri: string = env.mongoUri): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri);
  console.log(`[db] conectado em ${uri}`);
}

export async function disconnectDatabase(): Promise<void> {
  await mongoose.disconnect();
}
