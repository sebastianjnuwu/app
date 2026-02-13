import Redis, { Redis as RedisClient } from "ioredis";
import { logger } from "@functions/logger";
import "dotenv/config";

/**
 * Inicializa e conecta um cliente Redis usando ioredis.
 * Suporta TLS em produção e logs detalhados de conexão.
 */

const client: RedisClient = new Redis(process.env.REDIS_URL!, {
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  tls:
    process.env.NODE_ENV === "production" && process.env.REDIS_TLS_KEY && process.env.REDIS_TLS_CERT
      ? {
          key: process.env.REDIS_TLS_KEY.replace(/\\n/g, "\n"),
          cert: process.env.REDIS_TLS_CERT.replace(/\\n/g, "\n"),
          rejectUnauthorized: false,
        }
      : undefined,
});

// Eventos de status
client.on("connect", () => logger.info("Redis: connecting..."));
client.on("ready", () => logger.info("Redis: ready"));
client.on("close", () => logger.warn("Redis: connection closed"));
client.on("reconnecting", (delay) => logger.info(`Redis: reconnecting in ${delay} ms`));
client.on("error", (err: Error) => logger.error(`Redis connection error: ${err.message}`));

// Teste inicial da conexão
(async () => {
  try {
    const pong = await client.ping();
    logger.info(`PING Redis: ${pong}`); // deve retornar "PONG"
  } catch (err) {
    logger.error(`Erro ao pingar Redis: ${err}`);
  }
})();

// Log URL mascarada quando conectado
client.on("ready", () =>
  logger.info(
    `Redis conectado (${process.env.REDIS_URL!.replace(/\/\/.*@.*/, "//***:***@***")})`
  )
);

export default client;
