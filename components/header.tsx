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
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
	isRefreshing?: boolean;
	onRefresh?: () => void;
	storyCount?: number;
	filterOpen?: boolean;
	activeFilterCount?: number;
}

export function Header({
	isRefreshing,
	onRefresh,
	storyCount,
	filterOpen,
	activeFilterCount,
}: HeaderProps) {
	const { theme, setTheme } = useTheme();
	const pathname = usePathname();
	const [mounted, setMounted] = useState(false);
	useEffect(() => setMounted(true), []);

	return (
		<header
			className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-lg"
			style={{ viewTransitionName: "site-header" }}
		>
			<div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
				<nav aria-label="Main">
					<Link
						href="/"
						aria-current={pathname === "/" ? "page" : undefined}
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
										<span className="sr-only">Stories: </span>
										{storyCount}
									</span>
								</>
							)}
						</div>
					</Link>
				</nav>

				<div className="flex items-center gap-1">
					{activeFilterCount !== undefined && (
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
								"relative h-10 w-10 text-muted-foreground hover:text-foreground",
								filterOpen && "text-foreground bg-accent",
							)}
						>
							<SlidersHorizontal className="h-4 w-4" />
							{activeFilterCount > 0 && (
								<span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold leading-none text-primary-foreground">
									{activeFilterCount}
								</span>
							)}
							<span className="sr-only">
								Toggle filters (press ?)
								{activeFilterCount > 0 ? ` — ${activeFilterCount} active` : ""}
							</span>
						</Button>
					)}
					{onRefresh && (
						<Button
							variant="ghost"
							size="icon"
							onClick={onRefresh}
							disabled={isRefreshing}
							className="hidden sm:inline-flex h-10 w-10 text-muted-foreground hover:text-foreground"
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
						onClick={() => {
							if (!mounted) return;
							setTheme(
								theme === "light"
									? "dark"
									: theme === "dark"
										? "system"
										: "light",
							);
						}}
						aria-label={
							mounted
								? `Theme: ${theme ?? "system"} — click to cycle`
								: "Toggle theme"
						}
						className="h-10 w-10 text-muted-foreground hover:text-foreground"
					>
						{mounted && theme === "light" ? (
							<Sun className="h-4 w-4" />
						) : mounted && theme === "dark" ? (
							<Moon className="h-4 w-4" />
						) : (
							<Monitor className="h-4 w-4" />
						)}
					</Button>
				</div>
			</div>
		</header>
	);
}
