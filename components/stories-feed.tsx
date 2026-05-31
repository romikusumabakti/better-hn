"use client";

import { AlertCircle, Loader2, SearchX } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import { CommandPalette } from "@/components/command-palette";
import { FilterPanel, type FilterState } from "@/components/filter-panel";
import { Header } from "@/components/header";
import { PullToRefresh } from "@/components/pull-to-refresh";
import { ScrollToTop } from "@/components/scroll-to-top";
import { StoryCard } from "@/components/story-card";
import { Skeleton } from "@/components/ui/skeleton";
import type { HNStory, ScoredStory } from "@/lib/hn-api";
import { scoreStories } from "@/lib/hn-api";
import { isWindows } from "@/lib/utils";

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
				<div className="shrink-0 w-6" />
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

function parseFiltersFromURL(
	sp: ReturnType<typeof useSearchParams>,
): Partial<FilterState> {
	const out: Partial<FilterState> = {};
	const alpha = parseFloat(sp.get("alpha") ?? "");
	if (!Number.isNaN(alpha) && alpha >= 0.1 && alpha <= 2.0) out.alpha = alpha;
	const min = parseFloat(sp.get("min") ?? "");
	if (!Number.isNaN(min) && min >= 0) out.minScore = min;
	const q = sp.get("q");
	if (q) out.query = q;
	return out;
}

