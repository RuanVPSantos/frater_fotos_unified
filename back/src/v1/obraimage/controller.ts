
import ObraImageServices from "./service";
import ObraImageModel from "./model";
import { ObraImageInterface, ObraImageInput, ObraImageUpdateInput } from "./interface";
import { getPrismaPrincipal } from "../utils/prisma.clients";

const modelService = new ObraImageServices(new ObraImageModel(getPrismaPrincipal()));

export default class ObraImageController {
    async getAllObraImages(): Promise<ObraImageInterface[]> {
        return await modelService.getAllObraImages();
    }

    async getRandomObraImages(): Promise<ObraImageInterface> {
        return await modelService.getRandomObraImages();
    }

    async getObraImageById(id: number): Promise<ObraImageInterface> {
        return await modelService.getObraImageById(id);
    }

    async createObraImage(data: ObraImageInput): Promise<ObraImageInterface> {
        return await modelService.createObraImage(data);
    }

    async updateObraImage(id: number, data: ObraImageUpdateInput): Promise<ObraImageInterface> {
        return await modelService.updateObraImage(id, data);
    }

    async deleteObraImage(id: number): Promise<ObraImageInterface> {
        return await modelService.deleteObraImage(id);
    }
}