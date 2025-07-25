import mongoose, { QueryOptions, UpdateQuery } from 'mongoose';
import { IJobsSelectRequest } from '@/interfaces/IJobsSelectRequest';
import { MongoConnection } from '@/backend/lib/dbConnect';
import { IJob } from '@/backend/models/IJob';
import { Job } from '@/backend/models/Job';
import { DatabaseConnectionError } from '@/backend/lib/errors/DatabaseError';
import { CountDislikedJobsError, CountLikedJobsError, CountUnratedJobsError, CreateJobError, DeleteJobError, GetAllJobsError, GetJobByIdError, UpdateJobError } from './errors/JobRepositoryError';
import { IJobEntity } from '@/types/IJobEntity';
import { JobSanitizer } from '../models/JobSanitizer';
import { IMongoDbParams } from '../interfaces/IMongoDbParams';

/**
 * Repository for Job model CRUD operations.
 * Implements Singleton pattern to ensure a unique instance.
 */
export class JobRepository {
  // Holds the singleton instance
  private static instance: JobRepository | null = null;
  private mongoConnection: MongoConnection | null = null;
  private connection: typeof mongoose | null = null;
  private dbUri: string;

  // Private constructor to prevent direct instantiation
  private constructor({ dbUri }: IMongoDbParams) {
    if (!dbUri) throw new DatabaseConnectionError('Database URI is required to create JobRepository instance.');
    this.dbUri = dbUri;
    this.mongoConnection = MongoConnection.getInstance({ uri: dbUri });
  }

  /**
   * Retrieves the singleton instance.
   */
  public static getInstance({ dbUri }: IMongoDbParams): JobRepository {
    if (JobRepository.instance === null) {
      if (!dbUri) throw new DatabaseConnectionError('Database URI is required to create JobRepository instance.');
      JobRepository.instance = new JobRepository({ dbUri });
    }
    return JobRepository.instance;
  }

  private async connect(): Promise<boolean> {
    if (!this.connection) {
      if (!this.dbUri) throw new DatabaseConnectionError('Database URI is required.');
      try {
        if (!this.mongoConnection) this.mongoConnection = MongoConnection.getInstance({ uri: this.dbUri });
        this.connection = await this.mongoConnection.connect();
      } catch (error) {
        throw new DatabaseConnectionError(String(error));
      }
    }
    return true;
  }

  /**
   * Count jobs without like and dislike.
   */
  public async countUnratedJobs(): Promise<number> {
    if (!this.connection) await this.connect();
    
    let data = null;
    try {
      data = Job.countDocuments({ preference: null })
    } catch (error) {
      throw new CountUnratedJobsError(String(error));
    }
    if (!data) throw new CountUnratedJobsError('No data found.');
    return data;
  }

  /**
   * Count jobs with like.
   */
  public async countLikedJobs(): Promise<number> {
    if (!this.connection) await this.connect();

    let data = null;
    try {
      data = Job.countDocuments({ preference: 'like' })
    } catch (error) {
      throw new CountLikedJobsError(String(error));
    }
    if (!data) throw new CountLikedJobsError('No data found.');
    return data;
  }

  /**
   * Count jobs with dislike.
   */
  public async countDislikedJobs(): Promise<number> {
    if (!this.connection) await this.connect();

    let data = null;
    try {
      data = Job.countDocuments({ preference: 'dislike' })
    } catch (error) {
      throw new CountDislikedJobsError(String(error));
    }
    if (!data) throw new CountDislikedJobsError('No data found.');
    return data;
  }

  /**
   * Retrieves all jobs matching the optional filter.
   * @param filter - Mongoose filter query
   */
  public async getAll({ filter, limit, skip }: IJobsSelectRequest): Promise<IJob[]> {
    if (!this.connection) await this.connect();
    
    let data: IJob[] = [];
    try {
      const findFilter: mongoose.FilterQuery<IJobEntity> = filter ? filter : {};
      const query = Job.find(findFilter).sort({ date: -1 });
      if (limit) query.limit(limit);
      if (skip) query.skip(skip);
      const response = await query.exec();
      if (response && response.length > 0) {
        data = response;
      }
    } catch (error) {
      throw new GetAllJobsError(String(error));
    }
    return data;
  }

  /**
   * Retrieves a job by its ID.
   * @param id - Job document ID
   */
  public async getById(id: string): Promise<IJob | null> {
    if (!this.connection) await this.connect();

    try {
      return Job.findById(id).exec();
    } catch (error) {
      throw new GetJobByIdError(String(error));
    }
  }

  /**
   * Creates a new job document.
   * @param data - Partial job data
   */
  public async create(data: Partial<IJob>): Promise<IJob> {
    if (!this.connection) await this.connect();

    try {
      const sanitizedData = JobSanitizer.sanitize(data);
      const newJob = new Job(sanitizedData);

      // Validate the job before saving
      const validationError = newJob.validateSync();
      if (validationError) throw new CreateJobError(`Validation failed: ${validationError.message}`);

      return newJob.save();
    } catch (error) {
      throw new CreateJobError(String(error));
    }
  }

  /**
   * Updates an existing job by ID.
   * @param id - Job document ID
   * @param data - Fields to update
   */
  public async update(id: string, data: UpdateQuery<IJob>): Promise<IJob | null> {
    if (!this.connection) await this.connect();
    
    try {
      const objectId = new mongoose.Types.ObjectId(id);
      const filter = { _id: objectId };
      const option: QueryOptions<IJob> = { new: true, runValidators: true };
      const sanitizedData = JobSanitizer.partialSanitize(data);
      return Job.findByIdAndUpdate(filter, sanitizedData, option).exec();
    } catch (error) {
      throw new UpdateJobError(String(error));
    }
  }

  /**
   * Deletes a job document by ID.
   * @param id - Job document ID
   */
  public async delete(id: string): Promise<IJob | null> {
    if (!this.connection) await this.connect();

    try {
      return Job.findByIdAndDelete(id).exec();
    } catch (error) {
      throw new DeleteJobError(`Delete has failed: ${String(error)}`);
    }
  }

  /**
   * Destroys the singleton instance.
   */
  public async destroy(): Promise<void> {
    if (this.connection) await this.connection.disconnect();
    JobRepository.instance = null;
  }
}
