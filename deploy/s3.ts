export const avatarsBucket = new sst.aws.Bucket('Avatars', {
    public: true,
});

const region = aws.getRegionOutput().name;
const s3Host = $interpolate`${avatarsBucket.name}.s3.${region}.amazonaws.com`;

const router = new sst.aws.Router('AvatarsCDN', {
    routes: {
        '/*': $interpolate`https://${s3Host}`,
    },
});

export const avatarsCdnUrl = router.url;
