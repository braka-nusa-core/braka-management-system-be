export type ClientStatus = "active" | "inactive" | "prospect";

export interface CreateClientInput {
    name: string;
    picName: string;
    email: string;
    phone: string;
    address: string;
    notes?: string;
    status?: ClientStatus;
}

export interface UpdateClientInput {
    name?: string;
    picName?: string;
    email?: string;
    phone?: string;
    address?: string;
    notes?: string;
    status?: ClientStatus;
}

export interface ClientQuery {
    search?: string;
    status?: ClientStatus;
    page?: string;
    limit?: string;
}