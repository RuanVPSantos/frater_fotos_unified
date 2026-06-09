import { PrismaClient } from "@prisma/client";
import { ObraImageInterface, ObraImageInput, ObraImageUpdateInput, ObraImageCreateInput } from "./interface";

export default class ObraImageModel {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    async createObraImage(data: ObraImageCreateInput): Promise<ObraImageInterface> {
        try {
            return await this.prisma.obraImage.create({
                data
            });
        } catch (error) {
            throw error;
        }
    }

    async getObraImages(): Promise<ObraImageInterface[]> {
        return await this.prisma.obraImage.findMany({
            include: {
                obra: true
            }
        });
    }

    async getObraImageById(id: number): Promise<ObraImageInterface> {
        return await this.prisma.obraImage.findUniqueOrThrow({ where: { id } });
    }

    async updateObraImage(id: number, data: ObraImageUpdateInput): Promise<ObraImageInterface> {
        return await this.prisma.obraImage.update({ where: { id }, data });
    }

    async deleteObraImage(id: number): Promise<ObraImageInterface> {
        return await this.prisma.obraImage.delete({ where: { id } });
    }
}