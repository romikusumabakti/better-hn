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
	filterActive?: boolean;
}

export function Header({
	isRefreshing,
	onRefresh,
	storyCount,
	filterOpen,
	filterActive,
}: HeaderProps) {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

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
					{filterActive !== undefined && (
						<Button
							id="filter-toggle"
							variant="ghost"
							size="icon"
							aria-expanded={filterOpen}
							aria-haspopup="dialog"
							aria-controls="filter-panel"
							popoverTarget="filter-panel"
							popoverTargetAction="toggle"
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
					<div className="flex items-center gap-0.5 rounded-lg border border-border bg-muted/40 p-0.5">
						{(
							[
								{ value: "light", Icon: Sun, label: "Light theme" },
								{ value: "system", Icon: Monitor, label: "System theme" },
								{ value: "dark", Icon: Moon, label: "Dark theme" },
							] as const
						).map(({ value, Icon, label }) => (
							<Button
								key={value}
								variant="ghost"
								size="icon"
								onClick={() => setTheme(value)}
								aria-label={label}
								aria-pressed={mounted && theme === value}
								className={cn(
									"h-7 w-7 text-muted-foreground hover:text-foreground",
									mounted &&
										theme === value &&
										"bg-background text-foreground shadow-sm",
								)}
							>
								<Icon className="h-3.5 w-3.5" />
							</Button>
						))}
					</div>
				</div>
			</div>
		</header>
	);
}
