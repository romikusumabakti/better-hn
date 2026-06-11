import {
	ArrowLeft,
	ArrowUpRight,
	Award,
	Calendar,
	Clock,
	ExternalLink,
	FileText,
	Ghost,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, ViewTransition } from "react";
import { Header } from "@/components/header";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchStoriesBatch, fetchUser } from "@/lib/hn-api";
import { sanitize } from "@/lib/sanitize";
import { formatTime } from "@/lib/utils";

export async function generateMetadata({
	params,
}: {
	params: Promise<{ username: string }>;
}): Promise<Metadata> {
	const { username } = await params;
	const user = await fetchUser(username);
	if (!user) return {};
	return {
		title: `${user.id} — Better HN`,
		description: `${user.karma.toLocaleString()} karma · Hacker News profile`,
	};
}

const AVATAR_PALETTES = [
	"bg-blue-500/15 text-blue-600 dark:text-blue-400",
	"bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
	"bg-amber-500/15 text-amber-600 dark:text-amber-400",
	"bg-orange-500/15 text-orange-600 dark:text-orange-400",
	"bg-violet-500/15 text-violet-600 dark:text-violet-400",
	"bg-pink-500/15 text-pink-600 dark:text-pink-400",
	"bg-cyan-500/15 text-cyan-600 dark:text-cyan-400",
	"bg-indigo-500/15 text-indigo-600 dark:text-indigo-400",
] as const;

function avatarPalette(username: string): string {
	let hash = 0;
	for (let i = 0; i < username.length; i++) {
		hash = (hash * 31 + username.charCodeAt(i)) | 0;
	}
	return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length];
}

function formatDate(unixTime: number): string {
	return new Date(unixTime * 1000).toLocaleDateString("en-US", {
		year: "numeric",
		month: "long",
		day: "numeric",
	});
}

function accountAge(createdUnix: number): string {
	const years = (Date.now() / 1000 - createdUnix) / (365.25 * 24 * 3600);
	if (years < 1) {
		const months = Math.floor(years * 12);
		return `${months} month${months !== 1 ? "s" : ""}`;
	}
	const y = Math.floor(years);
	return `${y} year${y !== 1 ? "s" : ""}`;
}

async function UserSubmissions({ ids }: { ids: number[] }) {
	const recent = ids.slice(0, 30);
	const items = await fetchStoriesBatch(recent);
	const stories = items
		.filter((item) => !item.deleted && !item.dead)
		.slice(0, 10);

	if (stories.length === 0) {
		return (
			<p className="py-8 text-center text-sm text-muted-foreground">
				No public submissions found.
			</p>
		);
	}

	return (
		<ul className="divide-y divide-border list-none p-0 m-0">
			{stories.map((story) => {
				const hoursAgo = (Date.now() / 1000 - story.time) / 3600;
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
					<li key={story.id} className="py-3.5">
						<div className="mb-1 flex flex-wrap items-center gap-1.5">
							{domain && (
								<span className="font-mono text-xs text-muted-foreground">
									{domain}
								</span>
							)}
						</div>
						<Link
							href={`/story/${story.id}`}
							className="text-sm font-medium leading-snug text-foreground transition-colors hover:text-primary"
						>
							{story.title}
							{story.url && (
								<ArrowUpRight className="mb-0.5 ml-1 inline h-3.5 w-3.5 text-muted-foreground/50" />
							)}
						</Link>
						<div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
							<span className="font-mono">{story.score} pts</span>
							<span>{story.descendants ?? 0} comments</span>
							<span className="flex items-center gap-1">
								<Clock className="h-3 w-3" />
								{formatTime(hoursAgo)}
							</span>
						</div>
					</li>
				);
			})}
		</ul>
	);
}

function SubmissionsSkeleton() {
	return (
		<div className="divide-y divide-border">
			{Array.from({ length: 5 }).map((_, i) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: skeletons have no identity
				<div key={i} className="py-3.5">
					<Skeleton className="mb-2 h-4 w-4/5 rounded" />
					<Skeleton className="h-3 w-1/3 rounded" />
				</div>
			))}
		</div>
	);
}

