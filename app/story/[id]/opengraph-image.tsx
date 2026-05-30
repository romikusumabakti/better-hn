import { ImageResponse } from "next/og";
import { fetchStory } from "@/lib/hn-api";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const storyId = parseInt(id, 10);
	const story = Number.isNaN(storyId) ? null : await fetchStory(storyId);

	const title = story?.title ?? "Better HN";
	const meta = story
		? `${story.score} pts · ${story.descendants ?? 0} comments · by ${story.by}`
		: "Hacker News, reimagined";

	return new ImageResponse(
		<div
			style={{
				background: "#f1f2f6",
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				justifyContent: "center",
				padding: "80px",
				fontFamily: "system-ui, sans-serif",
				gap: "20px",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "12px",
					marginBottom: "8px",
				}}
			>
				<div
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						width: "48px",
						height: "48px",
						borderRadius: "10px",
						background: "#e06030",
					}}
				>
					<svg
						width="26"
						height="26"
						viewBox="0 0 24 24"
						fill="none"
						role="img"
						aria-label="Lightning bolt"
					>
						<polyline
							points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"
							stroke="white"
							strokeWidth="2"
							strokeLinecap="round"
							strokeLinejoin="round"
						/>
					</svg>
				</div>
				<span
					style={{
						fontSize: "24px",
						fontWeight: "600",
						color: "#7a7a7a",
					}}
				>
					Better HN
				</span>
			</div>
			<div
				style={{
					fontSize:
						title.length > 80 ? "40px" : title.length > 50 ? "48px" : "56px",
					fontWeight: "700",
					color: "#222222",
					lineHeight: "1.2",
					letterSpacing: "-0.02em",
					maxWidth: "1040px",
				}}
			>
				{title.length > 120 ? `${title.slice(0, 117)}…` : title}
			</div>
			<div
				style={{
					fontSize: "24px",
					color: "#7a7a7a",
					marginTop: "4px",
				}}
			>
				{meta}
			</div>
		</div>,
	);
}
