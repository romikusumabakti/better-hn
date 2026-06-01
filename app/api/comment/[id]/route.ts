import { NextResponse } from "next/server";
import { processComment } from "@/lib/highlight";
import { fetchCommentTree } from "@/lib/hn-api";

export async function GET(
	_: Request,
	{ params }: { params: Promise<{ id: string }> },
) {
	const { id } = await params;
	const commentId = parseInt(id, 10);
	if (Number.isNaN(commentId)) return NextResponse.json(null, { status: 400 });
	const comment = await fetchCommentTree(commentId);
	if (!comment) return NextResponse.json(null);
	const processed = await processComment(comment);
	return NextResponse.json(processed);
}
