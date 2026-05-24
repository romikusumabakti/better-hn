import { Suspense, ViewTransition } from "react";
import { StoriesFeed } from "@/components/stories-feed";

export default function Home() {
	return (
		<ViewTransition
			enter={{ "nav-back": "nav-back", default: "none" }}
			exit={{ "nav-forward": "nav-forward", default: "none" }}
			default="none"
		>
			{/* Suspense required because StoriesFeed uses useSearchParams() */}
			<Suspense>
				<StoriesFeed />
			</Suspense>
		</ViewTransition>
	);
}
