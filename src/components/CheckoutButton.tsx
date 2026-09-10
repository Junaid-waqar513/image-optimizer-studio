import { Button } from "@/components/ui/button";
import { openPaddleCheckout } from "@/lib/paddle";

interface CheckoutButtonProps {
  priceId: string;
  children: React.ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  className?: string;
  size?: "default" | "sm" | "lg" | "icon";
}

export function CheckoutButton({
  priceId,
  children,
  variant = "default",
  className,
  size = "default",
}: CheckoutButtonProps) {
  return (
    <Button variant={variant} size={size} className={className} onClick={() => openPaddleCheckout(priceId)}>
      {children}
    </Button>
  );
}
