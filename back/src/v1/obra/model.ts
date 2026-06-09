
import { PrismaClient } from "@prisma/client";
import { ObraInterface, ObraInput, ObraUpdateInput } from "./interface";

export default class ObraModel {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createObra(data: ObraInput): Promise<ObraInterface> {
        return await this.prisma.obra.create({ data });
    }

    async getObras(): Promise<ObraInterface[]> {
        return await this.prisma.obra.findMany();
    }

    async getObraById(id: number): Promise<ObraInterface> {
        return await this.prisma.obra.findUniqueOrThrow({ where: { id }, include: { ObraImages: true } });
    }

    async updateObra(id: number, data: ObraUpdateInput): Promise<ObraInterface> {
        return await this.prisma.obra.update({ where: { id }, data });
    }

    async deleteObra(id: number): Promise<ObraInterface> {
        return await this.prisma.obra.delete({ where: { id } });
    }
}