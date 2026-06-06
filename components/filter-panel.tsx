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
	maxScore?: number;
	onOpenChange?: (open: boolean) => void;
	id?: string;
}

export function FilterPanel({
	filters,
	onChange,
	onReset,
	totalCount,
	visibleCount,
	maxScore = 100,
	onOpenChange,
	id = "filter-panel",
}: FilterPanelProps) {
	// Round up to a clean slider ceiling; never below 100 so the control
	// stays stable when the feed's top score is low.
	const scoreMax = Math.max(100, Math.ceil(maxScore / 10) * 10);
	const panelRef = useRef<HTMLDivElement>(null);
	const onOpenChangeRef = useRef(onOpenChange);
	onOpenChangeRef.current = onOpenChange;

	useEffect(() => {
		const panel = panelRef.current;
		if (!panel) return;

		// Non-modal popover: no JS focus trap (that would contradict
		// aria-modal="false"). Native popover="auto" handles Esc,
		// light-dismiss, and returning focus to the trigger on close.
		// We only move focus into the search field on open.
		const handleToggle = (e: Event) => {
			const te = e as ToggleEvent;
			onOpenChangeRef.current?.(te.newState === "open");
			if (te.newState === "open") {
				const first = panel.querySelector<HTMLInputElement>("#keyword-search");
				(first ?? panel).focus();
			}
		};

		panel.addEventListener("toggle", handleToggle);
		return () => {
			panel.removeEventListener("toggle", handleToggle);
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
				aria-modal="false"
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
							className="filter-close flex h-8 w-8 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
									Freshness
								</span>
								<Tooltip>
									<TooltipTrigger asChild>
										<button
											type="button"
											className="cursor-help rounded text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
										>
											<Info className="h-3.5 w-3.5" aria-hidden />
											<span className="sr-only">About freshness setting</span>
										</button>
									</TooltipTrigger>
									<TooltipContent side="top" className="max-w-60">
										<p className="text-xs">
											How quickly older stories lose ranking weight.
											<br />
											Low = classic stories can resurface.
											<br />
											High = latest stories ranked first.
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
							<span>Timeless</span>
							<span>Latest first</span>
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
							max={scoreMax}
							step={0.5}
							value={[filters.minScore]}
							onValueChange={([v]) =>
								onChange({ ...filters, minScore: Number(v.toFixed(1)) })
							}
							className="w-full"
						/>
						<div className="flex justify-between text-xs text-muted-foreground">
							<span>0 (show all)</span>
							<span>{scoreMax} (high bar)</span>
						</div>
					</div>

					{/* Search */}
					<search className="space-y-2.5">
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
							type="search"
							placeholder="title, domain, author..."
							value={filters.query}
							onChange={(e) => onChange({ ...filters, query: e.target.value })}
							className="h-9 text-sm"
						/>
					</search>
				</div>
			</div>
		</TooltipProvider>
	);
}
