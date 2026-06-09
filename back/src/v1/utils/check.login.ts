import { Auth } from "./auth";
import { FastifyRequest, FastifyReply } from 'fastify';

declare module 'fastify' {
    interface FastifyRequest {
        user?: { id: string };
    }
}

export const checkLogin = async (req: FastifyRequest, reply: FastifyReply) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
            return reply.status(401).send({ message: 'Authorization token is missing' });
        }

        const { id } = await Auth.verifyToken(token);

        req.user = { id };
    } catch (error) {
        return reply.status(401).send({ message: 'Invalid token' });
    }
};