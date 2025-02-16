import type { UploadedFile } from './file.dts';

export abstract class FileStorageRepository {
    public abstract upload(file: Blob): Promise<UploadedFile>;
    public abstract findById(id: string): Promise<UploadedFile | null>;
}
