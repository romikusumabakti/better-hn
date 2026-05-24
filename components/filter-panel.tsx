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
	onClose?: () => void;
	id?: string;
}

export function FilterPanel({
	filters,
	onChange,
	onReset,
	totalCount,
	visibleCount,
	onClose,
	id = "filter-panel",
}: FilterPanelProps) {
	const panelRef = useRef<HTMLDivElement>(null);
	const onCloseRef = useRef(onClose);
	onCloseRef.current = onClose;

	useEffect(() => {
		const panel = panelRef.current;
		if (!panel) return;

		panel.focus();

		const FOCUSABLE =
			'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

		let closedByKeyboard = false;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.preventDefault();
				closedByKeyboard = true;
				onCloseRef.current?.();
				return;
			}
			if (e.key !== "Tab") return;

			const focusable = Array.from(
				panel.querySelectorAll<HTMLElement>(FOCUSABLE),
			);
			if (focusable.length === 0) return;

			const first = focusable[0];
			const last = focusable[focusable.length - 1];

			if (e.shiftKey && document.activeElement === first) {
				e.preventDefault();
				last.focus();
			} else if (!e.shiftKey && document.activeElement === last) {
				e.preventDefault();
				first.focus();
			}
		};

		const handleClickOutside = (e: MouseEvent) => {
			if (window.innerWidth < 640) return;
			const toggle = document.getElementById("filter-toggle");
			if (
				!panel.contains(e.target as Node) &&
				!toggle?.contains(e.target as Node)
			) {
				onCloseRef.current?.();
			}
		};

		panel.addEventListener("keydown", handleKeyDown);
		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			panel.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("mousedown", handleClickOutside);
			if (closedByKeyboard) {
				document.getElementById("filter-toggle")?.focus();
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
				className="@container fixed bottom-0 left-0 right-0 z-40 max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] shadow-xl animate-sheet-up outline-none sm:absolute sm:bottom-auto sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:z-50 sm:max-h-none sm:overflow-visible sm:rounded-xl sm:border sm:p-4 sm:pb-4 sm:shadow-xl sm:w-80 sm:animate-slide-down"
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
						{onClose && (
							<button
								type="button"
								onClick={onClose}
								className="flex h-6 w-6 items-center justify-center rounded text-muted-foreground transition-colors hover:text-foreground sm:hidden"
								aria-label="Close filters"
							>
								<X className="h-4 w-4" />
							</button>
						)}
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
						<div className="flex justify-between text-[10px] text-muted-foreground">
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
						<div className="flex justify-between text-[10px] text-muted-foreground">
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
			</div>
		</TooltipProvider>
	);
}
