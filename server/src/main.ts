import { logger } from "@functions/logger";
import { randomBytes } from "node:crypto";
import { createServer } from "node:http";
import { Server } from "socket.io";
import { ROOM } from "@socket/ROOM";
import { LEAVE_ROOM } from "@socket/LEAVE_ROOM";
import express from "express";
import colors from "colors";
import "dotenv/config";
import "@db/prisma";

const app = express();
const http = createServer(app);
const io = new Server(http);

app.get("*", (req, res) => {
  res.status(200).json({
    status: true,
    date: new Date(),
  });
});

io.on("connection", (socket) => {
  
  socket.on("ROOM", ROOM);
  
  socket.on("LEAVE_ROOM", LEAVE_ROOM);
  
  socket.on("disconnect", () => logger.info(`Client disconnected: ${socket.id}`));
  
});

http.listen(process.env.PORT, () => {
  return logger.info(`Socket running on: ${colors.bold.green(`http://0.0.0.0:${process.env.PORT}`)}`)
});