import { Skeleton } from "@/components/ui/skeleton";

export function StorySkeleton() {
	return (
		<div className="rounded-xl border border-border bg-card p-4">
			<div className="flex gap-3">
				<div className="shrink-0 w-6" />
				<div className="min-w-0 flex-1 space-y-2">
					<div className="flex gap-1.5">
						<Skeleton className="h-4 w-10 rounded" />
						<Skeleton className="h-4 w-20 rounded" />
					</div>
					<Skeleton className="h-4 w-4/5 rounded" />
					<Skeleton className="h-4 w-2/5 rounded" />
					<div className="flex gap-3">
						<Skeleton className="h-3 w-8 rounded" />
						<Skeleton className="h-3 w-12 rounded" />
						<Skeleton className="h-3 w-16 rounded" />
						<Skeleton className="h-3 w-10 rounded" />
					</div>
				</div>
			</div>
		</div>
	);
}
