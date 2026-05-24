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
import { Comment } from "@/components/comment";
import { Header } from "@/components/header";
import { Badge } from "@/components/ui/badge";
import type { HNComment } from "@/lib/hn-api";
import { fetchCommentTree, fetchStory } from "@/lib/hn-api";
import { formatTime } from "@/lib/utils";

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

const TOP_COMMENTS_LIMIT = 20;

async function StoryComments({
	kids,
	storyId,
}: {
	kids: number[];
	storyId: number;
}) {
	const results = await Promise.all(
		kids.slice(0, TOP_COMMENTS_LIMIT).map((id) => fetchCommentTree(id)),
	);
	const comments = results.filter(Boolean) as HNComment[];

	if (comments.length === 0) {
		return (
			<p className="py-12 text-center text-sm text-muted-foreground">
				No comments yet.
			</p>
		);
	}

	return (
		<div>
			{comments.map((comment) => (
				<Comment key={comment.id} comment={comment} depth={0} />
			))}
			{kids.length > TOP_COMMENTS_LIMIT && (
				<p className="pt-6 text-center text-xs text-muted-foreground/60">
					Showing top {TOP_COMMENTS_LIMIT} of {kids.length} comments.{" "}
					<a
						href={`https://news.ycombinator.com/item?id=${storyId}`}
						target="_blank"
						rel="noopener noreferrer"
						className="underline underline-offset-2 hover:text-muted-foreground transition-colors"
					>
						View all on HN →
					</a>
				</p>
			)}
		</div>
	);
}

function CommentsSkeleton() {
	return (
		<div className="space-y-5">
			{Array.from({ length: 6 }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: skeletons have no identity
				<div key={i} className="animate-pulse">
					<div className="mb-2 flex items-center gap-2">
						<div className="h-3 w-3 rounded bg-muted" />
						<div className="h-3 w-20 rounded bg-muted" />
						<div className="h-3 w-14 rounded bg-muted" />
					</div>
					<div className="space-y-1.5 pl-5">
						<div className="h-3 w-full rounded bg-muted" />
						<div className="h-3 w-5/6 rounded bg-muted" />
						{i % 2 === 0 && <div className="h-3 w-4/6 rounded bg-muted" />}
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

	const typeLabel = story.title.startsWith("Ask HN:")
		? "Ask"
		: story.title.startsWith("Show HN:")
			? "Show"
			: story.type === "job"
				? "Job"
				: null;

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
					className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
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

					<h1 className="mb-4 text-2xl font-bold leading-snug text-foreground sm:text-3xl">
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

					{story.text && (
						<div
							className="prose prose-sm dark:prose-invert mb-5 max-w-none text-muted-foreground [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-xs [&_pre]:rounded-md [&_pre]:bg-muted [&_pre]:p-3 [&_pre]:text-xs"
							dangerouslySetInnerHTML={{ __html: story.text }}
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
				<section>
					<h2 className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
						{story.descendants ?? 0} comments
					</h2>
					<Suspense fallback={<CommentsSkeleton />}>
						<StoryComments kids={story.kids ?? []} storyId={storyId} />
					</Suspense>
				</section>
			</main>
		</div>
		</ViewTransition>
	);
}
