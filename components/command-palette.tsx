"use client";

import { ArrowRight, ExternalLink, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import {
	Fragment,
	useCallback,
	useEffect,
	useId,
	useMemo,
	useRef,
	useState,
} from "react";
import type { ScoredStory } from "@/lib/hn-api";
import { cn } from "@/lib/utils";

const RECENT_KEY = "hn-recent";
const MAX_RECENT = 5;

function loadRecent(): number[] {
	try {
		return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
	} catch {
		return [];
	}
}

function pushRecent(id: number) {
	try {
		const prev = loadRecent().filter((x) => x !== id);
		localStorage.setItem(
			RECENT_KEY,
			JSON.stringify([id, ...prev].slice(0, MAX_RECENT)),
		);
	} catch {}
}

function closeWithAnimation(dialog: HTMLDialogElement) {
	if (!dialog.open || dialog.hasAttribute("data-closing")) return;
	const prefersReduced = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	if (prefersReduced) {
		dialog.close();
		return;
	}
	dialog.setAttribute("data-closing", "");
	let done = false;
	const cleanup = () => {
		if (done) return;
		done = true;
		dialog.removeAttribute("data-closing");
		dialog.close();
	};
	const t = setTimeout(cleanup, 200);
	dialog.addEventListener(
		"transitionend",
		(e) => {
			if (e.target === dialog) {
				clearTimeout(t);
				cleanup();
			}
		},
		{ once: true },
	);
}

function fuzzyScore(text: string, query: string): number {
	const t = text.toLowerCase();
	const q = query.toLowerCase();
	if (t.includes(q)) return q.length * 10;
	let tIdx = 0;
	let score = 0;
	let consecutive = 0;
	for (let i = 0; i < q.length; i++) {
		const found = t.indexOf(q[i], tIdx);
		if (found === -1) return -1;
		consecutive = found === tIdx ? consecutive + 1 : 0;
		score += consecutive + 1;
		tIdx = found + 1;
	}
	return score;
}

interface CommandPaletteProps {
	open: boolean;
	onClose: () => void;
	stories: ScoredStory[];
}

export function CommandPalette({
	open,
	onClose,
	stories,
}: CommandPaletteProps) {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [recentIds, setRecentIds] = useState<number[]>([]);
	const inputRef = useRef<HTMLInputElement>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);
	const listboxId = useId();

	const recentStories = useMemo(() => {
		if (query.trim()) return [];
		return recentIds
			.map((id) => stories.find((s) => s.id === id))
			.filter((s): s is ScoredStory => s !== undefined);
	}, [query, stories, recentIds]);

	const allMatches = useMemo(() => {
		const q = query.trim();
		if (!q) {
			const recentSet = new Set(recentIds);
			return stories.filter((s) => !recentSet.has(s.id)).slice(0, 5);
		}
		return stories
			.map((s) => {
				const score = Math.max(
					fuzzyScore(s.title, q),
					s.domain ? fuzzyScore(s.domain, q) : -1,
					fuzzyScore(s.by, q),
				);
				return { s, score };
			})
			.filter(({ score }) => score >= 0)
			.sort((a, b) => b.score - a.score)
			.map(({ s }) => s);
	}, [query, stories, recentIds]);

	const topStories = allMatches.slice(0, 15);
	const totalMatches = allMatches.length;

	// Flat ordered list for keyboard navigation: recent first, then top
	const displayedItems = useMemo(
		() => (query.trim() ? topStories : [...recentStories, ...topStories]),
		[query, topStories, recentStories],
	);

	const activeDescendantId =
		displayedItems.length > 0
			? `${listboxId}-option-${selectedIndex}`
			: undefined;

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open) {
			if (!dialog.open) dialog.showModal();
			setQuery("");
			setSelectedIndex(0);
			setRecentIds(loadRecent());
			requestAnimationFrame(() => inputRef.current?.focus());
		} else {
			closeWithAnimation(dialog);
		}
	}, [open]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		const handleClose = () => onClose();
		const handleCancel = (e: Event) => {
			e.preventDefault();
			closeWithAnimation(dialog);
		};
		dialog.addEventListener("close", handleClose);
		dialog.addEventListener("cancel", handleCancel);
		return () => {
			dialog.removeEventListener("close", handleClose);
			dialog.removeEventListener("cancel", handleCancel);
		};
	}, [onClose]);

	const navigate = useCallback(
		(story: ScoredStory) => {
			pushRecent(story.id);
			router.push(`/story/${story.id}`);
			onClose();
		},
		[router, onClose],
	);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((i) => Math.min(i + 1, displayedItems.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((i) => Math.max(i - 1, 0));
		} else if (e.key === "Enter") {
			e.preventDefault();
			const story = displayedItems[selectedIndex];
			if (story) navigate(story);
		} else if (e.key === "Tab") {
			// Tab opens external link for selected story (if any)
			const story = displayedItems[selectedIndex];
			if (story?.url) {
				e.preventDefault();
				window.open(story.url, "_blank", "noopener,noreferrer");
				onClose();
			}
		}
	};

	const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
		setSelectedIndex(0);
	};

	const hasResults = displayedItems.length > 0;
	const showSections = !query.trim() && recentStories.length > 0;

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: clicking the dialog backdrop (outside content) closes it; Escape key is natively handled by showModal()
		<dialog
			ref={dialogRef}
			aria-label="Search stories"
			className="command-palette bg-card text-foreground border border-border shadow-2xl outline-none p-0"
			onClick={(e) => {
				if (e.target === dialogRef.current && dialogRef.current) {
					closeWithAnimation(dialogRef.current);
				}
			}}
		>
			{/* SR-only live region: announces result count on query change */}
			<div
				role="status"
				aria-live="polite"
				aria-atomic="true"
				className="sr-only"
			>
				{displayedItems.length > 0
					? `${displayedItems.length} result${displayedItems.length === 1 ? "" : "s"}`
					: query.trim()
						? "No results"
						: ""}
			</div>

			{/* Combobox — keyboard navigation stays on input, aria-activedescendant tracks selection */}
			<div className="flex items-center gap-3 border-b border-border px-4 py-3">
				<Search
					className="h-4 w-4 shrink-0 text-muted-foreground"
					aria-hidden
				/>
				<input
					ref={inputRef}
					role="combobox"
					aria-expanded={displayedItems.length > 0}
					aria-controls={listboxId}
					aria-activedescendant={activeDescendantId}
					aria-autocomplete="list"
					aria-label="Search stories"
					value={query}
					onChange={handleQueryChange}
					onKeyDown={handleKeyDown}
					placeholder="Search stories..."
					className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
					autoComplete="off"
					spellCheck={false}
				/>
				<kbd className="hidden text-xs text-muted-foreground/40 sm:inline">
					esc
				</kbd>
			</div>

			{/* Results */}
			{hasResults ? (
				<div
					role="listbox"
					id={listboxId}
					aria-label="Story results"
					className="max-h-[min(50dvh,380px)] overflow-y-auto py-1.5"
				>
					{showSections && (
						<div
							role="presentation"
							aria-hidden
							className="px-4 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/40 select-none"
						>
							Recent
						</div>
					)}
					{displayedItems.map((story, i) => {
						const isFirstTop = showSections && i === recentStories.length;
						return (
							<Fragment key={story.id}>
								{isFirstTop && (
									<div
										role="presentation"
										aria-hidden
										className="px-4 pb-1 pt-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/40 select-none"
									>
										Top stories
									</div>
								)}
								{/* biome-ignore lint/a11y/useKeyWithClickEvents: keyboard handled by combobox input via aria-activedescendant + Enter */}
								{/* biome-ignore lint/a11y/useFocusableInteractive: combobox options use aria-activedescendant pattern, not tab focus */}
								<div
									role="option"
									id={`${listboxId}-option-${i}`}
									aria-selected={i === selectedIndex}
									onClick={() => navigate(story)}
									onMouseEnter={() => setSelectedIndex(i)}
									className={cn(
										"flex w-full cursor-pointer items-start gap-3 px-4 py-2.5 transition-colors",
										i === selectedIndex ? "bg-accent" : "",
									)}
								>
									<div className="min-w-0 flex-1">
										<p className="line-clamp-1 text-sm font-medium text-foreground">
											{story.title}
										</p>
										<p className="mt-0.5 text-xs text-muted-foreground">
											{story.domain && (
												<span className="font-mono">{story.domain} · </span>
											)}
											{story.score} pts · {story.by}
										</p>
									</div>
									{story.url && (
										<button
											type="button"
											tabIndex={-1}
											onClick={(e) => {
												e.stopPropagation();
												window.open(story.url, "_blank", "noopener,noreferrer");
												onClose();
											}}
											className="mt-0.5 shrink-0 rounded p-1 text-muted-foreground/40 transition-colors hover:bg-background hover:text-foreground"
											aria-label={`Open ${story.domain ?? "link"} in new tab`}
										>
											<ExternalLink className="h-3.5 w-3.5" />
										</button>
									)}
									<ArrowRight
										className={cn(
											"mt-1 h-3 w-3 shrink-0 transition-opacity",
											i === selectedIndex
												? "text-muted-foreground opacity-60"
												: "opacity-0",
										)}
										aria-hidden
									/>
								</div>
							</Fragment>
						);
					})}
				</div>
			) : query.trim() ? (
				<div className="flex items-center justify-center py-12 text-sm text-muted-foreground">
					No stories match &ldquo;{query}&rdquo;
				</div>
			) : null}

			{/* Footer shortcuts */}
			<div className="flex select-none items-center gap-4 border-t border-border px-4 py-2 text-xs text-muted-foreground/40">
				<span>
					<kbd>↑↓</kbd> navigate
				</span>
				<span>
					<kbd>↵</kbd> open story
				</span>
				<span>
					<kbd>tab</kbd> open link
				</span>
				<span>
					<kbd>esc</kbd> close
				</span>
				{!query.trim() && totalMatches > topStories.length && (
					<span className="ml-auto">
						{topStories.length} of {totalMatches}
					</span>
				)}
				{query.trim() && totalMatches > topStories.length && (
					<span className="ml-auto">
						{topStories.length} of {totalMatches}
					</span>
				)}
			</div>
		</dialog>
	);
}
