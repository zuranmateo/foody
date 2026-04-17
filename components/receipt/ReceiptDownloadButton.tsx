import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ReceiptDownloadButtonProps = {
  orderId: string;
  className?: string;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
};

export default function ReceiptDownloadButton({
  orderId,
  className,
  label = "Save PDF receipt",
  variant = "outline",
  size = "default",
}: ReceiptDownloadButtonProps) {
  return (
    <a
      href={`/api/orders/${orderId}/receipt`}
      download
      className={cn(buttonVariants({ variant, size }), className)}
    >
      {label}
    </a>
  );
}
