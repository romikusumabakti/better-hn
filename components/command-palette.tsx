"use client";

import { ArrowRight, ExternalLink, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ScoredStory } from "@/lib/hn-api";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
	open: boolean;
	onClose: () => void;
	stories: ScoredStory[];
}

export function CommandPalette({ open, onClose, stories }: CommandPaletteProps) {
	const router = useRouter();
	const [query, setQuery] = useState("");
	const [selectedIndex, setSelectedIndex] = useState(0);
	const inputRef = useRef<HTMLInputElement>(null);
	const dialogRef = useRef<HTMLDialogElement>(null);

	const filtered = query.trim()
		? stories
				.filter(
					(s) =>
						s.title.toLowerCase().includes(query.toLowerCase()) ||
						(s.domain?.toLowerCase().includes(query.toLowerCase()) ?? false) ||
						s.by.toLowerCase().includes(query.toLowerCase()),
				)
				.slice(0, 8)
		: stories.slice(0, 8);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		if (open) {
			if (!dialog.open) dialog.showModal();
			setQuery("");
			setSelectedIndex(0);
			requestAnimationFrame(() => inputRef.current?.focus());
		} else if (dialog.open) {
			dialog.close();
		}
	}, [open]);

	useEffect(() => {
		const dialog = dialogRef.current;
		if (!dialog) return;
		const handleClose = () => onClose();
		dialog.addEventListener("close", handleClose);
		return () => dialog.removeEventListener("close", handleClose);
	}, [onClose]);

	const navigate = useCallback(
		(story: ScoredStory) => {
			router.push(`/story/${story.id}`);
			onClose();
		},
		[router, onClose],
	);

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (e.key === "ArrowDown") {
			e.preventDefault();
			setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setSelectedIndex((i) => Math.max(i - 1, 0));
		} else if (e.key === "Enter") {
			e.preventDefault();
			const story = filtered[selectedIndex];
			if (story) navigate(story);
		}
	};

	const handleQueryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setQuery(e.target.value);
		setSelectedIndex(0);
	};

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: clicking the dialog backdrop (outside content) closes it; Escape key is natively handled by showModal()
		<dialog
			ref={dialogRef}
			className="command-palette bg-card text-foreground border border-border shadow-2xl outline-none p-0"
			onClick={(e) => {
				if (e.target === dialogRef.current) onClose();
			}}
		>
			{/* Search input */}
			<div className="flex items-center gap-3 border-b border-border px-4 py-3">
				<Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
				<input
					ref={inputRef}
					value={query}
					onChange={handleQueryChange}
					onKeyDown={handleKeyDown}
					placeholder="Search stories..."
					className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/50"
					aria-label="Search stories"
					autoComplete="off"
					spellCheck={false}
				/>
				<kbd className="hidden text-xs text-muted-foreground/40 sm:inline">esc</kbd>
			</div>

			{/* Results */}
			{filtered.length > 0 ? (
				<ul
					aria-label="Story results"
					className="max-h-[min(50dvh,380px)] overflow-y-auto py-1.5"
				>
					{filtered.map((story, i) => (
						<li key={story.id}>
							<button
								type="button"
								onClick={() => navigate(story)}
								onMouseEnter={() => setSelectedIndex(i)}
								aria-current={i === selectedIndex ? true : undefined}
								className={cn(
									"flex w-full items-start gap-3 px-4 py-2.5 text-left transition-colors",
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
							</button>
						</li>
					))}
				</ul>
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
					<kbd>↵</kbd> open comments
				</span>
				<span>
					<kbd>esc</kbd> close
				</span>
			</div>
		</dialog>
	);
}
