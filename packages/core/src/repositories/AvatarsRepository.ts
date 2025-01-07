import crypto from 'node:crypto';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

import { env } from '../lib/env';

export class AvatarsRepository {
    private s3: S3Client;

    constructor() {
        this.s3 = new S3Client({
            region: env('S3_REGION_NAME'),
        });
    }

    public async upload(file: Blob): Promise<string> {
        const key = `i/${crypto.randomUUID()}`;

        const command = new PutObjectCommand({
            Bucket: env('AVATARS_BUCKET_NAME'),
            Key: key,
            Body: Buffer.from(await file.arrayBuffer()),
            ContentType: file.type,
        });

        await this.s3.send(command);

        return key;
    }

    public async getUrl(avatarId: string): Promise<string> {
        const cdnUrl = env('AVATARS_CDN_URL');

        return new URL(avatarId, cdnUrl).toString();
    }
}
