import { logger } from "@functions/logger";
import { createServer } from "node:http";
import { Server, Socket } from "socket.io";
import { ROOM } from "@socket/ROOM";
import { LEAVE_ROOM } from "@socket/LEAVE_ROOM";
import express from "express";
import colors from "colors";
import "@database/redis";
import "dotenv/config";

const app = express();
const http = createServer(app);
const io = new Server(http);

app.get("*", (_, res) => {
  res.status(200).json({
    status: true,
    date: new Date(),
  });
});

io.on("connection", (socket: Socket) => {
  logger.info(`Client connected: ${socket.id}`);

  socket.on("ROOM", ROOM);

  socket.on("LEAVE_ROOM", LEAVE_ROOM);

    socket.on("disconnect", async () => {
    logger.info(`Client disconnected: ${socket.id}`);

    const USER = socket.data.USER;
    const ROOM_CODE = socket.data.ROOM_CODE;

    if (USER && ROOM_CODE) {
      try {
        await LEAVE_ROOM({ USER, ROOM_CODE }).catch(err =>
          logger.error(`Error leaving room on disconnect: ${err}`)
        );
      } catch (err) {
        logger.error(`Error handling disconnect: ${err}`);
      }
    }
  });


});

http.listen(Number(process.env.PORT) || 3000, process.env.HOST ?? "localhost", () => {
  logger.info(
    `Socket running on: ${colors.bold.green(`http://${process.env.HOST ?? "localhost"}:${process.env.PORT ?? 3000}`)}`
  );
});
