type PaginationKey = Record<string, unknown> | undefined;

export async function paginate(
    load: (key: PaginationKey) => Promise<{ Items?: unknown[]; LastEvaluatedKey?: PaginationKey }>
): Promise<unknown[]> {
    const items: unknown[] = [];
    let lastKey: PaginationKey = undefined;

    do {
        const res = await load(lastKey);
        items.push(...(res.Items ?? []));
        lastKey = res.LastEvaluatedKey;
    } while (lastKey);

    return items;
}
