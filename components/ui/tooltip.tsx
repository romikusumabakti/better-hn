"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";
import * as React from "react";

import { cn } from "@/lib/utils";

function TooltipProvider({
	delay = 0,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
	return <TooltipPrimitive.Provider delay={delay} {...props} />;
}

const Tooltip = TooltipPrimitive.Root;

// Preserve the Radix `asChild` API: when set, render the child element as the
// trigger via Base UI's `render` prop instead of wrapping it in a button.
function TooltipTrigger({
	asChild,
	children,
	...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger> & {
	asChild?: boolean;
}) {
	if (asChild && React.isValidElement(children)) {
		return <TooltipPrimitive.Trigger render={children} {...props} />;
	}
	return (
		<TooltipPrimitive.Trigger {...props}>{children}</TooltipPrimitive.Trigger>
	);
}

const TooltipContent = React.forwardRef<
	React.ComponentRef<typeof TooltipPrimitive.Popup>,
	React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Popup> & {
		side?: "top" | "right" | "bottom" | "left";
		sideOffset?: number;
	}
>(({ className, side = "top", sideOffset = 4, ...props }, ref) => (
	<TooltipPrimitive.Portal>
		<TooltipPrimitive.Positioner side={side} sideOffset={sideOffset}>
			<TooltipPrimitive.Popup
				ref={ref}
				className={cn(
					"z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[closed]:animate-out data-[closed]:fade-out-0 data-[closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
					className,
				)}
				{...props}
			/>
		</TooltipPrimitive.Positioner>
	</TooltipPrimitive.Portal>
));
TooltipContent.displayName = "TooltipContent";

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger };
