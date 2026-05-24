"use client";

import { AlertCircle } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import useSWR from "swr";
import { FilterPanel, type FilterState } from "@/components/filter-panel";
import { Header } from "@/components/header";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { StoryCard } from "@/components/story-card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { HNStory, ScoredStory } from "@/lib/hn-api";
import { scoreStories } from "@/lib/hn-api";

const DEFAULT_FILTERS: FilterState = {
	alpha: 0.8,
	minScore: 0,
	query: "",
};

const PAGE_SIZE = 30;

const fetcher = (url: string) => fetch(url).then((r) => r.json());

function StorySkeleton() {
	return (
		<div className="rounded-xl border border-border bg-card p-4">
			<div className="flex gap-3">
				<div className="hidden shrink-0 sm:block w-5" />
				<div className="min-w-0 flex-1 space-y-2">
					<div className="flex gap-1.5">
						<Skeleton className="h-4 w-10 rounded" />
						<Skeleton className="h-4 w-20 rounded" />
					</div>
					<Skeleton className="h-4 w-4/5 rounded" />
					<Skeleton className="h-4 w-2/5 rounded" />
					<div className="flex gap-3">
						<Skeleton className="h-3 w-8 rounded" />
						<Skeleton className="h-3 w-12 rounded" />
						<Skeleton className="h-3 w-16 rounded" />
						<Skeleton className="h-3 w-10 rounded" />
					</div>
				</div>
			</div>
		</div>
	);
}

export function StoriesFeed() {
	const [filters, setFilters] = useState<FilterState>(() => {
		if (typeof window === "undefined") return DEFAULT_FILTERS;
		try {
			const stored = localStorage.getItem("hn-filters");
			return stored
				? { ...DEFAULT_FILTERS, ...JSON.parse(stored) }
				: DEFAULT_FILTERS;
		} catch {
			return DEFAULT_FILTERS;
		}
	});
	const [showFilters, setShowFilters] = useState(false);
	const [page, setPage] = useState(1);

	const { data, error, isLoading, mutate, isValidating } = useSWR<HNStory[]>(
		"/api/stories",
		fetcher,
		{ revalidateOnFocus: false },
	);

	const handleFiltersChange = useCallback((next: FilterState) => {
		setFilters(next);
		setPage(1);
		try {
			localStorage.setItem("hn-filters", JSON.stringify(next));
		} catch {}
	}, []);

	const isFilterActive =
		filters.alpha !== DEFAULT_FILTERS.alpha ||
		filters.minScore !== DEFAULT_FILTERS.minScore ||
		filters.query !== DEFAULT_FILTERS.query;

	const scored: ScoredStory[] = useMemo(() => {
		if (!data) return [];
		return scoreStories(data, filters.alpha).sort(
			(a, b) => b.computedScore - a.computedScore,
		);
	}, [data, filters.alpha]);

	const filtered: ScoredStory[] = useMemo(() => {
		const q = filters.query.toLowerCase().trim();
		return scored.filter((s) => {
			if (s.computedScore < filters.minScore) return false;
			if (!q) return true;
			return (
				s.title.toLowerCase().includes(q) ||
				(s.domain?.toLowerCase().includes(q) ?? false) ||
				s.by.toLowerCase().includes(q)
			);
		});
	}, [scored, filters.minScore, filters.query]);

	const visible = filtered.slice(0, page * PAGE_SIZE);
	const hasMore = visible.length < filtered.length;

	return (
		<PullToRefresh onRefresh={() => mutate()} isRefreshing={isValidating}>
		<div className="flex min-h-dvh flex-col">
			<Header
				isRefreshing={isValidating}
				onRefresh={() => mutate()}
				storyCount={filtered.length}
				filterOpen={showFilters}
				onToggleFilter={() => setShowFilters((v) => !v)}
				filterActive={isFilterActive}
			/>

			<main className="mx-auto w-full max-w-4xl flex-1 space-y-4 px-4 py-6">
				{showFilters && (
					<FilterPanel
						filters={filters}
						onChange={handleFiltersChange}
						totalCount={scored.length}
						visibleCount={filtered.length}
					/>
				)}

				{error && (
					<div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
						<AlertCircle className="h-4 w-4 shrink-0" />
						Failed to load stories. Check your connection and try refreshing.
					</div>
				)}

				{isLoading && (
					<div className="space-y-2">
						{Array.from({ length: 12 }).map((_, i) => (
							// biome-ignore lint/suspicious/noArrayIndexKey: skeletons have no identity
							<StorySkeleton key={i} />
						))}
					</div>
				)}

				{!isLoading && filtered.length === 0 && !error && (
					<div className="flex flex-col items-center justify-center gap-2 py-20 text-center">
						<p className="text-base font-medium text-muted-foreground">
							No stories match your filters.
						</p>
						<p className="text-sm text-muted-foreground/60">
							Try lowering the minimum score or clearing the keyword.
						</p>
					</div>
				)}

				{!isLoading && visible.length > 0 && (
					<div className="space-y-2">
						{visible.map((story, i) => (
							<StoryCard key={story.id} story={story} rank={i + 1} />
						))}
					</div>
				)}

				{hasMore && (
					<div className="flex justify-center pb-8 pt-2">
						<Button
							variant="outline"
							onClick={() => setPage((p) => p + 1)}
							className="px-8"
						>
							Load more ({filtered.length - visible.length} remaining)
						</Button>
					</div>
				)}

				{!hasMore && visible.length > 0 && (
					<p className="pb-8 pt-2 text-center text-xs text-muted-foreground">
						Showing all {filtered.length} stories
					</p>
				)}
			</main>
		</div>
		</PullToRefresh>
	);
}
