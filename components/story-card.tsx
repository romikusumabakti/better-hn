"use client";

import {
	ArrowUpRight,
	Check,
	MessageSquare,
	Share2,
	TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
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
	const nodes = useMemo(() => {
		const q = query.trim();
		if (!q) return [text];
		const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
		const regex = new RegExp(escaped, "gi");
		const out: React.ReactNode[] = [];
		let last = 0;
		let m: RegExpExecArray | null;
		// biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop pattern
		while ((m = regex.exec(text)) !== null) {
			if (m.index > last) out.push(text.slice(last, m.index));
			out.push(
				<mark
					key={m.index}
					className="rounded-sm bg-highlight px-0.5 text-foreground not-italic"
				>
					{m[0]}
				</mark>,
			);
			last = m.index + m[0].length;
		}
		if (last < text.length) out.push(text.slice(last));
		return out;
	}, [text, query]);

	return <>{nodes}</>;
}

function ScoreBadge({ score }: { score: number }) {
	const cls =
		score >= 100
			? "text-primary font-bold"
			: score >= 50
				? "text-primary font-semibold"
				: score >= 20
					? "text-primary"
					: "text-muted-foreground";

	// Only flag genuinely trending stories — the icon is a "rising" signal,
	// not decoration, so it would mislead on low/stale scores.
	const trending = score >= 20;

	return (
		<span
			title="Ranking score — points weighted by freshness"
			className={cn(
				"inline-flex items-center gap-1 font-mono text-xs tabular-nums",
				cls,
			)}
		>
			{trending && <TrendingUp className="h-2.5 w-2.5" aria-hidden />}
			<span className="sr-only">Ranking score: </span>
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
			className="share-btn relative z-10 -m-2.5 inline-flex h-9 w-9 items-center justify-center rounded text-muted-foreground/70 opacity-40 transition-opacity hover:text-foreground group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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

export function StoryCard({
	story,
	rank,
	isActive,
	onVisit,
	query = "",
}: StoryCardProps) {
	const typeLabel = getTypeLabel(story);

	return (
		<article
			aria-labelledby={`story-title-${story.id}`}
			className={cn(
				"group relative rounded-xl border bg-card card-enter transition-transform motion-safe:hover:-translate-y-px hover:border-primary/30 hover:shadow-md hover:shadow-black/5 dark:hover:shadow-black/20",
				isActive ? "border-primary/50 ring-2 ring-primary/40" : "border-border",
			)}
		>
			{/* Stretched link — card-tap opens the article (matching the title's
			    ↗ affordance), or the discussion for text-only posts. The
			    "comments" pill below is a separate, explicit action. */}
			{story.url ? (
				// biome-ignore lint/a11y/useAnchorContent: stretched overlay link is labelled via aria-label
				<a
					href={story.url}
					target="_blank"
					rel="noopener noreferrer"
					onClick={onVisit}
					className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-label={`${story.title} — open article${story.domain ? ` on ${story.domain}` : ""}`}
				/>
			) : (
				<Link
					href={`/story/${story.id}`}
					transitionTypes={["nav-forward"]}
					onClick={onVisit}
					className="absolute inset-0 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
					aria-label={`${story.title} — ${story.descendants ?? 0} comments`}
				/>
			)}

			<div className="flex gap-3 p-4">
				{/* Rank */}
				<div className="flex shrink-0">
					<span className="mt-0.5 w-6 text-right font-mono text-xs font-medium text-muted-foreground">
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
							<Link
								href={`/?q=${encodeURIComponent(story.domain)}`}
								className="relative z-10 shrink-0 rounded px-1.5 font-mono text-xs text-muted-foreground transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
								aria-label={`Filter feed by ${story.domain}`}
							>
								{story.domain}
							</Link>
						)}
					</div>

					<h2
						id={`story-title-${story.id}`}
						className="pointer-events-none text-fluid-card-title font-semibold text-balance text-foreground"
						style={{ viewTransitionName: `story-title-${story.id}` }}
					>
						{/* Title is not its own link — the stretched overlay link above
						    handles navigation, so a second <a> to the same target would
						    just be redundant link-soup for screen readers. */}
						<span className="transition-colors group-hover:text-primary">
							<HighlightedText text={story.title} query={query} />
							{story.url && (
								<ArrowUpRight
									className="mb-0.5 ml-1 inline h-3.5 w-3.5 text-muted-foreground/60"
									aria-hidden
								/>
							)}
						</span>
					</h2>

					{/* Meta row */}
					<div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
						<ScoreBadge score={story.computedScore} />
						<span className="font-mono tabular-nums">{story.score} pts</span>
						<Link
							href={`/story/${story.id}`}
							transitionTypes={["nav-forward"]}
							className="relative z-10 -my-0.5 inline-flex items-center gap-1 rounded-full border border-border bg-secondary/40 px-2 py-0.5 font-medium tabular-nums transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
							onClick={onVisit}
							aria-label={`${story.descendants ?? 0} comments — open discussion`}
						>
							<MessageSquare className="h-3 w-3" aria-hidden />
							{story.descendants ?? 0}
						</Link>
						<time dateTime={new Date(story.time * 1000).toISOString()}>
							{formatTime(story.hoursAgo)}
						</time>
						<Link
							href={`/user/${story.by}`}
							transitionTypes={["nav-forward"]}
							className="relative z-10 rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
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
