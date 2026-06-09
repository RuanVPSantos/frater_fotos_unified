export interface ObraInterface {
    id: number;
    name: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    location: string;
    ObraImages?: ObraImageInterface[];
}

export interface ObraImageInterface {
    id: number;
    obraId: number;
    imageUrl: string;
    description?: string;
}


export interface ObraInput {
    name: string;
    description: string;
    location: string;
}

export interface ObraUpdateInput {
    name?: string;
    description?: string;
    location?: string;
}