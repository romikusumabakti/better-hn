"use client";

import { Info, RotateCcw, X } from "lucide-react";
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
}

export function FilterPanel({
	filters,
	onChange,
	onReset,
	totalCount,
	visibleCount,
	onClose,
}: FilterPanelProps) {
	const isModified =
		filters.alpha !== DEFAULTS.alpha ||
		filters.minScore !== DEFAULTS.minScore ||
		filters.query !== DEFAULTS.query;

	return (
		<TooltipProvider>
			<div className="@container fixed bottom-0 left-0 right-0 z-40 max-h-[85dvh] overflow-y-auto rounded-t-2xl border-t border-border bg-card p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom,0px))] shadow-xl animate-sheet-up sm:static sm:max-h-none sm:overflow-y-visible sm:rounded-xl sm:border sm:p-4 sm:pb-4 sm:shadow-sm">
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
										<Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
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
										<Info className="h-3.5 w-3.5 cursor-help text-muted-foreground" />
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
