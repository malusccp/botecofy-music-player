import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import type { Express } from "express";
import { createApp } from "../app.js";
import { TrackModel } from "../models/Track.js";
import { UserModel } from "../models/User.js";

/**
 * Teste de integração da API (valida critérios de aceitação de HU01/HU02
 * ponta-a-ponta). Usa MongoDB em memória e o MODO DEV de autenticação.
 */
let mongod: MongoMemoryServer;
let app: Express;

beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  app = createApp().app;
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongod.stop();
});

beforeEach(async () => {
  await Promise.all([TrackModel.deleteMany({}), UserModel.deleteMany({})]);
});

describe("GET /api/tracks (HU02)", () => {
  it("lista apenas faixas ativas", async () => {
    const curator = await UserModel.create({
      clerkId: "dev:c",
      displayName: "C",
      role: "curator",
    });
    await TrackModel.create([
      { title: "Ativa", artist: "A", rhythm: "pagode", audioUrl: "/x.mp3", status: "active", uploadedBy: curator._id },
      { title: "Inativa", artist: "A", rhythm: "pagode", audioUrl: "/y.mp3", status: "inactive", uploadedBy: curator._id },
    ]);

    const res = await request(app).get("/api/tracks");
    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].title).toBe("Ativa");
  });

  it("filtra por ritmo", async () => {
    const curator = await UserModel.create({ clerkId: "dev:c2", displayName: "C", role: "curator" });
    await TrackModel.create([
      { title: "P", artist: "A", rhythm: "pagode", audioUrl: "/x.mp3", uploadedBy: curator._id },
      { title: "S", artist: "B", rhythm: "sertanejo", audioUrl: "/y.mp3", uploadedBy: curator._id },
    ]);

    const res = await request(app).get("/api/tracks?rhythms=sertanejo");
    expect(res.body.total).toBe(1);
    expect(res.body.items[0].rhythm).toBe("sertanejo");
  });
});

describe("POST /api/tracks (HU01, RN03)", () => {
  it("proíbe ouvinte de cadastrar faixa (403)", async () => {
    const res = await request(app)
      .post("/api/tracks")
      .set("x-dev-user-id", "ouvinte")
      .set("x-dev-role", "listener")
      .field("title", "Nova")
      .field("artist", "X")
      .field("rhythm", "pagode")
      .attach("audio", Buffer.from("fake"), { filename: "a.mp3", contentType: "audio/mpeg" });

    expect(res.status).toBe(403);
  });

  it("exige autenticação (401)", async () => {
    const res = await request(app).post("/api/tracks").field("title", "Nova");
    expect(res.status).toBe(401);
  });
});
