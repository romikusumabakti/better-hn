import type { Metadata } from "next";
import { Suspense, ViewTransition } from "react";
import { StoriesFeed } from "@/components/stories-feed";

export const metadata: Metadata = {
	alternates: { canonical: "/" },
};

function FeedSkeleton() {
	return (
		<div className="relative flex min-h-dvh flex-col">
			<div className="sticky top-0 z-50 border-b border-border/50 bg-background/95 h-14" />
			<div className="mx-auto w-full max-w-4xl flex-1 space-y-3 px-4 pt-4 pb-24 sm:pt-6">
				{Array.from({ length: 10 }).map((_, i) => (
					// biome-ignore lint/suspicious/noArrayIndexKey: skeletons have no identity
					<div key={i} className="rounded-xl border border-border bg-card p-4">
						<div className="flex gap-3">
							<div className="shrink-0 w-6" />
							<div className="min-w-0 flex-1 space-y-2">
								<div className="flex gap-1.5">
									<div className="h-4 w-10 rounded bg-muted animate-pulse" />
									<div className="h-4 w-20 rounded bg-muted animate-pulse" />
								</div>
								<div className="h-4 w-4/5 rounded bg-muted animate-pulse" />
								<div className="h-4 w-2/5 rounded bg-muted animate-pulse" />
								<div className="flex gap-3">
									<div className="h-3 w-8 rounded bg-muted animate-pulse" />
									<div className="h-3 w-12 rounded bg-muted animate-pulse" />
									<div className="h-3 w-16 rounded bg-muted animate-pulse" />
									<div className="h-3 w-10 rounded bg-muted animate-pulse" />
								</div>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}

export default function Home() {
	return (
		<ViewTransition
			enter={{ "nav-back": "nav-back", default: "none" }}
			exit={{ "nav-forward": "nav-forward", default: "none" }}
			default="none"
		>
			{/* Suspense required because StoriesFeed uses useSearchParams() */}
			<Suspense fallback={<FeedSkeleton />}>
				<StoriesFeed />
			</Suspense>
		</ViewTransition>
	);
}
