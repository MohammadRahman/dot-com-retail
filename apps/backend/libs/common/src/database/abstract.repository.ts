/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { Logger, NotFoundException } from '@nestjs/common';
import { AbstractDocument } from './abstract.schema';
import { FilterQuery, HydratedDocument, Model, Query, Types } from 'mongoose';
import { ConfigService } from '@nestjs/config';

export abstract class AbstractRepository<
  TDocument extends AbstractDocument & { name: string },
> {
  protected abstract readonly logger: Logger;
  constructor(
    protected readonly model: Model<TDocument>,
    protected readonly configService: ConfigService,
  ) {}
  async create(
    document: Omit<TDocument, '_id'>,
  ): Promise<HydratedDocument<TDocument>> {
    const createdDocument = {
      ...document,
      _id: new Types.ObjectId(),
    };
    return await this.model.create(createdDocument);
  }
  async bulkCreate(documents: Omit<TDocument, '_id'>[]): Promise<TDocument[]> {
    const results: TDocument[] = [];
    const createdDocuments = documents.map((doc) => ({
      ...doc,
      _id: new Types.ObjectId(),
    }));
    // Process in chunks
    const batchSize =
      this.configService.get<number>('BULK_UPLOAD_BATCH_SIZE') || 5000;
    for (let i = 0; i < documents.length; i += batchSize) {
      const chunk = createdDocuments.slice(i, i + batchSize);

      const docs = await this.model.insertMany(chunk, {
        ordered: false,
      });
      results.push(...docs.map((doc) => doc.toJSON() as unknown as TDocument));
    }
    return results;
  }
  async findOne(
    filterQuery: FilterQuery<TDocument>,
  ): Promise<HydratedDocument<TDocument>> {
    const doc = await this.model.findOne(filterQuery);
    if (!doc) {
      this.logger.warn(
        `document with query ${JSON.stringify(filterQuery)} not found!`,
      );
      throw new NotFoundException('document not found');
    }
    return doc;
  }
  async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
    const docs = await this.model.find(filterQuery);
    return docs.map((doc) => doc.toJSON() as unknown as TDocument);
  }
  findRaw(filterQuery: FilterQuery<TDocument>): Query<TDocument[], TDocument> {
    return this.model.find(filterQuery);
  }

  async delete(filterQuery: FilterQuery<TDocument>): Promise<boolean> {
    const doc = await this.model.findOneAndDelete(filterQuery);
    if (!doc) {
      this.logger.warn(
        `document with query ${JSON.stringify(filterQuery)} not found for deletion!`,
      );
      throw new NotFoundException('document not found');
    }
    return true;
  }

  async update(
    filterQuery: FilterQuery<TDocument>,
    document: Partial<TDocument>,
  ): Promise<HydratedDocument<TDocument>> {
    const doc = await this.model.findOneAndUpdate(filterQuery, document, {
      new: true,
    });
    if (!doc) {
      this.logger.warn(
        `document with query ${JSON.stringify(filterQuery)} not found for update!`,
      );
      throw new NotFoundException('document not found');
    }
    return doc;
  }
  async countDocuments(filterQuery: FilterQuery<TDocument>): Promise<number> {
    return this.model.countDocuments(filterQuery).exec();
  }
}
