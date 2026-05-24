"use client";

import {
	Monitor,
	Moon,
	RefreshCw,
	SlidersHorizontal,
	Sun,
	Zap,
} from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
	isRefreshing?: boolean;
	onRefresh?: () => void;
	storyCount?: number;
	filterOpen?: boolean;
	onToggleFilter?: () => void;
	filterActive?: boolean;
	filterPanel?: React.ReactNode;
}

export function Header({
	isRefreshing,
	onRefresh,
	storyCount,
	filterOpen,
	onToggleFilter,
	filterActive,
	filterPanel,
}: HeaderProps) {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	const cycleTheme = () => {
		const next = { light: "dark", dark: "system", system: "light" } as const;
		setTheme(next[theme as keyof typeof next] ?? "system");
	};

	const ThemeIcon = !mounted
		? Sun
		: theme === "dark"
			? Moon
			: theme === "system"
				? Monitor
				: Sun;

	return (
		<header
			className="sticky top-0 z-50 border-b border-border/50 bg-background/92 backdrop-blur-md"
			style={{ viewTransitionName: "site-header" }}
		>
			<div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
				<Link
					href="/"
					className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
				>
					<div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary">
						<Zap
							className="h-4 w-4 text-primary-foreground"
							strokeWidth={2.5}
						/>
					</div>
					<div className="flex items-center gap-2">
						<span className="font-semibold tracking-tight text-foreground">
							Better HN
						</span>
						{storyCount !== undefined && (
							<>
								<span className="h-3.5 w-px bg-border" aria-hidden />
								<span className="font-mono text-xs text-muted-foreground tabular-nums">
									{storyCount}
								</span>
							</>
						)}
					</div>
				</Link>

				<div className="flex items-center gap-1">
					{onToggleFilter && (
						<div className="relative">
							<Button
								id="filter-toggle"
								variant="ghost"
								size="icon"
								onClick={onToggleFilter}
								aria-expanded={filterOpen}
								aria-haspopup="dialog"
								className={cn(
									"relative h-8 w-8 text-muted-foreground hover:text-foreground",
									filterOpen && "text-foreground bg-accent",
								)}
							>
								<SlidersHorizontal className="h-4 w-4" />
								{filterActive && (
									<span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary" />
								)}
								<span className="sr-only">Toggle filters (press ?)</span>
							</Button>
							<div className="hidden sm:block">{filterPanel}</div>
						</div>
					)}
					{onRefresh && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onRefresh}
							disabled={isRefreshing}
							className="hidden sm:inline-flex h-8 w-8 text-muted-foreground hover:text-foreground"
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
						onClick={cycleTheme}
						className="h-8 w-8 text-muted-foreground hover:text-foreground"
					>
						<ThemeIcon className="h-4 w-4 transition-all" />
						<span className="sr-only">
							{!mounted ? "Toggle theme" : `Theme: ${theme} (click to cycle)`}
						</span>
					</Button>
				</div>
			</div>
		</header>
	);
}
