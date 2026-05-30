"use client";

import { Loader2 } from "lucide-react";
import { useState } from "react";
import { Comment } from "@/components/comment";
import type { HNComment } from "@/lib/hn-api";

const BATCH_SIZE = 10;

interface LoadMoreCommentsProps {
	initialComments: HNComment[];
	remainingKids: number[];
	storyId: number;
}

export function LoadMoreComments({
	initialComments,
	remainingKids,
	storyId,
}: LoadMoreCommentsProps) {
	const [comments, setComments] = useState(initialComments);
	const [kids, setKids] = useState(remainingKids);
	const [loading, setLoading] = useState(false);

	const loadMore = async () => {
		setLoading(true);
		const batch = kids.slice(0, BATCH_SIZE);
		const results = await Promise.all(
			batch.map((id) =>
				fetch(`/api/comment/${id}`)
					.then((r) => r.json())
					.catch(() => null),
			),
		);
		const valid = results.filter(Boolean) as HNComment[];
		setComments((prev) => [...prev, ...valid]);
		setKids((prev) => prev.slice(BATCH_SIZE));
		setLoading(false);
	};

	return (
		<div>
			{comments.map((comment) => (
				<Comment key={comment.id} comment={comment} depth={0} />
			))}

			{kids.length > 0 && (
				<div className="mt-6 flex flex-col items-center gap-2">
					<button
						type="button"
						onClick={loadMore}
						disabled={loading}
						className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
					>
						{loading ? (
							<>
								<Loader2 className="h-3.5 w-3.5 animate-spin" />
								Loading…
							</>
						) : (
							`Load ${Math.min(BATCH_SIZE, kids.length)} more comment${Math.min(BATCH_SIZE, kids.length) !== 1 ? "s" : ""}`
						)}
					</button>
					{kids.length > BATCH_SIZE && !loading && (
						<span className="text-xs text-muted-foreground/50">
							{kids.length} remaining
						</span>
					)}
				</div>
			)}

			{kids.length === 0 && comments.length === 0 && (
				<p className="py-12 text-center text-sm text-muted-foreground">
					No comments yet.
				</p>
			)}

			{kids.length === 0 && comments.length > 0 && (
				<p className="mt-8 text-center text-xs text-muted-foreground/40">
					<a
						href={`https://news.ycombinator.com/item?id=${storyId}`}
						target="_blank"
						rel="noopener noreferrer"
						className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
					>
						View thread on HN
					</a>
				</p>
			)}
		</div>
	);
}
