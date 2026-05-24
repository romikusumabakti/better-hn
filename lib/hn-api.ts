const HN_BASE = "https://hacker-news.firebaseio.com/v0";

export interface HNStory {
	id: number;
	type: "story" | "job" | "ask" | "show" | "poll";
	by: string;
	time: number;
	title: string;
	url?: string;
	score: number;
	descendants?: number;
	kids?: number[];
	text?: string;
	dead?: boolean;
	deleted?: boolean;
}

export interface ScoredStory extends HNStory {
	computedScore: number;
	hoursAgo: number;
	domain?: string;
}

export async function fetchTopStoryIds(limit = 500): Promise<number[]> {
	const res = await fetch(`${HN_BASE}/topstories.json`, {
		next: { revalidate: 60 },
	});
	const ids: number[] = await res.json();
	return ids.slice(0, limit);
}

export async function fetchStory(id: number): Promise<HNStory | null> {
	try {
		const res = await fetch(`${HN_BASE}/item/${id}.json`, {
			next: { revalidate: 120 },
		});
		const story = await res.json();
		if (!story || story.deleted || story.dead || story.type === "comment") {
			return null;
		}
		return story as HNStory;
	} catch {
		return null;
	}
}

export async function fetchStoriesBatch(ids: number[]): Promise<HNStory[]> {
	const results = await Promise.allSettled(ids.map(fetchStory));
	return results
		.filter(
			(r): r is PromiseFulfilledResult<HNStory> =>
				r.status === "fulfilled" && r.value !== null,
		)
		.map((r) => r.value);
}

export function extractDomain(url: string | undefined): string | undefined {
	if (!url) return undefined;
	try {
		const hostname = new URL(url).hostname;
		return hostname.replace(/^www\./, "");
	} catch {
		return undefined;
	}
}

export function computeScore(
	story: HNStory,
	alpha: number,
	nowMs = Date.now(),
): number {
	const hoursAgo = (nowMs / 1000 - story.time) / 3600;
	const points = story.score ?? 0;
	const comments = story.descendants ?? 0;
	return (points + comments) / (hoursAgo + 2) ** alpha;
}

export function scoreStories(stories: HNStory[], alpha: number): ScoredStory[] {
	const now = Date.now();
	return stories.map((s) => ({
		...s,
		computedScore: computeScore(s, alpha, now),
		hoursAgo: (now / 1000 - s.time) / 3600,
		domain: extractDomain(s.url),
	}));
}
