
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { ObraInputSchemaJson, ObraUpdateInputSchemaJson } from './schemas';
import { ObraInput, ObraUpdateInput } from './interface';
import ObraController from './controller';

const modelController = new ObraController();

async function ObraRouter(fastify: FastifyInstance) {
    fastify.get('/all',
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const models = await modelController.getAllObras();
                return reply.status(200).send(models);
            } catch (error) {
                console.error('Error fetching models:', error);
                return reply.status(500).send({ message: 'Internal server error' });
            }
        }
    );

    fastify.get('/:id',
        async (request, reply) => {
            try {
                const { id } = request.params as { id: string };
                const model = await modelController.getObraById(parseInt(id, 10));
                return reply.status(200).send(model);
            } catch (error) {
                console.error('Error fetching model:', error);
                return reply.status(500).send({ message: 'Internal server error' });
            }
        }
    );

    fastify.post('/',
        {
            schema: {
                body: ObraInputSchemaJson,
            },
        },
        async (request: FastifyRequest, reply: FastifyReply) => {
            try {
                const data = request.body as ObraInput;
                const model = await modelController.createObra(data);
                return reply.status(200).send(model);
            } catch (error) {
                console.error('Error creating model:', error);
                return reply.status(500).send({ message: 'Internal server error' });
            }
        }
    );

    fastify.put('/:id',
        {
            schema: {
                body: ObraUpdateInputSchemaJson,
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
                const data = request.body as ObraUpdateInput;
                const model = await modelController.updateObra(parseInt(id, 10), data);
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
                const model = await modelController.deleteObra(parseInt(id, 10));
                return reply.status(200).send(model);
            } catch (error) {
                console.error('Error deleting model:', error);
                return reply.status(500).send({ message: 'Internal server error' });
            }
        }
    );
}

export default ObraRouter;