import type { UploadedFile } from '../entities/UploadedFile';

export interface FileStorageRepository {
    upload(file: Blob): Promise<UploadedFile>;
    findById(id: string): Promise<UploadedFile | null>;
}
