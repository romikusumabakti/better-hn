import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
	return new ImageResponse(
		<div
			style={{
				background: "#f1f2f6",
				width: "100%",
				height: "100%",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				justifyContent: "center",
				gap: "24px",
				fontFamily: "system-ui, sans-serif",
			}}
		>
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: "96px",
					height: "96px",
					borderRadius: "20px",
					background: "#e06030",
				}}
			>
				<svg
					width="52"
					height="52"
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
			<div
				style={{
					fontSize: "64px",
					fontWeight: "700",
					color: "#222222",
					letterSpacing: "-0.025em",
				}}
			>
				Better HN
			</div>
			<div
				style={{
					fontSize: "28px",
					color: "#7a7a7a",
					maxWidth: "600px",
					textAlign: "center",
					lineHeight: "1.4",
				}}
			>
				Hacker News with customizable time-decay scoring
			</div>
		</div>,
	);
}
