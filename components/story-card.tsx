"use client";

import {
	ArrowUpRight,
	Clock,
	MessageSquare,
	Triangle,
	User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ScoredStory } from "@/lib/hn-api";
import { cn } from "@/lib/utils";

interface StoryCardProps {
	story: ScoredStory;
	rank: number;
}

function formatTime(hoursAgo: number): string {
	if (hoursAgo < 1) {
		const mins = Math.round(hoursAgo * 60);
		return `${mins}m ago`;
	}
	if (hoursAgo < 24) {
		return `${Math.round(hoursAgo)}h ago`;
	}
	const days = Math.round(hoursAgo / 24);
	return `${days}d ago`;
}

function getScoreColor(score: number): string {
	if (score >= 200) return "text-rose-500 dark:text-rose-400";
	if (score >= 80) return "text-orange-500 dark:text-orange-400";
	if (score >= 30) return "text-amber-500 dark:text-amber-400";
	if (score >= 10) return "text-emerald-500 dark:text-emerald-400";
	return "text-blue-500 dark:text-blue-400";
}

function getScoreBg(score: number): string {
	if (score >= 200)
		return "bg-rose-500/10 border-rose-500/20 dark:bg-rose-500/15";
	if (score >= 80)
		return "bg-orange-500/10 border-orange-500/20 dark:bg-orange-500/15";
	if (score >= 30)
		return "bg-amber-500/10 border-amber-500/20 dark:bg-amber-500/15";
	if (score >= 10)
		return "bg-emerald-500/10 border-emerald-500/20 dark:bg-emerald-500/15";
	return "bg-blue-500/10 border-blue-500/20 dark:bg-blue-500/15";
}

function getTypeLabel(story: ScoredStory): string | null {
	if (story.title.startsWith("Ask HN:")) return "Ask";
	if (story.title.startsWith("Show HN:")) return "Show";
	if (story.type === "job") return "Job";
	return null;
}

export function StoryCard({ story, rank }: StoryCardProps) {
	const typeLabel = getTypeLabel(story);
	const scoreStr = story.computedScore.toFixed(1);

	const hnUrl = `https://news.ycombinator.com/item?id=${story.id}`;
	const storyUrl = story.url ?? hnUrl;

	return (
		<article className="group relative rounded-xl border border-border bg-card transition-all duration-200 hover:border-border/80 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20 animate-fade-in">
			<div className="flex gap-3 p-4">
				{/* Rank */}
				<div className="hidden shrink-0 sm:flex">
					<span className="mt-0.5 font-mono text-xs font-medium text-muted-foreground/60 w-5 text-right">
						{rank}
					</span>
				</div>

				{/* Score badge */}
				<div className="flex shrink-0 flex-col items-center gap-0.5">
					<div
						className={cn(
							"flex min-w-[3.25rem] flex-col items-center justify-center rounded-lg border px-2 py-1.5",
							getScoreBg(story.computedScore),
						)}
					>
						<span
							className={cn(
								"font-mono text-sm font-bold leading-none",
								getScoreColor(story.computedScore),
							)}
						>
							{scoreStr}
						</span>
						<span className="mt-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">
							score
						</span>
					</div>
				</div>

				{/* Content */}
				<div className="min-w-0 flex-1">
					<div className="mb-1.5 flex flex-wrap items-start gap-1.5">
						{typeLabel && (
							<Badge
								variant="secondary"
								className="shrink-0 px-1.5 py-0 text-[10px] font-semibold uppercase tracking-wide"
							>
								{typeLabel}
							</Badge>
						)}
						{story.domain && (
							<a
								href={`https://${story.domain}`}
								target="_blank"
								rel="noopener noreferrer"
								onClick={(e) => e.stopPropagation()}
								className="shrink-0 rounded px-1.5 py-0 font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors"
							>
								{story.domain}
							</a>
						)}
					</div>

					<a
						href={storyUrl}
						target="_blank"
						rel="noopener noreferrer"
						className="group/title inline"
					>
						<h2 className="text-sm font-semibold leading-snug text-foreground transition-colors group-hover/title:text-primary sm:text-[15px]">
							{story.title}
							{story.url && (
								<ArrowUpRight className="mb-0.5 ml-1 inline h-3.5 w-3.5 text-muted-foreground/50 transition-all group-hover/title:text-primary group-hover/title:translate-x-0.5 group-hover/title:-translate-y-0.5" />
							)}
						</h2>
					</a>

					{/* Meta row */}
					<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
						<span className="flex items-center gap-1">
							<Triangle className="h-3 w-3 fill-current" />
							<span className="font-mono font-medium">{story.score}</span>
							<span>pts</span>
						</span>

						<a
							href={hnUrl}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1 hover:text-foreground transition-colors"
						>
							<MessageSquare className="h-3 w-3" />
							<span className="font-mono font-medium">
								{story.descendants ?? 0}
							</span>
							<span>comments</span>
						</a>

						<span className="flex items-center gap-1">
							<Clock className="h-3 w-3" />
							<span>{formatTime(story.hoursAgo)}</span>
						</span>

						<a
							href={`https://news.ycombinator.com/user?id=${story.by}`}
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center gap-1 hover:text-foreground transition-colors"
						>
							<User className="h-3 w-3" />
							<span>{story.by}</span>
						</a>
					</div>
				</div>
			</div>
		</article>
	);
}
