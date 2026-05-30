import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
	return new ImageResponse(
		<div
			style={{
				width: 180,
				height: 180,
				background: "#e06030",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				borderRadius: 40,
			}}
		>
			<svg
				width={96}
				height={96}
				viewBox="0 0 512 512"
				fill="none"
				aria-hidden="true"
			>
				<polyline
					points="277 80 107 272 256 272 235 432 405 240 256 240 277 80"
					fill="none"
					stroke="white"
					strokeWidth={36}
					strokeLinecap="round"
					strokeLinejoin="round"
				/>
			</svg>
		</div>,
		{ ...size },
	);
}
