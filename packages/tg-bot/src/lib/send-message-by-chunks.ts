const MESSAGE_LENGTH_LIMIT = 4096;

export async function sendMessageByChunks(
    messageChunks: string[],
    joinWith: string,
    send: (chunk: string) => Promise<void>
) {
    const chunks: string[][] = [];
    let currentChunk: string[] = [];
    let currentLength = 0;

    for (const message of messageChunks) {
        if (currentLength + message.length > MESSAGE_LENGTH_LIMIT && currentChunk.length > 0) {
            chunks.push(currentChunk);
            currentChunk = [];
            currentLength = 0;
        }

        currentChunk.push(message);
        currentLength += message.length;
        currentLength += joinWith.length;
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk);
    }

    for (const chunk of chunks) {
        await send(chunk.join(joinWith));
    }
}
