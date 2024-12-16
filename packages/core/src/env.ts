type EnvVariable = 'S3_REGION_NAME' | 'AVATARS_CDN_URL' | 'AVATARS_BUCKET_NAME';

export function env(name: EnvVariable) {
    const value = process.env[name];
    if (!value) {
        throw new Error(`Missing ENV variable: ${name}`);
    }
    return value;
}
