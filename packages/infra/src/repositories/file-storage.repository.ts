import crypto from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { FileStorageRepository, type UploadedFile } from '@quiz/core';

import { env } from '../lib/env';

export class S3FileStorageRepository extends FileStorageRepository {
    private s3: S3Client;

    constructor() {
        super();

        this.s3 = new S3Client({
            region: env('S3_REGION_NAME'),
        });
    }

    public async upload(file: Blob): Promise<UploadedFile> {
        const key = `i/${crypto.randomUUID()}`;

        const command = new PutObjectCommand({
            Bucket: env('AVATARS_BUCKET_NAME'),
            Key: key,
            Body: Buffer.from(await file.arrayBuffer()),
            ContentType: file.type,
        });

        await this.s3.send(command);

        return {
            id: key,
            url: this.getUrl(key),
        };
    }

    public async findById(id: string): Promise<UploadedFile | null> {
        return {
            id,
            url: this.getUrl(id),
        };
    }

    private getUrl(avatarId: string): string {
        const cdnUrl = env('AVATARS_CDN_URL');

        return new URL(avatarId, cdnUrl).toString();
    }
}
