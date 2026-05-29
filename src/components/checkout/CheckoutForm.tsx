import { useState } from "react";
import { useStripe, useElements, PaymentElement } from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const countries = [
  "España", "Andorra", "Argentina", "Bolivia", "Chile", "Colombia", "Costa Rica",
  "Cuba", "Ecuador", "El Salvador", "Guatemala", "Guinea Ecuatorial", "Honduras",
  "México", "Nicaragua", "Panamá", "Paraguay", "Perú", "Puerto Rico",
  "República Dominicana", "Uruguay", "Venezuela", "Alemania", "Austria", "Bélgica",
  "Francia", "Italia", "Portugal", "Reino Unido", "Suiza", "Estados Unidos", "Otro"
];

interface CheckoutFormProps {
  paymentIntentId: string;
  productSlug: string;
}

const CheckoutForm = ({ paymentIntentId, productSlug }: CheckoutFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    country: "",
    streetAddress: "",
    apartment: "",
    city: "",
    province: "",
    postalCode: "",
    phone: "",
    email: "",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.firstName.trim()) newErrors.firstName = "El nombre es obligatorio";
    if (!formData.lastName.trim()) newErrors.lastName = "Los apellidos son obligatorios";
    if (!formData.country.trim()) newErrors.country = "El país es obligatorio";
    if (!formData.streetAddress.trim()) newErrors.streetAddress = "La dirección es obligatoria";
    if (!formData.city.trim()) newErrors.city = "La ciudad es obligatoria";
    if (!formData.province.trim()) newErrors.province = "La provincia es obligatoria";
    if (!formData.postalCode.trim()) newErrors.postalCode = "El código postal es obligatorio";
    if (!formData.phone.trim()) newErrors.phone = "El teléfono es obligatorio";
    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido";
    }
    if (!termsAccepted) newErrors.terms = "Debes aceptar los términos y condiciones";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const notifyPaymentSuccess = async () => {
    try {
      const API_URL = import.meta.env.VITE_API_URL;
      await fetch(`${API_URL}/api/payment-success`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentIntentId,
          productSlug,
          customerEmail: formData.email,
          nombre: `${formData.firstName} ${formData.lastName}`.trim(),
        }),
      });
    } catch {
      // Don't block user flow — payment already succeeded
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Error",
        description: "Por favor, completa todos los campos obligatorios",
        variant: "destructive",
      });
      return;
    }

    if (!stripe || !elements) return;

    setLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/thankyou-ei`,
        receipt_email: formData.email,
      },
      redirect: "if_required",
    });

    if (error) {
      toast({ title: "Error en el pago", description: error.message, variant: "destructive" });
      setLoading(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      await notifyPaymentSuccess();
      window.location.href = `${window.location.origin}/thankyou-ei`;
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold mb-2 text-card-foreground">Detalles de facturación</h2>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-px bg-border flex-1"></div>
        <span className="text-muted-foreground text-sm">O</span>
        <div className="h-px bg-border flex-1"></div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName">Nombre *</Label>
            <Input
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className={errors.firstName ? "border-destructive" : ""}
            />
            {errors.firstName && <p className="text-destructive text-sm mt-1">{errors.firstName}</p>}
          </div>
          <div>
            <Label htmlFor="lastName">Apellidos *</Label>
            <Input
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className={errors.lastName ? "border-destructive" : ""}
            />
            {errors.lastName && <p className="text-destructive text-sm mt-1">{errors.lastName}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="companyName">Nombre de la empresa (opcional)</Label>
          <Input
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleChange}
          />
        </div>

        <div>
          <Label htmlFor="country">País / Región *</Label>
          <Select
            value={formData.country}
            onValueChange={(value) => {
              setFormData(prev => ({ ...prev, country: value }));
              if (errors.country) setErrors(prev => ({ ...prev, country: "" }));
            }}
          >
            <SelectTrigger className={errors.country ? "border-destructive" : ""}>
              <SelectValue placeholder="Selecciona un país" />
            </SelectTrigger>
            <SelectContent className="bg-popover z-50">
              {countries.map((country) => (
                <SelectItem key={country} value={country}>{country}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.country && <p className="text-destructive text-sm mt-1">{errors.country}</p>}
        </div>

        <div>
          <Label htmlFor="streetAddress">Dirección de la calle *</Label>
          <Input
            id="streetAddress"
            name="streetAddress"
            placeholder="Nombre de la calle y número de la casa"
            value={formData.streetAddress}
            onChange={handleChange}
            className={errors.streetAddress ? "border-destructive" : ""}
          />
          {errors.streetAddress && <p className="text-destructive text-sm mt-1">{errors.streetAddress}</p>}
        </div>

        <div>
          <Label htmlFor="apartment">Apartamento, habitación, escalera, etc. (opcional)</Label>
          <Input
            id="apartment"
            name="apartment"
            placeholder="Apartamento, habitación, etc. (opcional)"
            value={formData.apartment}
            onChange={handleChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="city">Población *</Label>
            <Input
              id="city"
              name="city"
              value={formData.city}
              onChange={handleChange}
              className={errors.city ? "border-destructive" : ""}
            />
            {errors.city && <p className="text-destructive text-sm mt-1">{errors.city}</p>}
          </div>
          <div>
            <Label htmlFor="province">Provincia *</Label>
            <Input
              id="province"
              name="province"
              placeholder="La Romana"
              value={formData.province}
              onChange={handleChange}
              className={errors.province ? "border-destructive" : ""}
            />
            {errors.province && <p className="text-destructive text-sm mt-1">{errors.province}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="postalCode">Código postal / ZIP *</Label>
            <Input
              id="postalCode"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              className={errors.postalCode ? "border-destructive" : ""}
            />
            {errors.postalCode && <p className="text-destructive text-sm mt-1">{errors.postalCode}</p>}
          </div>
          <div>
            <Label htmlFor="phone">Teléfono *</Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleChange}
              className={errors.phone ? "border-destructive" : ""}
            />
            {errors.phone && <p className="text-destructive text-sm mt-1">{errors.phone}</p>}
          </div>
        </div>

        <div>
          <Label htmlFor="email">Dirección de correo electrónico *</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            className={errors.email ? "border-destructive" : ""}
          />
          {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
        </div>

        <div className="pt-4">
          <h3 className="text-lg font-semibold mb-4 text-card-foreground">Información adicional</h3>
          <div>
            <Label htmlFor="notes">Notas del pedido (opcional)</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-card-foreground">Pago con tarjeta</h3>
          <div className="p-4 border border-border rounded-md bg-background">
            <PaymentElement />
          </div>
        </div>

        <div className="flex items-start space-x-2 mt-6">
          <Checkbox
            id="terms"
            checked={termsAccepted}
            onCheckedChange={(checked) => {
              setTermsAccepted(checked as boolean);
              if (errors.terms) setErrors(prev => ({ ...prev, terms: "" }));
            }}
          />
          <Label htmlFor="terms" className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
            He leído y acepto los{" "}
            <a href="/aviso-legal" className="text-primary hover:underline">
              términos y condiciones
            </a>
          </Label>
        </div>
        {errors.terms && <p className="text-destructive text-sm mt-1">{errors.terms}</p>}

        <Button
          type="submit"
          className="w-full mt-6"
          size="lg"
          disabled={!stripe || loading}
        >
          {loading ? "Procesando..." : "Pagar"}
        </Button>
      </form>
    </div>
  );
};

export default CheckoutForm;
