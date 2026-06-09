import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const ObraSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    createdAt: z.date(),
    updatedAt: z.date(),
    location: z.string(),
});

const ObraInputSchema = z.object({
    name: z.string(),
    description: z.string(),
    location: z.string(),
});

const ObraUpdateInputSchema = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    location: z.string().optional(),
});

const ObraInputSchemaJson = zodToJsonSchema(ObraInputSchema);
const ObraUpdateInputSchemaJson = zodToJsonSchema(ObraUpdateInputSchema);

export {
    ObraInputSchema,
    ObraUpdateInputSchema,
    ObraInputSchemaJson,
    ObraUpdateInputSchemaJson
};