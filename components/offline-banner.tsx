"use client";

import { WifiOff } from "lucide-react";
import { useEffect, useState } from "react";

export function OfflineBanner() {
	const [offline, setOffline] = useState(false);

	useEffect(() => {
		setOffline(!navigator.onLine);
		const on = () => setOffline(false);
		const off = () => setOffline(true);
		window.addEventListener("online", on);
		window.addEventListener("offline", off);
		return () => {
			window.removeEventListener("online", on);
			window.removeEventListener("offline", off);
		};
	}, []);

	return (
		<div
			role="status"
			aria-live="polite"
			hidden={!offline}
			className="offline-banner sticky top-14 z-40 flex items-center gap-2 border-b border-destructive/20 bg-destructive/8 px-4 py-2 text-xs text-destructive"
		>
			<WifiOff className="h-3.5 w-3.5 shrink-0" aria-hidden />
			Offline — showing cached content
		</div>
	);
}
