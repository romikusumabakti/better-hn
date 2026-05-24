"use client";

import { Info } from "lucide-react";
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

interface FilterPanelProps {
	filters: FilterState;
	onChange: (filters: FilterState) => void;
	totalCount: number;
	visibleCount: number;
}

export function FilterPanel({
	filters,
	onChange,
	totalCount,
	visibleCount,
}: FilterPanelProps) {
	const exampleScore = (100 + 50) / (6 + 2) ** filters.alpha;

	return (
		<TooltipProvider>
			<div className="rounded-xl border border-border bg-card p-4 shadow-sm">
				<div className="grid gap-4 sm:grid-cols-3">
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
						<p className="text-[10px] text-muted-foreground">
							Example score (100pts, 50cmt, 6h ago):{" "}
							<span className="font-mono font-medium text-foreground">
								{exampleScore.toFixed(2)}
							</span>
						</p>
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
}
