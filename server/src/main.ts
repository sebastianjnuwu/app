import { logger } from "@functions/logger";
import { createServer } from "node:http";
import { Server } from "socket.io"; // valor real para instância
import type { Socket } from "socket.io"; // apenas tipo
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

    // Entrar na sala / Criar sala
    socket.on("ROOM", (data) => ROOM(socket, io, data));

     // Reentrada em sala
    socket.on("REJOIN_ROOM", async ({ USER, ROOM_CODE }) => {
        try {
            if (!USER || !ROOM_CODE) return;
    
            socket.data.USER = USER;
            socket.data.ROOM_CODE = ROOM_CODE;
            socket.join(ROOM_CODE);

            io.in(ROOM_CODE).emit("UPDATE_ROOM", {
                TYPE: "REJOIN",
                PLAYER: USER,
            });

            logger.info(`👋 Player ${colors.green(USER.NAME)} rejoined room ${colors.cyan(ROOM_CODE)}.`);
        } catch (err) {
            logger.error(`Error on rejoin_room: ${err}`);
        }
    });

    // Sair da sala
    socket.on("LEAVE_ROOM", (data) => LEAVE_ROOM(socket, io, data));

    // Desconexão
    socket.on("disconnect", async () => {
        logger.info(`Client disconnected: ${socket.id}`);

        const USER = socket.data.USER;
        const ROOM_CODE = socket.data.ROOM_CODE;

        if (USER && ROOM_CODE) {
            try {
                await LEAVE_ROOM(socket, io, { USER, ROOM_CODE }).catch(err =>
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
