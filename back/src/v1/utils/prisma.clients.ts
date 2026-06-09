import { PrismaClient } from "@prisma/client";

let prismaPrincipal: PrismaClient | null = null;

export function getPrismaPrincipal(): PrismaClient {
    if (!prismaPrincipal) {
        prismaPrincipal = new PrismaClient();
    }
    return prismaPrincipal;
}
