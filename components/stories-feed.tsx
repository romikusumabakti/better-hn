"use client";

import { AlertCircle, Loader2, SearchX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { FilterPanel, type FilterState } from "@/components/filter-panel";
import { Header } from "@/components/header";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { ScrollToTop } from "@/components/scroll-to-top";
import { StoryCard } from "@/components/story-card";
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
	const [activeIndex, setActiveIndex] = useState(-1);
	const activeRef = useRef<HTMLDivElement | null>(null);
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	const [filters, setFilters] = useState<FilterState>(DEFAULT_FILTERS);

	useEffect(() => {
		try {
			const stored = localStorage.getItem("hn-filters");
			if (stored) setFilters((prev) => ({ ...prev, ...JSON.parse(stored) }));
		} catch {}
	}, []);
	const [showFilters, setShowFilters] = useState(false);
	const [page, setPage] = useState(1);

	// Toast
	const [toastMsg, setToastMsg] = useState<string | null>(null);
	const prevValidatingRef = useRef(false);

	const { data, error, isLoading, mutate, isValidating } = useSWR<HNStory[]>(
		"/api/stories",
		fetcher,
		{ revalidateOnFocus: false },
	);

	// Show toast when refresh completes
	useEffect(() => {
		if (prevValidatingRef.current && !isValidating && data) {
			setToastMsg("Feed updated");
			const t = setTimeout(() => setToastMsg(null), 2500);
			return () => clearTimeout(t);
		}
		prevValidatingRef.current = isValidating;
	}, [isValidating, data]);

	// Save scroll position
	useEffect(() => {
		let timer: ReturnType<typeof setTimeout>;
		const save = () => {
			clearTimeout(timer);
			timer = setTimeout(() => {
				sessionStorage.setItem("hn-scroll", String(window.scrollY));
			}, 100);
		};
		window.addEventListener("scroll", save, { passive: true });
		return () => {
			window.removeEventListener("scroll", save);
			clearTimeout(timer);
		};
	}, []);

	// Restore scroll after data loads
	const scrollRestored = useRef(false);
	useEffect(() => {
		if (isLoading || scrollRestored.current) return;
		scrollRestored.current = true;
		const saved = sessionStorage.getItem("hn-scroll");
		if (saved && parseInt(saved, 10) > 0) {
			requestAnimationFrame(() => {
				window.scrollTo({ top: parseInt(saved, 10), behavior: "instant" });
			});
		}
	}, [isLoading]);

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

	useEffect(() => {
		const onKey = (e: KeyboardEvent) => {
			const tag = (e.target as HTMLElement).tagName;
			if (tag === "INPUT" || tag === "TEXTAREA") return;

			if (e.key === "j" || e.key === "ArrowDown") {
				e.preventDefault();
				setActiveIndex((i) => Math.min(i + 1, visible.length - 1));
			} else if (e.key === "k" || e.key === "ArrowUp") {
				e.preventDefault();
				setActiveIndex((i) => Math.max(i - 1, 0));
			} else if ((e.key === "o" || e.key === "Enter") && activeIndex >= 0) {
				const story = visible[activeIndex];
				if (story?.url) window.open(story.url, "_blank", "noopener,noreferrer");
			} else if (e.key === "c" && activeIndex >= 0) {
				const story = visible[activeIndex];
				if (story) window.location.href = `/story/${story.id}`;
			} else if (e.key === "?") {
				setShowFilters((v) => !v);
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [activeIndex, visible]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: activeIndex is needed to trigger scroll on navigation
	useEffect(() => {
		activeRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
	}, [activeIndex]);

	useEffect(() => {
		if (!hasMore || isLoading) return;
		const el = sentinelRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) setPage((p) => p + 1);
			},
			{ rootMargin: "300px" },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, [hasMore, isLoading]);

	return (
		<PullToRefresh onRefresh={() => mutate()} isRefreshing={isValidating}>
			<div className="relative flex min-h-dvh flex-col">
				<ScrollToTop />
				<Header
					isRefreshing={isValidating}
					onRefresh={() => mutate()}
					storyCount={filtered.length}
					filterOpen={showFilters}
					onToggleFilter={() => setShowFilters((v) => !v)}
					filterActive={isFilterActive}
				/>

				{/* Mobile backdrop */}
				<div
					hidden={!showFilters}
					className="backdrop-overlay fixed inset-0 z-30 bg-black/40 sm:hidden"
					onClick={() => setShowFilters(false)}
					aria-hidden
				/>

				<main
					id="main-content"
					className="mx-auto w-full max-w-4xl flex-1 space-y-4 px-4 py-4 sm:py-6"
				>
					{showFilters && (
						<FilterPanel
							filters={filters}
							onChange={handleFiltersChange}
							onReset={() => handleFiltersChange(DEFAULT_FILTERS)}
							totalCount={scored.length}
							visibleCount={filtered.length}
							onClose={() => setShowFilters(false)}
						/>
					)}
					{error && (
						<div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
							<AlertCircle className="h-4 w-4 shrink-0" />
							Failed to load stories. Check your connection and try refreshing.
						</div>
					)}

					{isLoading && (
						<div className="space-y-3">
							{Array.from({ length: 12 }).map((_, i) => (
								// biome-ignore lint/suspicious/noArrayIndexKey: skeletons have no identity
								<StorySkeleton key={i} />
							))}
						</div>
					)}

					{!isLoading && filtered.length === 0 && !error && (
						<div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
							<SearchX className="h-8 w-8 text-muted-foreground/40" />
							<p className="text-base font-medium text-muted-foreground">
								No stories match your filters.
							</p>
							<p className="text-sm text-muted-foreground/60">
								Try lowering the minimum score or clearing the keyword.
							</p>
						</div>
					)}

					{!isLoading && visible.length > 0 && (
						<div className="space-y-3">
							{visible.map((story, i) => (
								<div
									key={story.id}
									ref={i === activeIndex ? activeRef : null}
									style={
										{ "--card-index": Math.min(i, 8) } as React.CSSProperties
									}
								>
									<StoryCard
										story={story}
										rank={i + 1}
										isActive={i === activeIndex}
									/>
								</div>
							))}
						</div>
					)}

					{hasMore && (
						<div
							ref={sentinelRef}
							className="flex justify-center py-8 text-muted-foreground/30"
							aria-hidden
						>
							<Loader2 className="h-4 w-4 animate-spin" />
						</div>
					)}

					{!hasMore && visible.length > 0 && (
						<>
							<p className="pt-2 text-center text-xs text-muted-foreground/50">
								{filtered.length} stories
							</p>
							<div
								className="hidden items-center justify-center gap-x-5 pb-8 pt-3 text-xs text-muted-foreground/30 select-none sm:flex"
								aria-hidden
							>
								<span>
									<kbd>j</kbd> / <kbd>k</kbd> navigate
								</span>
								<span>
									<kbd>o</kbd> open link
								</span>
								<span>
									<kbd>c</kbd> comments
								</span>
								<span>
									<kbd>?</kbd> filters
								</span>
							</div>
						</>
					)}
				</main>

				{/* Toast */}
				<div
					hidden={!toastMsg}
					className="toast-pill fixed bottom-20 left-1/2 z-50 -translate-x-1/2 select-none rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background shadow-lg"
				>
					{toastMsg}
				</div>
			</div>
		</PullToRefresh>
	);
}
