export const avatarsBucket = new sst.aws.Bucket('Avatars', {
    access: 'cloudfront',
});

const router = new sst.aws.Router('AvatarsCDN', {
    routes: {
        '/*': {
            bucket: avatarsBucket,
        },
    },
});

export const avatarsCdnUrl = router.url;
