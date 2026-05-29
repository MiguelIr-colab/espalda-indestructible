import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import OrderSummary from "@/components/checkout/OrderSummary";
import { useToast } from "@/hooks/use-toast";

const stripePromise = loadStripe(
  import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string
);

const products = {
  "12-semanas": { name: "ESPALDA INDESTRUCTIBLE", duration: "12 semanas", price: 997, priceFormatted: "997,00€" },
  "6-meses": { name: "ESPALDA INDESTRUCTIBLE", duration: "6 meses", price: 1797, priceFormatted: "1.797,00€" },
  "1-ano": { name: "ESPALDA INDESTRUCTIBLE", duration: "1 año", price: 2897, priceFormatted: "2.897,00€" },
};

const CheckoutPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [clientSecret, setClientSecret] = useState("");
  const [paymentIntentId, setPaymentIntentId] = useState("");
  const [loading, setLoading] = useState(true);

  const product = slug ? products[slug as keyof typeof products] : null;

  useEffect(() => {
    if (!product) {
      navigate("/tienda");
      return;
    }

    const createPaymentIntent = async () => {
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

        const data = await response.json();
        setClientSecret(data.clientSecret);
        setPaymentIntentId(data.paymentIntentId);
        setLoading(false);
      } catch {
        toast({
          title: "Error",
          description: "No se pudo iniciar el proceso de pago.",
          variant: "destructive",
        });
        setLoading(false);
      }
    };

    createPaymentIntent();
  }, []);

  if (!product) return null;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-32 md:pt-36 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl lg:text-4xl font-bold mb-8 text-center text-primary">
            Finalizar Compra
          </h1>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
              {clientSecret && (
                <Elements
                  options={{ clientSecret, appearance: { theme: "stripe" } }}
                  stripe={stripePromise}
                >
                  <CheckoutForm
                    paymentIntentId={paymentIntentId}
                    productSlug={slug || ""}
                  />
                </Elements>
              )}
              <OrderSummary
                product={product}
                paymentIntentId={paymentIntentId}
                productSlug={slug || ""}
              />
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default CheckoutPage;
