"use client";

import { Info, RotateCcw, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

export interface FilterState {
	alpha: number;
	minScore: number;
	query: string;
}

const DEFAULTS: FilterState = { alpha: 0.8, minScore: 0, query: "" };

interface FilterPanelProps {
	filters: FilterState;
	onChange: (filters: FilterState) => void;
	onReset: () => void;
	totalCount: number;
	visibleCount: number;
	onOpenChange?: (open: boolean) => void;
	id?: string;
}

export function FilterPanel({
	filters,
	onChange,
	onReset,
	totalCount,
	visibleCount,
	onOpenChange,
	id = "filter-panel",
}: FilterPanelProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const onOpenChangeRef = useRef(onOpenChange);
	onOpenChangeRef.current = onOpenChange;
	const focusTrapRef = useRef<((e: KeyboardEvent) => void) | null>(null);

	useEffect(() => {
		const panel = panelRef.current;
		if (!panel) return;

		const handleToggle = (e: Event) => {
			const te = e as ToggleEvent;
			onOpenChangeRef.current?.(te.newState === "open");
			if (te.newState === "open") {
				const first = panel.querySelector<HTMLInputElement>("#keyword-search");
				(first ?? panel).focus();

				const trapFocus = (evt: KeyboardEvent) => {
					if (evt.key !== "Tab") return;
					const focusable = Array.from(
						panel.querySelectorAll<HTMLElement>(
							'button:not([disabled]), input:not([disabled]), [tabindex]:not([tabindex="-1"])',
						),
					);
					if (!focusable.length) return;
					const firstEl = focusable[0];
					const lastEl = focusable[focusable.length - 1];
					if (evt.shiftKey && document.activeElement === firstEl) {
						evt.preventDefault();
						lastEl.focus();
					} else if (!evt.shiftKey && document.activeElement === lastEl) {
						evt.preventDefault();
						firstEl.focus();
					}
				};

				focusTrapRef.current = trapFocus;
				panel.addEventListener("keydown", trapFocus);
			} else {
				if (focusTrapRef.current) {
					panel.removeEventListener("keydown", focusTrapRef.current);
					focusTrapRef.current = null;
				}
				document.getElementById("filter-toggle")?.focus();
			}
		};

		panel.addEventListener("toggle", handleToggle);
		return () => {
			panel.removeEventListener("toggle", handleToggle);
			if (focusTrapRef.current) {
				panel.removeEventListener("keydown", focusTrapRef.current);
				focusTrapRef.current = null;
			}
		};
	}, []);

	const isModified =
		filters.alpha !== DEFAULTS.alpha ||
		filters.minScore !== DEFAULTS.minScore ||
		filters.query !== DEFAULTS.query;

	return (
		<TooltipProvider>
			<div
				id={id}
				ref={panelRef}
				role="dialog"
				aria-label="Filters"
				aria-modal="true"
				tabIndex={-1}
				popover="auto"
				className="@container bg-card text-foreground outline-none"
			>
				{/* Mobile drag handle */}
				<div className="mx-auto mb-4 h-1 w-8 rounded-full bg-border sm:hidden" />

				<div className="mb-3 flex items-center justify-between">
					<span className="text-sm font-medium text-muted-foreground">
						Filters
					</span>
					<div className="flex items-center gap-2">
						{isModified && (
							<button
								type="button"
								onClick={onReset}
								className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
							>
								<RotateCcw className="h-3 w-3" />
								Reset
							</button>
						)}
						<button
							type="button"
							onClick={() => {
								(
									panelRef.current as HTMLElement & {
										hidePopover(): void;
									}
								)?.hidePopover();
							}}
							className="flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
							aria-label="Close filters"
						>
							<X className="h-4 w-4" />
						</button>
					</div>
				</div>

				<div className="grid gap-4 @sm:grid-cols-3">
					{/* Alpha */}
					<div className="space-y-2.5">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1.5">
								<span
									id="alpha-label"
									className="text-sm font-medium text-foreground"
								>
									Decay rate (α)
								</span>
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											type="button"
											className="cursor-help rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
										>
											<Info className="h-3.5 w-3.5" aria-hidden />
											<span className="sr-only">About decay rate formula</span>
										</button>
									</TooltipTrigger>
									<TooltipContent side="top" className="max-w-60">
										<p className="text-xs">
											Controls how fast older posts lose score.
											<br />
											Formula: (points + comments) / (hours + 2)^α
											<br />
											Higher α = newer stories ranked higher.
										</p>
									</TooltipContent>
								</Tooltip>
							</div>
							<span className="font-mono text-sm font-semibold text-primary">
								{filters.alpha.toFixed(2)}
							</span>
						</div>
						<Slider
							aria-labelledby="alpha-label"
							min={0.1}
							max={2.0}
							step={0.05}
							value={[filters.alpha]}
							onValueChange={([v]) =>
								onChange({ ...filters, alpha: Number(v.toFixed(2)) })
							}
							className="w-full"
						/>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>0.1 (slow decay)</span>
							<span>2.0 (fast decay)</span>
						</div>
					</div>

					{/* Min score */}
					<div className="space-y-2.5">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-1.5">
								<span
									id="min-score-label"
									className="text-sm font-medium text-foreground"
								>
									Min score
								</span>
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											type="button"
											className="cursor-help rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
										>
											<Info className="h-3.5 w-3.5" aria-hidden />
											<span className="sr-only">
												About minimum score filter
											</span>
										</button>
									</TooltipTrigger>
									<TooltipContent side="top">
										<p className="text-xs">
											Hide stories with a computed score below this threshold.
										</p>
									</TooltipContent>
								</Tooltip>
							</div>
							<span className="font-mono text-sm font-semibold text-primary">
								{filters.minScore.toFixed(1)}
							</span>
						</div>
						<Slider
							aria-labelledby="min-score-label"
							min={0}
							max={100}
							step={0.5}
							value={[filters.minScore]}
							onValueChange={([v]) =>
								onChange({ ...filters, minScore: Number(v.toFixed(1)) })
							}
							className="w-full"
						/>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>0 (show all)</span>
							<span>100 (high bar)</span>
						</div>
					</div>

					{/* Search */}
					<div className="space-y-2.5">
						<div className="flex items-center justify-between">
							<label
								htmlFor="keyword-search"
								className="text-sm font-medium text-foreground"
							>
								Filter by keyword
							</label>
							<span className="font-mono text-xs text-muted-foreground">
								{visibleCount}/{totalCount}
							</span>
						</div>
						<Input
							id="keyword-search"
							placeholder="title, domain, author..."
							value={filters.query}
							onChange={(e) => onChange({ ...filters, query: e.target.value })}
							className="h-9 text-sm"
						/>
					</div>
				</div>

				<div className="mt-4 border-t border-border pt-3">
					<p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground/60">
						Keyboard shortcuts
					</p>
					<div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-muted-foreground/60">
						<span>
							<kbd>j</kbd> / <kbd>k</kbd> — navigate
						</span>
						<span>
							<kbd>o</kbd> — open link
						</span>
						<span>
							<kbd>c</kbd> — comments
						</span>
						<span>
							<kbd>?</kbd> — toggle panel
						</span>
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
}
