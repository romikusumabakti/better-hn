"use client";

import {
	ArrowUpRight,
	Clock,
	MessageSquare,
	Sparkles,
	Triangle,
	User,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { ScoredStory } from "@/lib/hn-api";

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


function getTypeLabel(story: ScoredStory): string | null {
	if (story.title.startsWith("Ask HN:")) return "Ask";
	if (story.title.startsWith("Show HN:")) return "Show";
	if (story.type === "job") return "Job";
	return null;
}

export function StoryCard({ story, rank }: StoryCardProps) {
	const typeLabel = getTypeLabel(story);

	const hnUrl = `https://news.ycombinator.com/item?id=${story.id}`;
	const storyUrl = story.url ?? hnUrl;

	return (
		<article className="group relative rounded-xl border border-border bg-card transition-all duration-200 hover:border-border/80 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20 animate-fade-in">
			<div className="flex gap-3 p-4">
				{/* Rank */}
				<div className="flex shrink-0">
					<span className="mt-0.5 font-mono text-xs font-medium text-muted-foreground/60 w-5 text-right">
						{rank}
					</span>
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
								className="shrink-0 rounded pr-1.5 py-0 font-mono text-[10px] text-muted-foreground hover:text-primary transition-colors"
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
							<Sparkles className="h-3 w-3" />
							<span className="font-mono font-medium">{story.computedScore.toFixed(1)}</span>
						</span>
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
