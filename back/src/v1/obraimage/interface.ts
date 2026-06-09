export interface ObraImageInterface {
    id: number;
    obraId: number;
    imageUrl: string;
    description?: string;
    obra?: {
        id: number;
        name: string;
    };
}

export interface ObraImageInput {
    obraId: number;
    image: {
        buffer: Buffer;
        mimetype: string;
        originalname: string;
    };
}

// Interface para o modelo criar no banco
export interface ObraImageCreateInput {
    obraId: number;
    imageUrl: string;
}

export interface ObraImageUpdateInput {
    obraId?: number;
    imageUrl?: string;
    description?: string;
}