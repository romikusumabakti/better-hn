"use client";

import {
	Check,
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
import { useEffect, useRef, useState } from "react";
import { OfflineBanner } from "@/components/offline-banner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface HeaderProps {
	isRefreshing?: boolean;
	onRefresh?: () => void;
	storyCount?: number;
	filterOpen?: boolean;
	activeFilterCount?: number;
}

const THEMES = [
	{ value: "light", label: "Light", Icon: Sun },
	{ value: "dark", label: "Dark", Icon: Moon },
	{ value: "system", label: "System", Icon: Monitor },
] as const;

function ThemeMenu() {
	const { theme, setTheme } = useTheme();
	const [mounted, setMounted] = useState(false);
	const [open, setOpen] = useState(false);
	const wrapRef = useRef<HTMLDivElement>(null);
	useEffect(() => setMounted(true), []);

	// Close on outside click / Escape (no native popover so menu can anchor to
	// the trigger reliably across browsers).
	useEffect(() => {
		if (!open) return;
		const onPointer = (e: PointerEvent) => {
			if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
		};
		const onKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") setOpen(false);
		};
		document.addEventListener("pointerdown", onPointer);
		document.addEventListener("keydown", onKey);
		return () => {
			document.removeEventListener("pointerdown", onPointer);
			document.removeEventListener("keydown", onKey);
		};
	}, [open]);

	const current = mounted ? (theme ?? "system") : "system";
	const CurrentIcon =
		THEMES.find((t) => t.value === current)?.Icon ?? Monitor;

	return (
		<div ref={wrapRef} className="relative">
			<Button
				variant="ghost"
				size="icon"
				onClick={() => setOpen((v) => !v)}
				aria-haspopup="menu"
				aria-expanded={open}
				aria-label={
					mounted ? `Theme: ${current}. Change theme` : "Change theme"
				}
				className="h-10 w-10 text-muted-foreground hover:text-foreground"
			>
				<CurrentIcon className="h-4 w-4" />
			</Button>
			{open && (
				<div
					role="menu"
					aria-label="Theme"
					className="animate-slide-down absolute right-0 top-full z-50 mt-1 min-w-36 origin-top-right rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg"
				>
					{THEMES.map(({ value, label, Icon }) => (
						<button
							key={value}
							type="button"
							role="menuitemradio"
							aria-checked={current === value}
							onClick={() => {
								setTheme(value);
								setOpen(false);
							}}
							className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:outline-none"
						>
							<Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
							<span className="flex-1 text-left">{label}</span>
							{current === value && (
								<Check className="h-3.5 w-3.5 shrink-0 text-primary" />
							)}
						</button>
					))}
				</div>
			)}
		</div>
	);
}

export function Header({
	isRefreshing,
	onRefresh,
	storyCount,
	filterOpen,
	activeFilterCount,
}: HeaderProps) {
	const pathname = usePathname();

	return (
		<>
			<header
				className="site-header sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-lg"
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
								className="relative h-10 w-10 text-muted-foreground hover:text-foreground"
							>
								<SlidersHorizontal className="h-4 w-4" />
								{activeFilterCount > 0 && (
									<span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[9px] font-bold leading-none text-primary-foreground">
										{activeFilterCount}
									</span>
								)}
								<span className="sr-only">
									Toggle filters (press f)
									{activeFilterCount > 0
										? ` — ${activeFilterCount} active`
										: ""}
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
						<ThemeMenu />
					</div>
				</div>
			</header>
			<OfflineBanner />
		</>
	);
}
