import { SESv2Client, SendEmailCommand } from '@aws-sdk/client-sesv2';
import { Resource } from 'sst';

const client = new SESv2Client();

interface SendEmailOptions {
    to: string | string[];
    subject: string;
    html: string;
    text?: string;
}

async function sendEmail(options: SendEmailOptions) {
    const from = `auth@${Resource.Email.sender}`;
    const { subject, to, html } = options;

    await client.send(
        new SendEmailCommand({
            FromEmailAddress: from,
            Destination: {
                ToAddresses: Array.isArray(to) ? to : [to],
            },
            Content: {
                Simple: {
                    Subject: { Data: subject },
                    Body: {
                        Html: { Data: html },
                        Text: options.text ? { Data: options.text } : undefined,
                    },
                },
            },
        })
    );
}

export async function sendCodeEmail(email: string, code: string) {
    await sendEmail({
        to: email,
        subject: 'Your login code',
        html: `<p>Your verification code is <b>${code}</b>.</p>`,
    });
}
