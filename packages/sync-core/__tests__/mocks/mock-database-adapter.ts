import {DatabaseAdapter, EntitySchema, UpsertData, WasDeleted} from "../../src/interfaces/database-adapter";

export class MockDatabaseAdapter implements DatabaseAdapter{
    connect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    create(entity: string, data: UpsertData): Promise<void> {
        return Promise.resolve(undefined);
    }

    createEntity(entity: string, schema: EntitySchema): Promise<void> {
        return Promise.resolve(undefined);
    }

    delete(entity: string, id: number | string): Promise<WasDeleted> {
        return Promise.resolve(undefined);
    }

    deleteByField(entity: string, mapping: Record<string, any>): Promise<WasDeleted> {
        return Promise.resolve(undefined);
    }

    disconnect(): Promise<void> {
        return Promise.resolve(undefined);
    }

    getAll<T = any>(entity: string): Promise<T> {
        return Promise.resolve(undefined);
    }

    getAllByField<T = any>(entity: string, mapping: Record<string, any>): Promise<T> {
        return Promise.resolve(undefined);
    }

    getByField<T = any>(entity: string, mapping: Record<string, any>): Promise<T> {
        return Promise.resolve(undefined);
    }

    getById<T = any>(entity: string, id: number | string): Promise<T> {
        return Promise.resolve(undefined);
    }

    getFirst<T = any>(entity: string): Promise<T> {
        return Promise.resolve(undefined);
    }

    raw<T = any>(options: any): Promise<T> {
        return Promise.resolve(undefined);
    }

    registerCreateMiddleware(middleware: (entity: string, data: UpsertData) => void): void {
    }

    registerDeleteMiddleware(middleware: (entity: string, id: (string | number)) => void): void {
    }

    registerUpdateMiddleware(middleware: (entity: string, id: (string | number), data: UpsertData) => void): void {
    }

    update(entity: string, id: number | string, data: UpsertData): Promise<void> {
        return Promise.resolve(undefined);
    }

}