"use client";

import { ArrowUpRight, Check, Share2, Sparkles } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import type { ScoredStory } from "@/lib/hn-api";
import { cn, formatTime, getTypeLabel } from "@/lib/utils";

interface StoryCardProps {
	story: ScoredStory;
	rank: number;
	isActive?: boolean;
	onVisit?: () => void;
	query?: string;
}

function HighlightedText({ text, query }: { text: string; query: string }) {
	if (!query.trim()) return <>{text}</>;
	const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
	const regex = new RegExp(escaped, "gi");
	const nodes: React.ReactNode[] = [];
	let last = 0;
	let m: RegExpExecArray | null;
	// biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop pattern
	while ((m = regex.exec(text)) !== null) {
		if (m.index > last) nodes.push(text.slice(last, m.index));
		nodes.push(
			<mark
				key={m.index}
				className="rounded-sm bg-amber-200/80 px-0.5 text-foreground not-italic dark:bg-amber-500/35"
			>
				{m[0]}
			</mark>,
		);
		last = m.index + m[0].length;
	}
	if (last < text.length) nodes.push(text.slice(last));
	return <>{nodes}</>;
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

function ShareButton({ story }: { story: ScoredStory }) {
	const url = story.url ?? `https://news.ycombinator.com/item?id=${story.id}`;
	const [copied, setCopied] = useState(false);

	const handleShare = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		if (typeof navigator.share === "function") {
			try {
				await navigator.share({ title: story.title, url });
			} catch {}
		} else if (navigator.clipboard) {
			try {
				await navigator.clipboard.writeText(url);
				setCopied(true);
				setTimeout(() => setCopied(false), 1500);
			} catch {}
		}
	};

	return (
		<button
			type="button"
			onClick={handleShare}
			className="share-btn relative z-10 opacity-0 transition-opacity hover:text-foreground group-hover:opacity-60 group-focus-within:opacity-60 focus-visible:opacity-100"
			aria-label={copied ? "Link copied!" : "Share story"}
		>
			{copied ? (
				<Check className="h-3 w-3 text-primary" />
			) : (
				<Share2 className="h-3 w-3" />
			)}
		</button>
	);
}

export function StoryCard({ story, rank, isActive, onVisit, query = "" }: StoryCardProps) {
	const typeLabel = getTypeLabel(story);

	return (
		<article
			aria-labelledby={`story-title-${story.id}`}
			className={cn(
				"group relative rounded-xl border bg-card card-enter transition-transform motion-safe:hover:-translate-y-px hover:border-primary/30 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20",
				isActive ? "border-primary/50 ring-2 ring-primary/40" : "border-border",
			)}
		>
			{/* Stretched link — external when story has URL, internal (comments) otherwise */}
			{story.url ? (
				<a
					href={story.url}
					target="_blank"
					rel="noopener noreferrer"
					className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-labelledby={`story-title-${story.id}`}
					onClick={onVisit}
				/>
			) : (
				<Link
					href={`/story/${story.id}`}
					transitionTypes={["nav-forward"]}
					className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-labelledby={`story-title-${story.id}`}
					onClick={onVisit}
				/>
			)}

			{/* External link indicator */}
			{story.url && (
				<div
					className="pointer-events-none absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100"
					aria-hidden
				>
					<ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
				</div>
			)}

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

					<h2
						id={`story-title-${story.id}`}
						className="text-fluid-card-title font-semibold text-balance text-foreground transition-colors group-hover:text-primary"
						style={{ viewTransitionName: `story-title-${story.id}` }}
					>
						<HighlightedText text={story.title} query={query} />
					</h2>

					{/* Meta row */}
					<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
						<ScoreBadge score={story.computedScore} />
						<span className="font-mono tabular-nums">{story.score} pts</span>
						<Link
							href={`/story/${story.id}`}
							transitionTypes={["nav-forward"]}
							className="relative z-10 transition-colors hover:text-foreground"
							onClick={onVisit}
						>
							{story.descendants ?? 0} comments
						</Link>
						<time dateTime={new Date(story.time * 1000).toISOString()}>
							{formatTime(story.hoursAgo)}
						</time>
						<Link
							href={`/user/${story.by}`}
							transitionTypes={["nav-forward"]}
							className="relative z-10 transition-colors hover:text-foreground"
						>
							{story.by}
						</Link>
						<ShareButton story={story} />
					</div>
				</div>
			</div>
		</article>
	);
}