export function StoriesFeed() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [activeIndex, setActiveIndex] = useState(-1);
	const activeRef = useRef<HTMLLIElement | null>(null);
	const sentinelRef = useRef<HTMLDivElement | null>(null);
	const urlUpdateTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

	// URL params take precedence over localStorage on initial load
	const hasURLParams = useRef(
		searchParams.has("alpha") ||
			searchParams.has("min") ||
			searchParams.has("q"),
	);

	const [filters, setFilters] = useState<FilterState>(() => ({
		...DEFAULT_FILTERS,
		...parseFiltersFromURL(searchParams),
	}));

	// Load localStorage only when no URL params present
	useEffect(() => {
		if (hasURLParams.current) return;
		try {
			const stored = localStorage.getItem("hn-filters");
			if (stored) setFilters((prev) => ({ ...prev, ...JSON.parse(stored) }));
		} catch {}
	}, []);

	useEffect(() => {
		try {
			const stored = JSON.parse(localStorage.getItem("hn-visited") || "[]") as number[];
			if (stored.length > 0) setVisitedIds(new Set(stored));
		} catch {}
	}, []);

	const [filterOpen, setFilterOpen] = useState(false);
	const [paletteOpen, setPaletteOpen] = useState(false);
	const [page, setPage] = useState(1);
	const [liveMsg, setLiveMsg] = useState("");

	// Toast
	const [toastMsg, setToastMsg] = useState<string | null>(null);
	const prevValidatingRef = useRef(false);

	const [visitedIds, setVisitedIds] = useState<Set<number>>(new Set());

	const markVisited = useCallback((id: number) => {
		setVisitedIds((prev) => {
			if (prev.has(id)) return prev;
			const next = new Set(prev);
			next.add(id);
			try {
				localStorage.setItem(
					"hn-visited",
					JSON.stringify([...next].slice(-500)),
				);
			} catch {}
			return next;
		});
	}, []);

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

	const handleFiltersChange = useCallback(
		(next: FilterState) => {
			setFilters(next);
			setPage(1);
			try {
				localStorage.setItem("hn-filters", JSON.stringify(next));
			} catch {}

			// Debounce URL update (avoids rapid pushes while typing in query)
			if (urlUpdateTimer.current) clearTimeout(urlUpdateTimer.current);
			urlUpdateTimer.current = setTimeout(() => {
				const params = new URLSearchParams();
				if (next.alpha !== DEFAULT_FILTERS.alpha)
					params.set("alpha", String(next.alpha));
				if (next.minScore !== DEFAULT_FILTERS.minScore)
					params.set("min", String(next.minScore));
				if (next.query) params.set("q", next.query);
				const qs = params.toString();
				router.replace(qs ? `/?${qs}` : "/", { scroll: false });
			}, 300);
		},
		[router],
	);

	const activeFilterCount =
		(filters.alpha !== DEFAULT_FILTERS.alpha ? 1 : 0) +
		(filters.minScore !== DEFAULT_FILTERS.minScore ? 1 : 0) +
		(filters.query !== DEFAULT_FILTERS.query ? 1 : 0);

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
			// ⌘K / Ctrl+K: open command palette from anywhere
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				setPaletteOpen((prev) => !prev);
				return;
			}

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
				if (story) router.push(`/story/${story.id}`);
			} else if (e.key === "?") {
				const panel = document.getElementById("filter-panel") as
					| (HTMLElement & {
							showPopover(): void;
							hidePopover(): void;
					  })
					| null;
				if (panel?.matches(":popover-open")) {
					panel.hidePopover();
				} else {
					panel?.showPopover();
				}
			}
		};
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [activeIndex, visible, router]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: activeIndex is needed to trigger scroll on navigation
	useEffect(() => {
		activeRef.current?.scrollIntoView({ block: "nearest", behavior: "instant" });
	}, [activeIndex]);

	// Announce new stories to screen readers when infinite scroll loads more
	useEffect(() => {
		if (page > 1 && visible.length > 0) {
			setLiveMsg(`Showing ${visible.length} of ${filtered.length} stories`);
		}
	}, [page, visible.length, filtered.length]);

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
		<>
			{/* Blocks clicks through ::backdrop on mobile (popover is non-modal by spec) */}
			<div
				hidden={!filterOpen}
				className="fixed inset-0 z-30 sm:hidden"
				aria-hidden="true"
			/>
			<PullToRefresh onRefresh={() => mutate()} isRefreshing={isValidating}>
				<div className="relative flex min-h-dvh flex-col">
					<ScrollToTop />
					<Header
						isRefreshing={isValidating}
						onRefresh={() => mutate()}
						storyCount={filtered.length}
						filterOpen={filterOpen}
						activeFilterCount={activeFilterCount}
					/>

					<main
						id="main-content"
						aria-busy={isLoading}
						className="mx-auto w-full max-w-4xl flex-1 space-y-4 px-4 pt-4 pb-24 sm:pt-6 sm:pb-8"
					>
						{error && (
							<div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
								<AlertCircle className="h-4 w-4 shrink-0" />
								Failed to load stories. Check your connection and try
								refreshing.
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
							<ol className="space-y-3 list-none" aria-label="Stories">
								{visible.map((story, i) => (
									<li
										key={story.id}
										ref={i === activeIndex ? activeRef : null}
										data-visited={visitedIds.has(story.id) ? "" : undefined}
										style={
											{
												"--card-index": Math.min(i, 8),
												contentVisibility: "auto",
												containIntrinsicSize: "auto 160px",
											} as React.CSSProperties
										}
									>
										<StoryCard
											story={story}
											rank={i + 1}
											isActive={i === activeIndex}
											onVisit={() => markVisited(story.id)}
											query={filters.query}
										/>
									</li>
								))}
							</ol>
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
							<p className="pt-2 text-center text-xs text-muted-foreground/50">
								{filtered.length} stories
							</p>
						)}
						{visible.length > 0 && (
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
								<span>
									<kbd suppressHydrationWarning>{typeof navigator !== "undefined" && !isWindows() ? "⌘" : "Ctrl"}K</kbd> search
								</span>
							</div>
						)}
					</main>

					{/* Screen-reader announcements (always in DOM for aria-live to work) */}
					<div role="status" aria-live="polite" className="sr-only">
						{toastMsg}
					</div>
					<div
						role="status"
						aria-live="polite"
						aria-atomic="true"
						className="sr-only"
					>
						{liveMsg}
					</div>

					{/* Visual toast (aria-hidden — announcement handled above) */}
					<div
						hidden={!toastMsg}
						aria-hidden="true"
						className="toast-pill fixed left-1/2 z-50 -translate-x-1/2 select-none rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background shadow-lg"
					style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 5.5rem)" }}
					>
						{toastMsg}
					</div>
				</div>
			</PullToRefresh>
			<FilterPanel
				id="filter-panel"
				filters={filters}
				onChange={handleFiltersChange}
				onReset={() => handleFiltersChange(DEFAULT_FILTERS)}
				totalCount={scored.length}
				visibleCount={filtered.length}
				onOpenChange={setFilterOpen}
			/>
			<CommandPalette
				open={paletteOpen}
				onClose={() => setPaletteOpen(false)}
				stories={scored}
			/>
		</>
	);
}
