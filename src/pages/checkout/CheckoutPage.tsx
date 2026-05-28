import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutForm, { BillingData } from "@/components/checkout/CheckoutForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string
);

const products = {
  "12-semanas": { name: "ESPALDA INDESTRUCTIBLE", duration: "12 semanas", price: 997, priceFormatted: "997,00€" },
  "6-meses": { name: "ESPALDA INDESTRUCTIBLE", duration: "6 meses", price: 1797, priceFormatted: "1.797,00€" },
  "1-ano": { name: "ESPALDA INDESTRUCTIBLE", duration: "1 año", price: 2897, priceFormatted: "2.897,00€" },
};

interface PaymentStepProps {
  billingData: BillingData;
  paymentIntentId: string;
  productSlug: string;
}

const PaymentStep = ({ billingData, paymentIntentId, productSlug }: PaymentStepProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const notifyPaymentSuccess = async (piId: string) => {
    const API_URL = import.meta.env.VITE_API_URL;
    const response = await fetch(`${API_URL}/api/payment-success`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        paymentIntentId: piId,
        productSlug,
        firstName: billingData.firstName,
        lastName: billingData.lastName,
        companyName: billingData.companyName || null,
        country: billingData.country,
        streetAddress: billingData.streetAddress,
        apartment: billingData.apartment || null,
        city: billingData.city,
        province: billingData.province,
        postalCode: billingData.postalCode,
        phone: billingData.phone,
        email: billingData.email,
        notes: billingData.notes || null,
      }),
    });
    if (!response.ok) throw new Error("Notification failed");
  };

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thankyou-ei`,
        receipt_email: billingData.email,
      },
      redirect: "if_required",
    });

    if (error) {
      toast({ title: "Error en el pago", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      try {
        await notifyPaymentSuccess(paymentIntent.id);
      } catch {
        toast({
          title: "Pago completado",
          description: "Tu pago se procesó correctamente. Si no recibes el email de confirmación en 10 minutos, contáctanos.",
          variant: "destructive",
        });
      }
      window.location.href = `${window.location.origin}/thankyou-ei`;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-6 text-card-foreground">Pago con tarjeta</h2>
      <div className="p-4 border border-border rounded-md bg-background mb-6">
        <PaymentElement />
      </div>
      <Button
        className="w-full"
        size="lg"
        onClick={handlePay}
        disabled={!stripe || loading}
      >
        {loading ? "Procesando..." : "Pagar ahora"}
      </Button>
    </div>
  );
};

const CheckoutPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [step, setStep] = useState<"billing" | "payment">("billing");
  const [billingData, setBillingData] = useState<BillingData | null>(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [creatingIntent, setCreatingIntent] = useState(false);

  const product = slug ? products[slug as keyof typeof products] : null;

  if (!product) {
    navigate("/tienda");
    return null;
  }

  const handleBillingComplete = async (data: BillingData) => {
    setBillingData(data);
    setCreatingIntent(true);

    const API_URL = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${API_URL}/api/create-payment-intent`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: slug,
          productName: `${product.name} - ${product.duration}`,
        }),
      });
      const intentData = await response.json();
      if (!intentData.clientSecret) throw new Error("No clientSecret");
      setClientSecret(intentData.clientSecret);
      setPaymentIntentId(intentData.paymentIntentId);
      setStep("payment");
    } catch {
      toast({ title: "Error", description: "No se pudo iniciar el proceso de pago.", variant: "destructive" });
    } finally {
      setCreatingIntent(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 md:pt-36 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-center text-primary">
            Finalizar Compra
          </h1>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
            {step === "billing" ? (
              <CheckoutForm onComplete={handleBillingComplete} isLoading={creatingIntent} />
            ) : (
              clientSecret && billingData && (
                <Elements
                  options={{ clientSecret, appearance: { theme: "stripe" } }}
                  stripe={stripePromise}
                >
                  <PaymentStep
                    billingData={billingData}
                    paymentIntentId={paymentIntentId}
                    productSlug={slug || ""}
                  />
                </Elements>
              )
            )}
            <OrderSummary
              product={product}
              paymentIntentId={paymentIntentId}
              productSlug={slug || ""}
            />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
