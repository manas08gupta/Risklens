const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export async function withRetry(operation, { retries = 2, baseDelayMs = 650, shouldRetry } = {}) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await operation(attempt);
    } catch (error) {
      lastError = error;
      const retryable = shouldRetry ? shouldRetry(error) : true;
      if (!retryable || attempt === retries) break;
      await sleep(baseDelayMs * 2 ** attempt);
    }
  }

  throw lastError;
}
