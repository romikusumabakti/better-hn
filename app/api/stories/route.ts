import { fetchStoriesBatch, fetchTopStoryIds } from "@/lib/hn-api";

const STORY_LIMIT = 200;
const BATCH_SIZE = 25;

export async function GET() {
	try {
		const ids = await fetchTopStoryIds(STORY_LIMIT);

		const batches: number[][] = [];
		for (let i = 0; i < ids.length; i += BATCH_SIZE) {
			batches.push(ids.slice(i, i + BATCH_SIZE));
		}

		const batchResults = await Promise.all(
			batches.map((batch) => fetchStoriesBatch(batch)),
		);

		const stories = batchResults
			.flat()
			.filter(
				(s) => s.type === "story" || s.type === "ask" || s.type === "show",
			);

		return Response.json(stories, {
			headers: {
				"Cache-Control": "no-store",
			},
		});
	} catch (error) {
		console.error("Failed to fetch stories:", error);
		return Response.json({ error: "Failed to fetch stories" }, { status: 500 });
	}
}
