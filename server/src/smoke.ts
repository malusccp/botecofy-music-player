import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";
import request from "supertest";
import { createApp } from "./app.js";
import { buildContainer } from "./config/container.js";
import { FakeAuthProvider } from "./testing/FakeAuthProvider.js";

/** Smoke test end-to-end do fluxo das histórias contra o app real. */
async function main() {
  const mongod = await MongoMemoryServer.create();
  await mongoose.connect(mongod.getUri());
  const container = buildContainer();
  container.authProvider = new FakeAuthProvider();
  const { app } = createApp(container);

  const curator = { "x-test-user-id": "curador", "x-test-role": "curator", "x-test-name": "Curador" };
  const listener = { "x-test-user-id": "ouvinte", "x-test-role": "listener", "x-test-name": "Ouvinte" };
  const admin = { "x-test-user-id": "admin", "x-test-role": "admin", "x-test-name": "Admin" };

  const log = (label: string, ok: boolean, extra = "") =>
    console.log(`${ok ? "✓" : "✗"} ${label}${extra ? "  → " + extra : ""}`);

  // health + meta
  const health = await request(app).get("/api/health");
  log("GET /health", health.status === 200, health.body.status);
  const meta = await request(app).get("/api/meta");
  log("GET /meta", meta.body.rhythms?.length === 4, meta.body.rhythms?.join(","));

  // HU01 upload (curador)
  const created = await request(app)
    .post("/api/tracks")
    .set(curator)
    .field("title", "Saideira da Madrugada")
    .field("artist", "Zé do Pagode")
    .field("rhythm", "pagode")
    .attach("audio", Buffer.from("fake-mp3"), { filename: "s.mp3", contentType: "audio/mpeg" });
  log("HU01 cadastrar faixa (201)", created.status === 201, created.body.id);
  const trackId = created.body.id;

  // RN02 duplicado
  const dup = await request(app)
    .post("/api/tracks")
    .set(curator)
    .field("title", "Saideira da Madrugada")
    .field("artist", "Zé do Pagode")
    .field("rhythm", "pagode")
    .attach("audio", Buffer.from("x"), { filename: "s.mp3", contentType: "audio/mpeg" });
  log("RN02 título duplicado bloqueado (409)", dup.status === 409, dup.body.error?.code);

  // HU02 listar
  const list = await request(app).get("/api/tracks?rhythms=pagode&sort=recent");
  log("HU02 buscar/filtrar", list.body.total === 1 && list.body.items[0].id === trackId);

  // HU05 curtir
  const like = await request(app).post(`/api/tracks/${trackId}/like`).set(listener);
  log("HU05 curtir (liked, likes=1)", like.body.liked === true && like.body.likesCount === 1);

  // RN06 play < 20s não conta; >= 20s conta
  const p1 = await request(app).post(`/api/tracks/${trackId}/play`).set(listener).send({ listenedSeconds: 5 });
  const p2 = await request(app).post(`/api/tracks/${trackId}/play`).set(listener).send({ listenedSeconds: 25 });
  log("RN06 play<20s não conta", p1.body.counted === false);
  log("RN06 play>=20s conta", p2.body.counted === true && p2.body.playsCount === 1);

  // HU04 criar playlist (curador) + adicionar faixa
  const pl = await request(app)
    .post("/api/playlists")
    .set(curator)
    .send({ name: "Pagode de Mesa", rhythms: ["pagode"], isPublic: true });
  log("HU04 criar playlist (201)", pl.status === 201, pl.body.id);
  const add = await request(app).post(`/api/playlists/${pl.body.id}/tracks`).set(curator).send({ trackId });
  log("HU04 adicionar faixa à playlist", add.body.trackCount === 1);

  // RN03 ouvinte não cria playlist
  const forbidden = await request(app)
    .post("/api/playlists")
    .set(listener)
    .send({ name: "X", rhythms: ["pagode"] });
  log("RN03 ouvinte não cria playlist (403)", forbidden.status === 403);

  // HU06 seguir
  const follow = await request(app).post(`/api/playlists/${pl.body.id}/follow`).set(listener);
  log("HU06 seguir playlist", follow.body.following === true);
  const followed = await request(app).get("/api/playlists/followed/mine").set(listener);
  log("HU06 listar seguidas", followed.body.length === 1);

  // HU07 moderar (admin) → some da busca (RN04)
  const deact = await request(app).post(`/api/moderation/tracks/${trackId}/deactivate`).set(admin).send({ reason: "teste" });
  log("HU07 inativar faixa", deact.body.status === "inactive");
  const listAfter = await request(app).get("/api/tracks?rhythms=pagode");
  log("RN04 faixa inativa some da busca", listAfter.body.total === 0);

  // HU08 perfil + histórico
  const me = await request(app).get("/api/me").set(listener);
  log("HU08 perfil", me.body.role === "listener", me.body.displayName);
  const hist = await request(app).get("/api/me/history").set(listener);
  log("HU08 histórico registrado", hist.body.items.length >= 1);

  await mongoose.disconnect();
  await mongod.stop();
  console.log("\nSmoke test concluído.");
}

main().catch((e) => {
  console.error("Smoke falhou:", e);
  process.exit(1);
});
