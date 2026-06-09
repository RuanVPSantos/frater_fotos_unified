import ObraImageModel from './model';
import { ObraImageInterface, ObraImageInput, ObraImageUpdateInput, ObraImageCreateInput } from './interface';
import MinioClient from '../utils/minio.client';
import { v4 as uuidv4 } from 'uuid';

export default class ObraImageServices {
    private model: ObraImageModel;
    private bucketName: string;
    private minioClient: MinioClient;

    constructor(model: ObraImageModel) {
        this.model = model;
        this.bucketName = process.env.MINIO_BUCKET_NAME || 'frater-apresentacao-imagens';
        this.minioClient = new MinioClient();
    }

    async getAllObraImages(): Promise<ObraImageInterface[]> {
        try {
            return await this.model.getObraImages();
        } catch (error) {
            throw error;
        }
    }
    async getRandomObraImages(): Promise<ObraImageInterface> {
        try {
            const obraImages = await this.model.getObraImages();
            const length = obraImages.length;
            const randomIndex = Math.floor(Math.random() * length);
            const randomObraImage = obraImages[randomIndex];
            const imageUrl = `${process.env.API_BASE_URL || 'http://localhost:3003'}/obraimage/image/${randomObraImage.imageUrl}`;
            return { ...randomObraImage, imageUrl };
        } catch (error) {
            throw error;
        }
    }
    async getObraImageById(id: number): Promise<ObraImageInterface> {
        try {
            const obraImage = await this.model.getObraImageById(id);
            const imageUrl = `${process.env.API_BASE_URL || 'http://localhost:3003'}/obraimage/image/${obraImage.imageUrl}`;
            return { ...obraImage, imageUrl };
        } catch (error) {
            throw error;
        }
    }

    async createObraImage(data: ObraImageInput): Promise<ObraImageInterface> {
        try {
            const fileExtension = data.image.originalname.split('.').pop();
            const fileName = `${uuidv4()}.${fileExtension}`;

            if (!await this.minioClient.bucketExists(this.bucketName)) {
                await this.minioClient.makeBucket(this.bucketName);
            }

            await this.minioClient.uploadFile(this.bucketName, fileName, data.image.buffer, data.image.mimetype);

            const imageData: ObraImageCreateInput = {
                obraId: data.obraId,
                imageUrl: fileName,
            };

            return await this.model.createObraImage(imageData);
        } catch (error) {
            throw error;
        }
    }

    async updateObraImage(id: number, data: ObraImageUpdateInput): Promise<ObraImageInterface> {
        try {
            return await this.model.updateObraImage(id, data);
        } catch (error) {
            throw error;
        }
    }

    async deleteObraImage(id: number): Promise<ObraImageInterface> {
        try {
            const obraImage = await this.model.getObraImageById(id);
            await this.minioClient.removeFile(this.bucketName, obraImage.imageUrl);
            return await this.model.deleteObraImage(id);
        } catch (error) {
            throw error;
        }
    }
}