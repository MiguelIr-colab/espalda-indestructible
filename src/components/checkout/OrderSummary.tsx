import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";

interface Product {
  name: string;
  duration: string;
  price: number;
  priceFormatted: string;
}

interface OrderSummaryProps {
  product: Product;
  paymentIntentId?: string;
  productSlug: string;
}

const OrderSummary = ({ product, paymentIntentId, productSlug }: OrderSummaryProps) => {
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discount: number } | null>(null);
  const [finalPrice, setFinalPrice] = useState(product.price);
  const [isApplying, setIsApplying] = useState(false);
  const [couponError, setCouponError] = useState("");

  const subtotal = product.price;

  const handleApplyCoupon = async () => {
    const normalizedCode = couponCode.trim().toUpperCase();

    if (!normalizedCode) {
      setCouponError("Por favor, introduce un código de cupón");
      return;
    }

    if (!paymentIntentId) return;

    setIsApplying(true);
    setCouponError("");

    const API_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${API_URL}/api/apply-coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          couponCode: normalizedCode,
          productSlug
        })
      });

      const data = await response.json();

      if (data.valid) {
        setAppliedCoupon({ code: normalizedCode, discount: data.discount });
        setFinalPrice(data.finalPrice);
        toast({
          title: "Cupón aplicado",
          description: `Se ha aplicado un descuento de ${data.discount.toFixed(2)}€`,
        });
      } else {
        setCouponError(data.error || "El código no es válido o está caducado");
      }
    } catch (error) {
      console.error("Error applying coupon:", error);
      setCouponError("Error al aplicar el cupón. Por favor, inténtalo de nuevo.");
    } finally {
      setIsApplying(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setFinalPrice(product.price);
    setCouponCode("");
    setCouponError("");
    toast({
      title: "Cupón eliminado",
      description: "El cupón ha sido eliminado del pedido",
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 md:p-8 h-fit sticky top-24">
      <h2 className="text-2xl font-bold mb-6 text-card-foreground">Tu Pedido</h2>
      
      <div className="space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="font-semibold text-card-foreground">{product.name}</p>
            <p className="text-sm text-muted-foreground">{product.duration}</p>
          </div>
          <p className="font-semibold text-card-foreground">{product.priceFormatted}</p>
        </div>

        <Separator />

        <div className="flex justify-between text-card-foreground">
          <span>Subtotal</span>
          <span>{subtotal.toFixed(2)}€</span>
        </div>

        {appliedCoupon && (
          <div className="flex justify-between text-green-600">
            <span>Descuento aplicado</span>
            <span>-{appliedCoupon.discount.toFixed(2)}€</span>
          </div>
        )}

        <Separator />

        <div className="flex justify-between text-lg font-bold text-card-foreground">
          <span>Total</span>
          <span>{finalPrice.toFixed(2)}€</span>
        </div>

        {paymentIntentId && <Card className="p-4 bg-muted/30 border-muted">
          <h3 className="font-semibold mb-3 text-card-foreground">¿Tienes un cupón?</h3>
          <div className="space-y-2">
            <Input
              placeholder="Introduce tu código"
              value={couponCode}
              onChange={(e) => {
                setCouponCode(e.target.value.toUpperCase());
                setCouponError("");
              }}
              disabled={!!appliedCoupon || isApplying}
              className="bg-background"
            />
            {couponError && (
              <p className="text-destructive text-sm">{couponError}</p>
            )}
            {!appliedCoupon ? (
              <Button
                onClick={handleApplyCoupon}
                variant="outline"
                className="w-full"
                disabled={isApplying}
              >
                {isApplying ? "Aplicando..." : "Aplicar cupón"}
              </Button>
            ) : (
              <Button
                onClick={handleRemoveCoupon}
                variant="outline"
                className="w-full"
              >
                Quitar cupón
              </Button>
            )}
          </div>
        </Card>}

        {paymentIntentId && <div className="text-sm text-muted-foreground pt-4">
          <p>• Solo se puede aplicar un cupón por pedido</p>
          <p>• No se admiten devoluciones una vez creado el programa</p>
        </div>}
      </div>
    </div>
  );
};

export default OrderSummary;
