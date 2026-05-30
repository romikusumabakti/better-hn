"use client";

import { ArrowUpRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { ScoredStory } from "@/lib/hn-api";
import { cn, formatTime, getTypeLabel } from "@/lib/utils";

interface StoryCardProps {
	story: ScoredStory;
	rank: number;
	isActive?: boolean;
	onVisit?: () => void;
}

function ScoreBadge({ score }: { score: number }) {
	const cls =
		score >= 100
			? "text-primary font-bold"
			: score >= 50
				? "text-primary/80 font-semibold"
				: score >= 20
					? "text-primary/65"
					: score >= 5
						? "text-muted-foreground"
						: "text-muted-foreground/80";

	return (
		<span
			className={cn(
				"inline-flex items-center gap-1 font-mono text-xs tabular-nums",
				cls,
			)}
		>
			<Sparkles className="h-2.5 w-2.5" />
			{score.toFixed(1)}
		</span>
	);
}

export function StoryCard({ story, rank, isActive, onVisit }: StoryCardProps) {
	const typeLabel = getTypeLabel(story);

	return (
		<article
			className={cn(
				"group relative rounded-xl border bg-card card-enter @container transition-transform hover:-translate-y-px hover:border-primary/30 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20",
				isActive ? "border-primary/50 ring-1 ring-primary/20" : "border-border",
			)}
		>
			{/* Stretched link — covers the whole card */}
			<Link
				href={`/story/${story.id}`}
				transitionTypes={["nav-forward"]}
				className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
				aria-label={story.title}
				onClick={onVisit}
			/>

			<div className="flex gap-3 p-4">
				{/* Rank */}
				<div className="flex shrink-0">
					<span className="mt-0.5 w-6 text-right font-mono text-xs font-medium text-muted-foreground/70">
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
								className="relative z-10 shrink-0 rounded px-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
							>
								{story.domain}
							</a>
						)}
					</div>

					<h2 className="text-fluid-card-title font-semibold text-pretty text-foreground transition-colors group-hover:text-primary">
						{story.title}
						{story.url && (
							<ArrowUpRight className="mb-0.5 ml-1 inline h-3.5 w-3.5 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100 group-hover:text-primary" />
						)}
					</h2>

					{/* Meta row */}
					<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
						<ScoreBadge score={story.computedScore} />
						<span className="font-mono">{story.score} pts</span>
						<Link
							href={`/story/${story.id}`}
							transitionTypes={["nav-forward"]}
							className="relative z-10 transition-colors hover:text-foreground"
						>
							{story.descendants ?? 0} comments
						</Link>
						<time dateTime={new Date(story.time * 1000).toISOString()}>
							{formatTime(story.hoursAgo)}
						</time>
						<Link
							href={`/user/${story.by}`}
							transitionTypes={["nav-forward"]}
							className="relative z-10 hidden transition-colors hover:text-foreground @sm:inline"
						>
							{story.by}
						</Link>
					</div>
				</div>
			</div>
		</article>
	);
}
