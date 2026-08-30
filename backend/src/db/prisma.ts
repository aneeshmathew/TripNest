// Single shared PrismaClient instance. Creating a new PrismaClient per
// request (or per module import, without this pattern) exhausts Postgres
// connections under load / hot-reload.
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient();
