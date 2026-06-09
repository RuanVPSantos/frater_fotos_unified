import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const ObraImageSchema = z.object({
    id: z.number(),
    obraId: z.number(),
    imageUrl: z.string(),
});


const ObraImageInputSchema = z.object({
    obraId: z.number(),
    description: z.string().optional(),
    image: z.any(),
});

const ObraImageUpdateInputSchema = z.object({
    obraId: z.number().optional(),
    imageUrl: z.string().optional(),
});

const ObraImageInputSchemaJson = zodToJsonSchema(ObraImageInputSchema);
const ObraImageUpdateInputSchemaJson = zodToJsonSchema(ObraImageUpdateInputSchema);

export {
    ObraImageInputSchema,
    ObraImageUpdateInputSchema,
    ObraImageInputSchemaJson,
    ObraImageUpdateInputSchemaJson
};