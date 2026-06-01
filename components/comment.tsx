"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import type { HNComment } from "@/lib/hn-api";
import { sanitize } from "@/lib/sanitize";
import { cn, formatTime } from "@/lib/utils";

interface CommentProps {
	comment: HNComment;
	depth: number;
}

const DEPTH_BORDER_COLORS = [
	"border-border/65",
	"border-border/50",
	"border-border/38",
	"border-border/28",
	"border-border/20",
	"border-border/20",
] as const;

export function Comment({ comment, depth }: CommentProps) {
	const [collapsed, setCollapsed] = useState(false);
	const hoursAgo = (Date.now() / 1000 - comment.time) / 3600;

	if (!comment.text && comment.children.length === 0) return null;

	const depthBorder =
		DEPTH_BORDER_COLORS[Math.min(depth - 1, DEPTH_BORDER_COLORS.length - 1)];

	return (
		<div
			data-collapsed={collapsed ? "" : undefined}
			className={cn(
				depth > 0 && `border-l pl-3 sm:pl-4 ${depthBorder}`,
				depth > 0 && depth <= 4 && "ml-3 sm:ml-5",
			)}
		>
			{/* Full-row toggle — invisible button overlay (same pattern as StoryCard) */}
			<div className="relative flex w-full select-none items-center gap-1.5 py-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground focus-within:text-foreground">
				<button
					type="button"
					aria-expanded={!collapsed}
					aria-label={`${collapsed ? "Expand" : "Collapse"} comment by ${comment.by}`}
					onClick={() => setCollapsed(!collapsed)}
					className="absolute inset-0 cursor-pointer rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
				/>
				<ChevronDown className="comment-chevron relative h-3 w-3 shrink-0" />
				<Link
					href={`/user/${comment.by}`}
					className="relative z-10 font-medium transition-colors hover:text-primary"
					onClick={(e) => e.stopPropagation()}
				>
					{comment.by}
				</Link>
				<span className="select-none text-muted-foreground/40" aria-hidden>
					·
				</span>
				<time
					dateTime={new Date(comment.time * 1000).toISOString()}
					className="text-muted-foreground/60"
				>
					{formatTime(hoursAgo)}
				</time>
				{collapsed && comment.children.length > 0 && (
					<span className="text-muted-foreground/50">
						[{comment.children.length}{" "}
						{comment.children.length === 1 ? "reply" : "replies"}]
					</span>
				)}
			</div>

			<div className="comment-body" inert={collapsed || undefined}>
				{comment.text && (
					<div
						className="mb-1.5 max-w-[72ch] text-sm leading-relaxed text-foreground/90 [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_b]:font-semibold [&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs [&_i]:italic [&_p]:mb-2.5 [&_p:last-child]:mb-0 [&_pre:not(.shiki)]:my-2 [&_pre:not(.shiki)]:overflow-x-auto [&_pre:not(.shiki)]:rounded-md [&_pre:not(.shiki)]:bg-muted [&_pre:not(.shiki)]:p-3 [&_pre:not(.shiki)]:text-xs"
						dangerouslySetInnerHTML={{
							__html: comment._html ?? sanitize(comment.text),
						}}
					/>
				)}
				{comment.children.length > 0 && (
					<div>
						{comment.children.map((child) => (
							<Comment key={child.id} comment={child} depth={depth + 1} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
