import {
	ArrowLeft,
	ArrowUpRight,
	Clock,
	ExternalLink,
	MessageSquare,
	Triangle,
	User,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { Header } from "@/components/header";
import { LoadMoreComments } from "@/components/load-more-comments";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { VisitedMarker } from "@/components/visited-marker";
import type { HNComment } from "@/lib/hn-api";
import { fetchCommentTree, fetchStory } from "@/lib/hn-api";
import { highlightHtml, processComment } from "@/lib/highlight";
import { sanitize } from "@/lib/sanitize";
import { formatTime, getTypeLabel } from "@/lib/utils";

export async function generateMetadata(
	props: PageProps<"/story/[id]">,
): Promise<Metadata> {
	const { id } = await props.params;
	const storyId = parseInt(id, 10);
	if (Number.isNaN(storyId)) return {};
	const story = await fetchStory(storyId);
	if (!story) return {};
	const desc = `${story.score} pts · ${story.descendants ?? 0} comments · by ${story.by}`;
	return {
		title: `${story.title} — Better HN`,
		description: desc,
		openGraph: { title: story.title, description: desc },
		twitter: { card: "summary", title: story.title, description: desc },
	};
}

const INITIAL_COMMENTS = 20;

async function StoryComments({
	kids,
	storyId,
}: {
	kids: number[];
	storyId: number;
}) {
	const results = await Promise.all(
		kids.slice(0, INITIAL_COMMENTS).map((id) => fetchCommentTree(id)),
	);
	const rawComments = results.filter(Boolean) as HNComment[];
	const initialComments = await Promise.all(rawComments.map(processComment));

	return (
		<LoadMoreComments
			initialComments={initialComments}
			remainingKids={kids.slice(INITIAL_COMMENTS)}
			storyId={storyId}
		/>
	);
}

function CommentsSkeleton() {
	return (
		<div className="space-y-5">
			{Array.from({ length: 6 }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: skeletons have no identity
				<div key={i}>
					<div className="mb-2 flex items-center gap-2">
						<Skeleton className="h-3 w-3 rounded" />
						<Skeleton className="h-3 w-20 rounded" />
						<Skeleton className="h-3 w-14 rounded" />
					</div>
					<div className="space-y-1.5 pl-5">
						<Skeleton className="h-3 w-full rounded" />
						<Skeleton className="h-3 w-5/6 rounded" />
						{i % 2 === 0 && <Skeleton className="h-3 w-4/6 rounded" />}
					</div>
				</div>
			))}
		</div>
	);
}

export default async function StoryPage(props: PageProps<"/story/[id]">) {
	const { id } = await props.params;
	const storyId = parseInt(id, 10);

	if (Number.isNaN(storyId)) notFound();

	const story = await fetchStory(storyId);
	if (!story) notFound();

	const hoursAgo = (Date.now() / 1000 - story.time) / 3600;
	const hnUrl = `https://news.ycombinator.com/item?id=${story.id}`;
	const storyHtml = story.text ? await highlightHtml(sanitize(story.text)) : null;

	const typeLabel = getTypeLabel(story);

	const domain = story.url
		? (() => {
				try {
					return new URL(story.url).hostname.replace(/^www\./, "");
				} catch {
					return undefined;
				}
			})()
		: undefined;

	return (
		<ViewTransition
			enter={{ "nav-forward": "nav-forward", default: "none" }}
			exit={{ "nav-back": "nav-back", default: "none" }}
			default="none"
		>
			<div className="min-h-dvh bg-background">
				<Header />
				<main id="main-content" className="mx-auto max-w-4xl px-4 py-6">
					<Link
						href="/"
						transitionTypes={["nav-back"]}
						className="mb-6 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground -ml-2.5"
					>
						<ArrowLeft className="h-4 w-4" />
						Back to feed
					</Link>

					{/* Story header */}
					<article className="mb-8 rounded-xl border border-border bg-card p-5 sm:p-6">
						<div className="mb-3 flex flex-wrap items-center gap-2">
							{typeLabel && (
								<Badge
									variant="secondary"
									className="px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wide"
								>
									{typeLabel}
								</Badge>
							)}
							{domain && (
								<a
									href={`https://${domain}`}
									target="_blank"
									rel="noopener noreferrer"
									className="font-mono text-xs text-muted-foreground transition-colors hover:text-primary"
								>
									{domain}
								</a>
							)}
						</div>

						<h1 className="mb-4 text-fluid-page-title font-bold text-balance text-foreground">
							{story.url ? (
								<a
									href={story.url}
									target="_blank"
									rel="noopener noreferrer"
									className="inline transition-colors hover:text-primary"
								>
									{story.title}
									<ArrowUpRight className="mb-1 ml-1.5 inline h-4 w-4 text-muted-foreground/50" />
								</a>
							) : (
								story.title
							)}
						</h1>

						{storyHtml && (
							<div
								className="mb-5 max-w-none text-muted-foreground [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-xs [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_pre:not(.shiki)]:rounded-md [&_pre:not(.shiki)]:bg-muted [&_pre:not(.shiki)]:p-3 [&_pre:not(.shiki)]:text-xs [&_pre:not(.shiki)]:overflow-x-auto"
								dangerouslySetInnerHTML={{ __html: storyHtml }}
							/>
						)}

						<div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
							<span className="flex items-center gap-1.5">
								<Triangle className="h-3.5 w-3.5 fill-current" />
								<span className="font-mono font-medium">{story.score}</span>
								<span>points</span>
							</span>
							<span className="flex items-center gap-1.5">
								<MessageSquare className="h-3.5 w-3.5" />
								<span className="font-mono font-medium">
									{story.descendants ?? 0}
								</span>
								<span>comments</span>
							</span>
							<span className="flex items-center gap-1.5">
								<Clock className="h-3.5 w-3.5" />
								<time dateTime={new Date(story.time * 1000).toISOString()}>
									{formatTime(hoursAgo)}
								</time>
							</span>
							<Link
								href={`/user/${story.by}`}
								className="flex items-center gap-1.5 transition-colors hover:text-foreground"
							>
								<User className="h-3.5 w-3.5" />
								<span>{story.by}</span>
							</Link>
							<a
								href={hnUrl}
								target="_blank"
								rel="noopener noreferrer"
								className="ml-auto inline-flex items-center gap-1 text-xs transition-colors hover:text-foreground"
							>
								View on HN
								<ExternalLink className="h-3 w-3" />
							</a>
						</div>
					</article>

					{/* Comments */}
					<section aria-labelledby="comments-heading">
						<h2 id="comments-heading" className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
							{story.descendants ?? 0} comments
						</h2>
						<Suspense fallback={<CommentsSkeleton />}>
							<StoryComments kids={story.kids ?? []} storyId={storyId} />
						</Suspense>
					</section>
					<VisitedMarker id={storyId} />
				</main>
			</div>
		</ViewTransition>
	);
}
