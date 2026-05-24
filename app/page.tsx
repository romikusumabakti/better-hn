import { ViewTransition } from "react";
import { StoriesFeed } from "@/components/stories-feed";

export default function Home() {
	return (
		<ViewTransition
			enter={{ "nav-back": "nav-back", default: "none" }}
			exit={{ "nav-forward": "nav-forward", default: "none" }}
			default="none"
		>
			<StoriesFeed />
		</ViewTransition>
	);
}
