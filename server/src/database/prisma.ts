import { PrismaClient } from "@prisma/client";
import { logger } from "@functions/logger";

const prisma = new PrismaClient();

(async () => {
  await prisma
    .$connect()
    .then(() => {
      return logger.info("Prisma connected to the database");
    })
    .catch((err) => {
      return logger.error(err);
    });
})();

export default prisma;