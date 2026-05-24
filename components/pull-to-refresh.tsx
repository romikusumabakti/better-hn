"use client";

import { RefreshCw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const THRESHOLD = 80;
const MAX_PULL = 130;
const HEADER_HEIGHT = 56;

export function PullToRefresh({
	onRefresh,
	isRefreshing,
	children,
}: {
	onRefresh: () => void;
	isRefreshing: boolean;
	children: React.ReactNode;
}) {
	const [pullY, setPullY] = useState(0);
	const [dragging, setDragging] = useState(false);
	const [triggered, setTriggered] = useState(false);
	const startY = useRef(0);
	const pulling = useRef(false);
	const onRefreshRef = useRef(onRefresh);
	useEffect(() => {
		onRefreshRef.current = onRefresh;
	}, [onRefresh]);

	useEffect(() => {
		function onTouchStart(e: TouchEvent) {
			if (window.scrollY > 2) return;
			startY.current = e.touches[0].clientY;
			pulling.current = true;
		}

		function onTouchMove(e: TouchEvent) {
			if (!pulling.current) return;
			if (window.scrollY > 2) {
				pulling.current = false;
				setDragging(false);
				setPullY(0);
				return;
			}
			const delta = e.touches[0].clientY - startY.current;
			if (delta <= 0) {
				setPullY(0);
				return;
			}
			const y = Math.min(delta * 0.45, MAX_PULL);
			setPullY(y);
			setDragging(true);
			if (y > 5) e.preventDefault();
		}

		function onTouchEnd() {
			if (!pulling.current) return;
			pulling.current = false;
			setDragging(false);
			setPullY((current) => {
				if (current >= THRESHOLD) {
					setTriggered(true);
					onRefreshRef.current();
					return THRESHOLD * 0.55;
				}
				return 0;
			});
		}

		document.addEventListener("touchstart", onTouchStart, { passive: true });
		document.addEventListener("touchmove", onTouchMove, { passive: false });
		document.addEventListener("touchend", onTouchEnd, { passive: true });
		return () => {
			document.removeEventListener("touchstart", onTouchStart);
			document.removeEventListener("touchmove", onTouchMove);
			document.removeEventListener("touchend", onTouchEnd);
		};
	}, []);

	useEffect(() => {
		if (triggered && !isRefreshing) {
			setTriggered(false);
			setPullY(0);
		}
	}, [isRefreshing, triggered]);

	const progress = Math.min(pullY / THRESHOLD, 1);
	const visible = pullY > 4 || triggered;

	return (
		<>
			<div
				aria-hidden
				className="pointer-events-none fixed left-1/2 z-40 flex items-center justify-center rounded-full border border-border bg-background shadow-md sm:hidden"
				style={{
					top: HEADER_HEIGHT + 10 + pullY * 0.35,
					width: 36,
					height: 36,
					opacity: visible ? Math.min(progress * 1.8, 1) : 0,
					transform: `translateX(-50%) scale(${0.5 + progress * 0.5})`,
					transition: dragging
						? undefined
						: "top 0.3s ease, opacity 0.3s ease, transform 0.3s ease",
				}}
			>
				<RefreshCw
					className={cn("h-4 w-4 text-primary", triggered && "animate-spin")}
					style={
						!triggered
							? { transform: `rotate(${progress * 300}deg)` }
							: undefined
					}
				/>
			</div>
			{children}
		</>
	);
}
