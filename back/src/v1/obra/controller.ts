
import ObraServices from "./service";
import ObraModel from "./model";
import { ObraInterface, ObraInput, ObraUpdateInput } from "./interface";
import { getPrismaPrincipal } from "../utils/prisma.clients";

const modelService = new ObraServices(new ObraModel(getPrismaPrincipal()));

export default class ObraController {
    async getAllObras(): Promise<ObraInterface[]> {
        return await modelService.getAllObras();
    }
    async getObraById(id: number): Promise<ObraInterface> {
        return await modelService.getObraById(id);
    }

    async createObra(data: ObraInput): Promise<ObraInterface> {
        return await modelService.createObra(data);
    }

    async updateObra(id: number, data: ObraUpdateInput): Promise<ObraInterface> {
        return await modelService.updateObra(id, data);
    }

    async deleteObra(id: number): Promise<ObraInterface> {
        return await modelService.deleteObra(id);
    }
}