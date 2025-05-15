import { Model, Document } from "mongoose";

abstract class BaseRepository<T extends Document, ID = string> {
  protected model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  async save(entity: Partial<T>): Promise<T> {
    return this.model.create(entity);
  }

  async findById(id: ID): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  async findOne(filter: Partial<Record<keyof T, any>>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  async findAll(): Promise<T[]> {
    return this.model.find().exec();
  }

  async findByIdAndUpdate(id: ID, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data, { new: true }).exec();
  }
}

export default BaseRepository;
