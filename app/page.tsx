import type { Metadata } from "next";
import { Suspense, ViewTransition } from "react";
import { StoriesFeed } from "@/components/stories-feed";
import { StorySkeleton } from "@/components/story-skeleton";

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
					<StorySkeleton key={i} />
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
