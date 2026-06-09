import ObraModel from './model';
import { ObraInterface, ObraInput, ObraUpdateInput } from './interface';
import MinioClient from '../utils/minio.client';

export default class ObraServices {
    private model: ObraModel;
    private bucketName: string;
    private minioClient: MinioClient;

    constructor(model: ObraModel) {
        this.model = model;
        this.bucketName = process.env.MINIO_BUCKET_NAME || 'frater-apresentacao-imagens';
        this.minioClient = new MinioClient();
    }

    async getAllObras(): Promise<ObraInterface[]> {
        try {
            return await this.model.getObras();
        } catch (error) {
            throw error;
        }
    }

    async getObraById(id: number): Promise<ObraInterface> {
        try {
            const obra = await this.model.getObraById(id);
            for (const obraImage of obra.ObraImages) {
                const imageUrl = await this.minioClient.downloadFile(this.bucketName, obraImage.imageUrl);
                obraImage.imageUrl = imageUrl;
            }
            return obra;
        } catch (error) {
            throw error;
        }
    }

    async createObra(data: ObraInput): Promise<ObraInterface> {
        try {
            return await this.model.createObra(data);
        } catch (error) {
            throw error;
        }
    }

    async updateObra(id: number, data: ObraUpdateInput): Promise<ObraInterface> {
        try {
            return await this.model.updateObra(id, data);
        } catch (error) {
            throw error;
        }
    }

    async deleteObra(id: number): Promise<ObraInterface> {
        try {
            return await this.model.deleteObra(id);
        } catch (error) {
            throw error;
        }
    }
}