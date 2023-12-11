export interface DatabaseAdapter {
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getFirst<T = any>(entity: string): Promise<T>;
  getById<T = any>(entity: string, id: number | string): Promise<T>;
  getAll<T = any>(entity: string): Promise<T>;
  create<T = any>(entity: string, data: UpsertData): Promise<T>;
  update<T = any>(entity: string, id: number | string, data: UpsertData): Promise<T>;
  delete<T = any>(entity: string, id: number | string): Promise<T>;
  raw<T = any>(options: any): Promise<T>;

  registerCreateMiddleware(middleware: ((entity: string, data: UpsertData) => void)): void;
  registerUpdateMiddleware(middleware: ((entity: string, id: string | number, data: UpsertData) => void)): void;
  registerDeleteMiddleware(middleware: ((entity: string, id: string | number) => void)): void;
}

export type UpsertData = Record<string, string | number | boolean>