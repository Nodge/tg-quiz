import { domainName, dns } from './domain';

export const email = new sst.aws.Email('Email', {
    sender: domainName,
    dns,
    dmarc: 'v=DMARC1; p=quarantine; adkim=s; aspf=s;',
});
