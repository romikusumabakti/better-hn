"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ScoredStory } from "@/lib/hn-api";
import { cn, formatTime } from "@/lib/utils";

interface StoryCardProps {
	story: ScoredStory;
	rank: number;
}

function getTypeLabel(story: ScoredStory): string | null {
	if (story.title.startsWith("Ask HN:")) return "Ask";
	if (story.title.startsWith("Show HN:")) return "Show";
	if (story.type === "job") return "Job";
	return null;
}

function ScoreBadge({ score }: { score: number }) {
	const cls =
		score >= 100
			? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
			: score >= 50
				? "bg-orange-500/15 text-orange-600 dark:text-orange-400"
				: score >= 20
					? "bg-amber-500/15 text-amber-600 dark:text-amber-400"
					: score >= 5
						? "bg-green-500/15 text-green-600 dark:text-green-400"
						: "bg-blue-500/15 text-blue-600 dark:text-blue-400";
	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 rounded px-1.5 py-0.5 font-mono text-xs font-semibold",
				cls,
			)}
		>
			<Sparkles className="h-2.5 w-2.5" />
			{score.toFixed(1)}
		</span>
	);
}

export function StoryCard({ story, rank }: StoryCardProps) {
	const typeLabel = getTypeLabel(story);

	return (
		<article className="group relative rounded-xl border border-border bg-card transition-all duration-200 hover:border-border/80 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20 animate-fade-in">
			{/* Stretched link — covers the whole card */}
			<Link
				href={`/story/${story.id}`}
				className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				aria-label={story.title}
			/>

			<div className="flex gap-3 p-4">
				{/* Rank */}
				<div className="flex shrink-0">
					<span className="mt-0.5 font-mono text-xs font-medium text-muted-foreground/60 w-5 text-right">
						{rank}
					</span>
				</div>

				{/* Content */}
				<div className="min-w-0 flex-1">
					<div className="mb-2 flex flex-wrap items-start gap-1.5">
						{typeLabel && (
							<Badge
								variant="secondary"
								className="relative z-10 shrink-0 px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
							>
								{typeLabel}
							</Badge>
						)}
						{story.domain && (
							<a
								href={`https://${story.domain}`}
								target="_blank"
								rel="noopener noreferrer"
								className="relative z-10 shrink-0 rounded px-1.5 font-mono text-xs text-muted-foreground hover:text-primary transition-colors"
							>
								{story.domain}
							</a>
						)}
					</div>

					<h2 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover:text-primary sm:text-base">
						{story.title}
						{story.url && (
							<ArrowUpRight className="mb-0.5 ml-1 inline h-3.5 w-3.5 text-muted-foreground/50 transition-all group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
						)}
					</h2>

					{/* Meta row */}
					<div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
						<ScoreBadge score={story.computedScore} />
						<span className="text-border select-none">·</span>
						<span className="font-mono">{story.score} pts</span>
						<span className="text-border select-none">·</span>
						<Link
							href={`/story/${story.id}`}
							className="relative z-10 hover:text-foreground transition-colors"
						>
							{story.descendants ?? 0} comments
						</Link>
						<span className="text-border select-none">·</span>
						<span>{formatTime(story.hoursAgo)}</span>
						<span className="text-border select-none">·</span>
						<Link
							href={`/user/${story.by}`}
							className="relative z-10 hover:text-foreground transition-colors"
						>
							{story.by}
						</Link>
					</div>
				</div>
			</div>
		</article>
	);
}
