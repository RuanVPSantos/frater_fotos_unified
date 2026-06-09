import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { checkLogin } from '../utils/check.login';
import { ObraImageInputSchemaJson, ObraImageUpdateInputSchemaJson } from './schemas';
import { ObraImageInput, ObraImageUpdateInput } from './interface';
import ObraImageController from './controller';
import MinioClient from '../utils/minio.client';

const modelController = new ObraImageController();
const minioClient = new MinioClient();
const bucketName = process.env.MINIO_BUCKET_NAME || 'frater-apresentacao-imagens';

async function ObraImageRouter(fastify: FastifyInstance) {
    // Endpoint para servir imagens
    fastify.get('/image/:filename',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { filename } = request.params as { filename: string };
                const imageStream = await minioClient.downloadFile(bucketName, filename);
                
                // Define o content-type baseado na extensão do arquivo
                const extension = filename.split('.').pop()?.toLowerCase();
                let contentType = 'application/octet-stream';
                
                switch (extension) {
                    case 'jpg':
                    case 'jpeg':
                        contentType = 'image/jpeg';
                        break;
                    case 'png':
                        contentType = 'image/png';
                        break;
                    case 'gif':
                        contentType = 'image/gif';
                        break;
                    case 'webp':
                        contentType = 'image/webp';
                        break;
                }
                
                reply.type(contentType);
                return reply.send(imageStream);
            } catch (error) {
                console.error('Error serving image:', error);
                return reply.status(404).send({ message: 'Image not found' });
            }
        }
    );
    fastify.get('/all',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const models = await modelController.getAllObraImages();
                return reply.status(200).send(models);
            } catch (error) {
                console.error('Error fetching models:', error);
                return reply.status(500).send({ message: 'Internal server error' });
            }
        }
    );

    fastify.get('/random',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const models = await modelController.getRandomObraImages();
                return reply.status(200).send(models);
            } catch (error) {
                console.error('Error fetching models:', error);
                return reply.status(500).send({ message: 'Internal server error' });
            }
        }
    );

    fastify.get('/:id',
        {
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                    },
                    required: ['id'],
                },
            },
        },
        async (request, reply) => {
            try {
                const { id } = request.params as { id: string };
                const model = await modelController.getObraImageById(parseInt(id, 10));
                return reply.status(200).send(model);
            } catch (error) {
                console.error('Error fetching model:', error);
                return reply.status(500).send({ message: 'Internal server error' });
            }
        }
    );

    fastify.post('/:obraId',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const { obraId } = request.params as { obraId: string };
                const data = await request.file();
                if (!data) {
                    return reply.status(400).send({ message: 'No file uploaded' });
                }


                // Verifica se o campo obraId existe
                if (!obraId) {
                    return reply.status(400).send({ message: 'obraId is required' });
                }

                const body = {
                    obraId: parseInt(obraId),
                    image: {
                        buffer: await data.toBuffer(),
                        mimetype: data.mimetype,
                        originalname: data.filename
                    }
                };

                const result = await modelController.createObraImage(body);
                return reply.status(201).send(result);
            } catch (error) {
                console.error('Error creating obra image:', error);
                return reply.status(500).send({ error: error.message });
            }
        });

    fastify.put('/:id',
        {
            schema: {
                body: ObraImageUpdateInputSchemaJson,
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                    },
                    required: ['id'],
                },
            },
        },
        async (request, reply) => {
            try {
                const { id } = request.params as { id: string };
                const data = request.body as ObraImageUpdateInput;
                const model = await modelController.updateObraImage(parseInt(id, 10), data);
                return reply.status(200).send(model);
            } catch (error) {
                console.error('Error updating model:', error);
                return reply.status(500).send({ message: 'Internal server error' });
            }
        }
    );

    fastify.delete('/:id',
        {
            schema: {
                params: {
                    type: 'object',
                    properties: {
                        id: { type: 'string' },
                    },
                    required: ['id'],
                },
            },
        },
        async (request, reply) => {
            try {
                const { id } = request.params as { id: string };
                const model = await modelController.deleteObraImage(parseInt(id, 10));
                return reply.status(200).send(model);
            } catch (error) {
                console.error('Error deleting model:', error);
                return reply.status(500).send({ message: 'Internal server error' });
            }
        }
    );
}

export default ObraImageRouter;