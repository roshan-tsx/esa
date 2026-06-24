const DAY_MS = 24 * 60 * 60 * 1000;
const WEEK_MS = 7 * DAY_MS;
const FREE_DAILY_APPLICATION_LIMIT = 3;
const DAILY_SCORE_AMOUNT = 100;

export function utcDateString(timestamp = Date.now()): string {
	return new Date(timestamp).toISOString().slice(0, 10);
}

export function startOfUtcDay(timestamp = Date.now()): number {
	const date = utcDateString(timestamp);
	return new Date(`${date}T00:00:00.000Z`).getTime();
}

export { DAY_MS, WEEK_MS, FREE_DAILY_APPLICATION_LIMIT, DAILY_SCORE_AMOUNT };
