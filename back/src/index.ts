import Fastify from 'fastify';
import cors from '@fastify/cors';
import routes from './v1/routes';
import multipart from '@fastify/multipart';

const app = Fastify({ logger: true });

const setupCors = () => {
    app.register(cors, {
        origin: '*',
    });
};

const setupHealthCheck = () => {
    app.get('/health', async (request, reply) => {
        return 'System online!';
    });
};

setupCors();
setupHealthCheck();

app.register(multipart, {
    limits: {
        fileSize: 1024 * 1024 * 30, // 30mb
    },
});

routes.forEach(({ router, prefix }) => {
    app.register(router, { prefix });
});

const PORT = Number(process.env.PORT) || 3003;

app.listen({ host: '0.0.0.0', port: PORT }, (err, address) => {
    if (err) {
        app.log.error(err);
        process.exit(1);
    }
});