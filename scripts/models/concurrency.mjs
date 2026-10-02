export async function mapLimit(values, limit, worker) {
  const result = new Array(values.length);
  let next = 0;
  await Promise.all(
    Array.from({ length: Math.min(limit, values.length) }, async () => {
      while (next < values.length) {
        const index = next++;
        result[index] = await worker(values[index], index);
      }
    }),
  );
  return result;
}
