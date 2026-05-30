"use client";

import { useEffect, useRef, useState } from "react";

type State = "idle" | "active" | "complete";

interface NavigateEvent extends Event {
	hashChange: boolean;
	canIntercept: boolean;
}

export function NavigationProgress() {
	const [state, setState] = useState<State>("idle");
	const doneTimer = useRef<ReturnType<typeof setTimeout> | undefined>(
		undefined,
	);

	useEffect(() => {
		if (typeof window === "undefined" || !("navigation" in window)) return;
		const nav = window.navigation as EventTarget;

		const handleNavigate = (e: Event) => {
			const ne = e as NavigateEvent;
			if (ne.hashChange || !ne.canIntercept) return;
			clearTimeout(doneTimer.current);
			setState("active");
		};

		const handleDone = () => {
			setState("complete");
			doneTimer.current = setTimeout(() => setState("idle"), 500);
		};

		nav.addEventListener("navigate", handleNavigate);
		nav.addEventListener("navigatesuccess", handleDone);
		nav.addEventListener("navigateerror", handleDone);
		return () => {
			nav.removeEventListener("navigate", handleNavigate);
			nav.removeEventListener("navigatesuccess", handleDone);
			nav.removeEventListener("navigateerror", handleDone);
			clearTimeout(doneTimer.current);
		};
	}, []);

	if (state === "idle") return null;

	return (
		<div
			aria-hidden
			data-state={state}
			className="nav-progress fixed top-0 left-0 right-0 z-[200] h-px"
		/>
	);
}
