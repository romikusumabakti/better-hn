import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function isWindows(): boolean {
	if (typeof navigator === "undefined") return false;
	// userAgentData is Baseline 2023 but not yet in TS DOM lib
	const uad = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData;
	if (uad?.platform !== undefined) return uad.platform.toLowerCase().includes("win");
	return /Win/.test(navigator.userAgent);
}

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getTypeLabel(story: {
	title: string;
	type: string;
}): string | null {
	if (story.title.startsWith("Ask HN:")) return "Ask";
	if (story.title.startsWith("Show HN:")) return "Show";
	if (story.type === "job") return "Job";
	return null;
}

export function formatTime(hoursAgo: number): string {
	if (hoursAgo < 1) {
		const mins = Math.round(hoursAgo * 60);
		return `${mins}m ago`;
	}
	if (hoursAgo < 24) {
		return `${Math.round(hoursAgo)}h ago`;
	}
	const days = Math.round(hoursAgo / 24);
	return `${days}d ago`;
}
