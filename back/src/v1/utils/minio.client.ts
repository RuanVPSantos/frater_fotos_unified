import { Client } from 'minio';

class MinioClient {
    private client: Client;

    constructor() {
        this.client = new Client({
            endPoint: process.env.MINIO_ENDPOINT,
            port: Number(process.env.MINIO_PORT),
            useSSL: false,
            accessKey: process.env.MINIO_ACCESS_KEY,
            secretKey: process.env.MINIO_SECRET_KEY
        });
    }

    async bucketExists(bucketName: string) {
        try {
            const exists = await this.client.bucketExists(bucketName);
            return exists;
        } catch (err) {
            console.error('Error checking bucket existence:', err);
            return false;
        }
    }

    async makeBucket(bucketName: string) {
        try {
            await this.client.makeBucket(bucketName);
        } catch (err) {
            console.error('Error creating bucket:', err);
        }
    }

    async uploadFile(bucketName: string, fileName: string, buffer: Buffer, mimetype: string) {
        try {
            await this.client.putObject(
                bucketName,
                fileName,
                buffer,
                buffer.length,
                {
                    'Content-Type': mimetype
                }
            );
        } catch (err) {
            console.error('Error uploading file:', err);
        }
    }

    async downloadFile(bucketName: string, fileName: string) {
        try {
            const stream = await this.client.getObject(bucketName, fileName);
            return stream;
        } catch (err) {
            console.error('Error downloading file:', err);
            throw err;
        }
    }

    async removeFile(bucketName: string, fileName: string) {
        try {
            await this.client.removeObject(bucketName, fileName);
        } catch (err) {
            console.error('Error removing file:', err);
        }
    }
}

export default MinioClient;

