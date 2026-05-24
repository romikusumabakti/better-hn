"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Clock, User } from "lucide-react";
import type { HNComment } from "@/lib/hn-api";
import { cn } from "@/lib/utils";

interface CommentProps {
	comment: HNComment;
	depth: number;
}

function formatTime(hoursAgo: number): string {
	if (hoursAgo < 1) {
		const mins = Math.round(hoursAgo * 60);
		return `${mins}m ago`;
	}
	if (hoursAgo < 24) {
		return `${Math.round(hoursAgo)}h ago`;
	}
	const days = Math.round(hoursAgo / 24);
	return `${days}d ago`;
}

export function Comment({ comment, depth }: CommentProps) {
	const [collapsed, setCollapsed] = useState(false);
	const hoursAgo = (Date.now() / 1000 - comment.time) / 3600;

	if (!comment.text && comment.children.length === 0) return null;

	return (
		<div className={cn(depth > 0 && "ml-3 sm:ml-5 border-l border-border/40 pl-3 sm:pl-4")}>
			<div className="flex items-center gap-1.5 py-1.5">
				<button
					onClick={() => setCollapsed(!collapsed)}
					className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors select-none"
					aria-label={collapsed ? "Expand comment" : "Collapse comment"}
				>
					{collapsed ? (
						<ChevronRight className="h-3 w-3 shrink-0" />
					) : (
						<ChevronDown className="h-3 w-3 shrink-0" />
					)}
				</button>
				<Link
					href={`/user/${comment.by}`}
					className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium"
					onClick={(e) => e.stopPropagation()}
				>
					<User className="h-3 w-3" />
					{comment.by}
				</Link>
				<span className="flex items-center gap-1 text-xs text-muted-foreground/60">
					<Clock className="h-3 w-3" />
					{formatTime(hoursAgo)}
				</span>
				{collapsed && comment.children.length > 0 && (
					<span className="text-xs text-muted-foreground/50">
						[{comment.children.length} {comment.children.length === 1 ? "reply" : "replies"}]
					</span>
				)}
			</div>

			{!collapsed && (
				<>
					{comment.text && (
						<div
							className="text-sm text-foreground/90 leading-relaxed mb-1 [&_a]:text-primary [&_a]:no-underline [&_a:hover]:underline [&_p]:mb-2 [&_p:last-child]:mb-0 [&_pre]:bg-muted [&_pre]:rounded-md [&_pre]:p-3 [&_pre]:overflow-x-auto [&_pre]:my-2 [&_pre]:text-xs [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-xs [&_i]:italic [&_b]:font-semibold"
							dangerouslySetInnerHTML={{ __html: comment.text }}
						/>
					)}
					{comment.children.length > 0 && (
						<div>
							{comment.children.map((child) => (
								<Comment key={child.id} comment={child} depth={depth + 1} />
							))}
						</div>
					)}
				</>
			)}
		</div>
	);
}
