"use client";

import { useEffect, useRef } from "react";
import { isWindows } from "@/lib/utils";

interface ShortcutsHelpProps {
	open: boolean;
	onClose: () => void;
}

const SHORTCUTS: { keys: string[]; label: string }[] = [
	{ keys: ["j", "↓"], label: "Next story" },
	{ keys: ["k", "↑"], label: "Previous story" },
	{ keys: ["o", "↵"], label: "Open article" },
	{ keys: ["c"], label: "Open comments" },
	{ keys: ["f"], label: "Toggle filters" },
	{ keys: ["mod", "K"], label: "Search stories" },
	{ keys: ["?"], label: "Show this help" },
];

export function ShortcutsHelp({ open, onClose }: ShortcutsHelpProps) {
	const ref = useRef<HTMLDialogElement>(null);

	useEffect(() => {
		const d = ref.current;
		if (!d) return;
		if (open && !d.open) d.showModal();
		else if (!open && d.open) d.close();
	}, [open]);

	useEffect(() => {
		const d = ref.current;
		if (!d) return;
		const handleClose = () => onClose();
		d.addEventListener("close", handleClose);
		return () => d.removeEventListener("close", handleClose);
	}, [onClose]);

	const mod = typeof navigator !== "undefined" && !isWindows() ? "⌘" : "Ctrl";

	return (
		// biome-ignore lint/a11y/useKeyWithClickEvents: backdrop click closes; Escape handled natively by showModal()
		<dialog
			ref={ref}
			aria-label="Keyboard shortcuts"
			className="command-palette bg-card text-foreground border border-border shadow-2xl outline-none p-0"
			onClick={(e) => {
				if (e.target === ref.current) ref.current?.close();
			}}
		>
			<div className="flex items-center justify-between border-b border-border px-4 py-3">
				<h2 className="text-sm font-semibold text-foreground">
					Keyboard shortcuts
				</h2>
				<kbd className="hidden text-xs text-muted-foreground sm:inline">
					esc
				</kbd>
			</div>
			<ul className="p-2">
				{SHORTCUTS.map((s) => (
					<li
						key={s.label}
						className="flex items-center justify-between gap-4 rounded-md px-2.5 py-2 text-sm"
					>
						<span className="text-muted-foreground">{s.label}</span>
						<span className="flex shrink-0 items-center gap-1">
							{s.keys.map((k) => (
								<kbd key={k}>{k === "mod" ? mod : k}</kbd>
							))}
						</span>
					</li>
				))}
			</ul>
		</dialog>
	);
}
