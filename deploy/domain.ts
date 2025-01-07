const domainNames: Record<string, string> = {
    $default: `infra-quiz.${$app.stage}.dev.nodge.me`,
    production: 'infra-quiz.nodge.me',
};

export const domainName = domainNames[$app.stage] || domainNames.$default;
export const dns = sst.cloudflare.dns();
