import { Document } from "mongoose";

interface IBaseRepository<T extends Document, ID = string> {
  save(entity: Partial<T>): Promise<T>;
  findById(id: ID): Promise<T | null>;
  findOne(filter: Partial<Record<keyof T, any>>): Promise<T | null>;
  findAll(): Promise<T[]>;
  findByIdAndUpdate(id: ID, data: Partial<T>): Promise<T | null>;
}

export { IBaseRepository };
