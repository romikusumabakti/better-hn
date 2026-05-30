"use client";

import { useEffect } from "react";

export function VisitedMarker({ id }: { id: number }) {
	useEffect(() => {
		try {
			const arr: number[] = JSON.parse(
				localStorage.getItem("hn-visited") || "[]",
			);
			if (!arr.includes(id)) {
				arr.push(id);
				localStorage.setItem("hn-visited", JSON.stringify(arr.slice(-500)));
			}
		} catch {}
	}, [id]);
	return null;
}
