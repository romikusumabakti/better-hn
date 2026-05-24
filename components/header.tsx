"use client";

import { Moon, RefreshCw, SlidersHorizontal, Sun, Zap } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
	isRefreshing?: boolean;
	onRefresh?: () => void;
	storyCount?: number;
	filterOpen?: boolean;
	onToggleFilter?: () => void;
	filterActive?: boolean;
}

export function Header({ isRefreshing, onRefresh, storyCount, filterOpen, onToggleFilter, filterActive }: HeaderProps) {
	const { theme, setTheme } = useTheme();

	return (
		<header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-xl">
			<div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
				<div className="flex items-center gap-2.5">
					<div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
						<Zap
							className="h-4 w-4 text-primary-foreground"
							strokeWidth={2.5}
						/>
					</div>
					<div className="flex items-baseline gap-1.5">
						<span className="font-semibold tracking-tight text-foreground">
							Better HN
						</span>
						{storyCount !== undefined && (
							<span className="font-mono text-xs text-muted-foreground">
								{storyCount} stories
							</span>
						)}
					</div>
				</div>

				<div className="flex items-center gap-1">
					{onToggleFilter && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onToggleFilter}
							className={cn(
								"relative h-8 w-8 text-muted-foreground hover:text-foreground",
								filterOpen && "text-foreground bg-accent",
							)}
						>
							<SlidersHorizontal className="h-4 w-4" />
							{filterActive && (
								<span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
							)}
							<span className="sr-only">Toggle filters</span>
						</Button>
					)}
					{onRefresh && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onRefresh}
							disabled={isRefreshing}
							className="h-8 w-8 text-muted-foreground hover:text-foreground"
						>
							<RefreshCw
								className={cn("h-4 w-4", isRefreshing && "animate-spin")}
							/>
							<span className="sr-only">Refresh stories</span>
						</Button>
					)}
					<Button
						variant="ghost"
						size="icon"
						onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
						className="h-8 w-8 text-muted-foreground hover:text-foreground"
					>
						<Sun className="h-4 w-4 scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
						<Moon className="absolute h-4 w-4 scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
						<span className="sr-only">Toggle theme</span>
					</Button>
				</div>
			</div>
		</header>
	);
}
