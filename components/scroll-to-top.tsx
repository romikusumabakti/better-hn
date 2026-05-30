"use client";

import { ArrowUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";

export function ScrollToTop() {
	const [visible, setVisible] = useState(false);
	const sentinelRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const el = sentinelRef.current;
		if (!el) return;
		const observer = new IntersectionObserver(
			([entry]) => setVisible(!entry.isIntersecting),
			{ threshold: 0 },
		);
		observer.observe(el);
		return () => observer.disconnect();
	}, []);

	return (
		<>
			<div
				ref={sentinelRef}
				className="absolute top-24 left-0 h-px w-px"
				aria-hidden
			/>
			<button
				type="button"
				hidden={!visible}
				onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
				aria-label="Scroll to top"
				className="scroll-to-top-btn fixed bottom-6 right-4 z-50 flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card shadow-md text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:bottom-8 sm:right-6"
			>
				<ArrowUp className="h-4 w-4" />
			</button>
		</>
	);
}