export default async function UserPage({
	params,
}: {
	params: Promise<{ username: string }>;
}) {
	const { username } = await params;

	const user = await fetchUser(username);
	if (!user) notFound();

	const hnUrl = `https://news.ycombinator.com/user?id=${user.id}`;

	return (
		<ViewTransition
			enter={{ "nav-forward": "nav-forward", default: "none" }}
			exit={{ "nav-back": "nav-back", default: "none" }}
			default="none"
		>
			<div className="min-h-dvh bg-background">
				<Header />
				<main id="main-content" className="mx-auto max-w-4xl px-4 py-6">
					<nav aria-label="Breadcrumb" className="mb-6">
						<Link
							href="/"
							transitionTypes={["nav-back"]}
							className="-ml-2.5 inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to feed
						</Link>
					</nav>

					{/* User profile card */}
					<div className="mb-6 rounded-xl border border-border bg-card p-5 sm:p-6">
						<div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-6">
							<div
								aria-hidden="true"
								className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full text-2xl font-bold select-none ${avatarPalette(user.id)}`}
							>
								{user.id[0].toUpperCase()}
							</div>

							<div className="flex-1 min-w-0">
								<div className="mb-3">
									<h1 className="text-2xl font-bold text-balance text-foreground">
										{user.id}
									</h1>
								</div>

								<div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
									<span className="flex items-center gap-1.5">
										<Award className="h-4 w-4" />
										<span className="font-mono font-semibold text-foreground">
											{user.karma.toLocaleString()}
										</span>
										<span>karma</span>
									</span>
									<span className="flex items-center gap-1.5">
										<Calendar className="h-4 w-4" />
										<span>Joined {formatDate(user.created)}</span>
									</span>
									<span className="flex items-center gap-1.5">
										<Clock className="h-4 w-4" />
										<span>{accountAge(user.created)} on HN</span>
									</span>
									{user.submitted && (
										<span className="flex items-center gap-1.5">
											<FileText className="h-4 w-4" />
											<span className="font-mono font-semibold text-foreground">
												{user.submitted.length.toLocaleString()}
											</span>
											<span>submissions</span>
										</span>
									)}
								</div>

								<div className="mt-4">
									<a
										href={hnUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="inline-flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground"
									>
										<ExternalLink className="h-3.5 w-3.5" />
										View on Hacker News
									</a>
								</div>
							</div>
						</div>

						{!user.about &&
							(!user.submitted || user.submitted.length === 0) && (
								<div className="mt-5 border-t border-border pt-5 flex items-center gap-2 text-sm text-muted-foreground/60">
									<Ghost className="h-4 w-4 shrink-0" />
									No public content.
								</div>
							)}

						{user.about && (
							<div className="mt-5 border-t border-border pt-5">
								<p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
									About
								</p>
								<div
									className="max-w-none text-sm text-foreground/90 [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_p]:mb-2 [&_p:last-child]:mb-0 [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:text-xs"
									dangerouslySetInnerHTML={{ __html: sanitize(user.about) }}
								/>
							</div>
						)}
					</div>

					{/* Recent submissions */}
					{user.submitted && user.submitted.length > 0 && (
						<section aria-labelledby="recent-submissions-heading">
							<h2
								id="recent-submissions-heading"
								className="mb-4 text-base font-semibold text-foreground"
							>
								Recent Submissions
							</h2>
							<div className="rounded-xl border border-border bg-card px-5 sm:px-6">
								<Suspense fallback={<SubmissionsSkeleton />}>
									<UserSubmissions ids={user.submitted} />
								</Suspense>
							</div>
							{user.submitted.length > 10 && (
								<p className="mt-3 text-center text-xs text-muted-foreground/60">
									Showing 10 of {user.submitted.length.toLocaleString()}{" "}
									submissions —{" "}
									<a
										href={hnUrl}
										target="_blank"
										rel="noopener noreferrer"
										className="underline underline-offset-2 transition-colors hover:text-muted-foreground"
									>
										view all on HN
									</a>
								</p>
							)}
						</section>
					)}
				</main>
			</div>
		</ViewTransition>
	);
}
