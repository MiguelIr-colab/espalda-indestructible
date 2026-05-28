require("dotenv").config();

const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const Stripe = require("stripe");
const nodemailer = require("nodemailer");

const PRODUCT_PRICES = {
  "12-semanas": 99700,
  "6-meses": 179700,
  "1-ano": 289700,
};

const app = express();
const PORT = process.env.PORT || 3001;

// Initialize Stripe with secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT, 10) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

/**
 * Reusable function to send notification emails
 * @param {string} subject - Email subject
 * @param {string} text - Plain text content
 * @param {string} html - HTML content (optional)
 * @returns {Promise<object>} - Nodemailer send result
 */
async function sendNotificationEmail(subject, text, html) {
  const mailOptions = {
    from: process.env.SMTP_USER,
    to: process.env.MAIL_TO,
    subject,
    text,
    html: html || text,
  };

  return transporter.sendMail(mailOptions);
}

/**
 * Verify reCAPTCHA v3 token
 * @param {string} token - reCAPTCHA token from frontend
 * @returns {Promise<{success: boolean, score?: number, error?: string}>}
 */
async function verifyRecaptcha(token) {
  try {
    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`,
    });

    const data = await response.json();

    if (!data.success) {
      return { success: false, error: "reCAPTCHA verification failed" };
    }

    return { success: true, score: data.score };
  } catch (error) {
    console.error("reCAPTCHA verification error:", error);
    return { success: false, error: "reCAPTCHA verification error" };
  }
}

// CORS configuration
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:4173",
  "http://localhost:8080",
  "https://espaldaindestructible.com",
  "https://www.espaldaindestructible.com",
  /\.netlify\.app$/,
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);

      const isAllowed = allowedOrigins.some((allowed) =>
        allowed instanceof RegExp ? allowed.test(origin) : allowed === origin
      );

      if (isAllowed) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: "Demasiadas solicitudes. Inténtalo en 15 minutos." },
});

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Demasiadas solicitudes. Inténtalo en 15 minutos." },
});

const couponLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { valid: false, error: "Demasiadas solicitudes. Inténtalo en 15 minutos." },
});

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Contact form endpoint
app.post("/api/contact", contactLimiter, async (req, res) => {
  try {
    const { nombre, email, tiempoDolor, pierdeFuerza, descripcionDolor, website, recaptchaToken } = req.body;

    // Honeypot check - if website field is filled, it's a bot
    if (website && website.trim() !== "") {
      // Return success to not give hints to bots
      return res.json({ success: true });
    }

    // Validate required fields
    if (!nombre || !email || !tiempoDolor || !pierdeFuerza || !descripcionDolor) {
      return res.status(400).json({ success: false, error: "Faltan campos obligatorios" });
    }

    // Validate reCAPTCHA
    if (!recaptchaToken) {
      return res.status(400).json({ success: false, error: "reCAPTCHA token required" });
    }

    const recaptchaResult = await verifyRecaptcha(recaptchaToken);

    if (!recaptchaResult.success) {
      return res.status(400).json({ success: false, error: "reCAPTCHA failed" });
    }

    // Check score threshold (0.5 is recommended minimum)
    if (recaptchaResult.score < 0.5) {
      console.log(`reCAPTCHA low score: ${recaptchaResult.score} for email: ${email}`);
      return res.status(400).json({ success: false, error: "reCAPTCHA failed" });
    }

    // Prepare email content
    const tiempoDolorLabels = {
      "semanas": "Semanas",
      "casi-3-meses": "Casi 3 meses",
      "entre-3-6-meses": "Entre 3 y 6 meses",
      "mas-6-meses": "Más de 6 meses",
      "mas-1-año": "Más de 1 año",
      "mas-3-años": "Más de 3 años",
    };

    const subject = "Nuevo formulario de contacto - ESPALDA INDESTRUCTIBLE";

    const text = `
Nuevo mensaje del formulario de contacto:

Nombre: ${nombre}
Email: ${email}
Tiempo con dolor: ${tiempoDolorLabels[tiempoDolor] || tiempoDolor}
¿Pierde fuerza o tiene incontinencia?: ${pierdeFuerza === "si" ? "Sí" : "No"}

Descripción del dolor:
${descripcionDolor}

---
reCAPTCHA Score: ${recaptchaResult.score}
Enviado: ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a1a1a; color: #fff; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f9f9f9; padding: 20px; border-radius: 0 0 8px 8px; }
    .field { margin-bottom: 15px; }
    .label { font-weight: bold; color: #555; }
    .value { margin-top: 5px; }
    .description { background: #fff; padding: 15px; border-left: 4px solid #f97316; margin-top: 5px; }
    .footer { margin-top: 20px; font-size: 12px; color: #888; text-align: center; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2 style="margin: 0;">Nuevo Formulario de Contacto</h2>
      <p style="margin: 5px 0 0 0; opacity: 0.8;">ESPALDA INDESTRUCTIBLE</p>
    </div>
    <div class="content">
      <div class="field">
        <div class="label">Nombre:</div>
        <div class="value">${nombre}</div>
      </div>
      <div class="field">
        <div class="label">Email:</div>
        <div class="value"><a href="mailto:${email}">${email}</a></div>
      </div>
      <div class="field">
        <div class="label">Tiempo con dolor:</div>
        <div class="value">${tiempoDolorLabels[tiempoDolor] || tiempoDolor}</div>
      </div>
      <div class="field">
        <div class="label">¿Pierde fuerza o tiene incontinencia?</div>
        <div class="value">${pierdeFuerza === "si" ? "Sí" : "No"}</div>
      </div>
      <div class="field">
        <div class="label">Descripción del dolor:</div>
        <div class="description">${descripcionDolor.replace(/\n/g, "<br>")}</div>
      </div>
    </div>
    <div class="footer">
      <p>reCAPTCHA Score: ${recaptchaResult.score}</p>
      <p>Enviado: ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Send email
    await sendNotificationEmail(subject, text, html);

    console.log(`Contact form submitted successfully from: ${email}`);
    res.json({ success: true });
  } catch (error) {
    console.error("Contact form error:", error);
    res.status(500).json({ success: false, error: "Error al enviar el mensaje" });
  }
});

// Create Payment Intent
app.post("/api/create-payment-intent", paymentLimiter, async (req, res) => {
  try {
    const { currency = "eur", productName, productSlug } = req.body;

    if (!productSlug) {
      return res.status(400).json({ error: "productSlug is required" });
    }

    const amount = PRODUCT_PRICES[productSlug];
    if (!amount) {
      return res.status(400).json({ error: "Producto no válido" });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description: productName || "Producto sin nombre",
      metadata: {
        productName: productName || "Producto sin nombre",
        productSlug,
        originalAmount: amount,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (err) {
    console.error("Stripe error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Custom coupons configuration (fixed discounts with minimum purchase requirements)
const CUSTOM_COUPONS = {
  "K47NA": { discount: 47, minAmount: 900 },
  "K102NA": { discount: 102, minAmount: 1600 },
  "K202NA": { discount: 202, minAmount: 1600 },
  "K147NA": { discount: 147, minAmount: 1600 },
};

// Apply Coupon
app.post("/api/apply-coupon", couponLimiter, async (req, res) => {
  try {
    const { paymentIntentId, couponCode, productSlug } = req.body;
    const originalAmount = PRODUCT_PRICES[productSlug] / 100;

    if (!paymentIntentId || !couponCode || !originalAmount || !productSlug) {
      return res.status(400).json({
        valid: false,
        error: "Faltan parámetros requeridos",
      });
    }

    // Convert to uppercase for comparison
    const upperCode = couponCode.toUpperCase();

    // Check if it's a custom coupon first
    const customCoupon = CUSTOM_COUPONS[upperCode];
    if (customCoupon) {
      // Special validation for K102NA, K202NA and K147NA - only valid for 6-meses and 1-ano
      if (upperCode === "K102NA" || upperCode === "K202NA" || upperCode === "K147NA") {
        if (productSlug !== "6-meses" && productSlug !== "1-ano") {
          return res.json({
            valid: false,
            error: "Este cupón solo se puede usar en los planes de 6 meses o 1 año.",
          });
        }
      }

      // Validate minimum purchase amount
      if (originalAmount < customCoupon.minAmount) {
        return res.json({
          valid: false,
          error: `Este cupón requiere una compra mínima de ${customCoupon.minAmount}€.`,
        });
      }

      const discountAmount = customCoupon.discount;
      const finalAmount = Math.max(0, originalAmount - discountAmount);
      const finalAmountCents = Math.round(finalAmount * 100);

      // Update Payment Intent with new amount
      await stripe.paymentIntents.update(paymentIntentId, {
        amount: finalAmountCents,
        metadata: {
          productSlug,
          appliedCoupon: upperCode,
          originalAmount: Math.round(originalAmount * 100),
          discountAmount: Math.round(discountAmount * 100),
          finalAmount: finalAmountCents,
        },
      });

      return res.json({
        valid: true,
        discount: discountAmount,
        finalPrice: finalAmount,
      });
    }

    // Find promotion code by code (Stripe coupons)
    const promotionCodes = await stripe.promotionCodes.list({
      code: couponCode,
      active: true,
      limit: 1,
      expand: ["data.coupon"],
    });

    if (!promotionCodes.data.length) {
      return res.json({
        valid: false,
        error: "El código no es válido o está caducado",
      });
    }

    const promo = promotionCodes.data[0];
    const coupon = promo.coupon;

    if (!coupon || !coupon.valid) {
      return res.json({
        valid: false,
        error: "El cupón no es válido o ha expirado",
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.amount_off) {
      // amount_off is in cents
      discountAmount = coupon.amount_off / 100;
    } else if (coupon.percent_off) {
      discountAmount = (originalAmount * coupon.percent_off) / 100;
    }

    const finalAmount = Math.max(0, originalAmount - discountAmount);
    const finalAmountCents = Math.round(finalAmount * 100);

    // Update Payment Intent with new amount
    await stripe.paymentIntents.update(paymentIntentId, {
      amount: finalAmountCents,
      metadata: {
        productSlug,
        appliedCoupon: upperCode,
        originalAmount: Math.round(originalAmount * 100),
        discountAmount: Math.round(discountAmount * 100),
        finalAmount: finalAmountCents,
      },
    });

    res.json({
      valid: true,
      discount: discountAmount,
      finalPrice: finalAmount,
    });
  } catch (err) {
    console.error("Coupon error:", err);
    res.status(500).json({
      valid: false,
      error: "Error al aplicar el cupón",
    });
  }
});

// Payment success notification
app.post("/api/payment-success", paymentLimiter, async (req, res) => {
  try {
    const { paymentIntentId, productSlug, customerEmail, nombre } = req.body;

    if (!paymentIntentId) {
      return res.status(400).json({ success: false, error: "paymentIntentId is required" });
    }

    // Retrieve the payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status !== "succeeded") {
      return res.status(400).json({ success: false, error: "Payment not succeeded" });
    }

    // Get payment details
    const amountPaid = (paymentIntent.amount / 100).toFixed(2);
    const currency = paymentIntent.currency.toUpperCase();
    const productName = paymentIntent.metadata?.productName || productSlug || "Producto desconocido";
    const appliedCoupon = paymentIntent.metadata?.appliedCoupon || "Ninguno";

    const productLabels = {
      "12-semanas": "12 semanas",
      "6-meses": "6 meses",
      "1-ano": "1 año",
    };

    const subject = "🎉 Nueva compra ESPALDA INDESTRUCTIBLE";

    const text = `
¡Nueva compra completada!

Detalles del pedido:
- Producto: ${productName}
- Duración: ${productLabels[productSlug] || productSlug}
- Importe pagado: ${amountPaid} ${currency}
- Cupón aplicado: ${appliedCoupon}

Datos del cliente:
- Nombre: ${nombre || "No proporcionado"}
- Email: ${customerEmail || "No proporcionado"}

Payment Intent ID: ${paymentIntentId}

---
Fecha: ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}
    `.trim();

    const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: linear-gradient(135deg, #10b981, #059669); color: #fff; padding: 30px 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .header h2 { margin: 0; font-size: 24px; }
    .content { background: #f9f9f9; padding: 25px; border-radius: 0 0 8px 8px; }
    .section { margin-bottom: 20px; }
    .section-title { font-weight: bold; color: #059669; margin-bottom: 10px; font-size: 16px; }
    .field { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #e5e5e5; }
    .field:last-child { border-bottom: none; }
    .label { color: #666; }
    .value { font-weight: 600; color: #333; }
    .amount { font-size: 24px; color: #059669; font-weight: bold; text-align: center; padding: 20px; background: #ecfdf5; border-radius: 8px; margin-bottom: 20px; }
    .footer { margin-top: 20px; font-size: 12px; color: #888; text-align: center; }
    .payment-id { font-family: monospace; font-size: 11px; color: #999; word-break: break-all; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>🎉 ¡Nueva Compra!</h2>
      <p style="margin: 5px 0 0 0; opacity: 0.9;">ESPALDA INDESTRUCTIBLE</p>
    </div>
    <div class="content">
      <div class="amount">${amountPaid} ${currency}</div>
      
      <div class="section">
        <div class="section-title">📦 Producto</div>
        <div class="field">
          <span class="label">Nombre:</span>
          <span class="value">${productName}</span>
        </div>
        <div class="field">
          <span class="label">Duración:</span>
          <span class="value">${productLabels[productSlug] || productSlug}</span>
        </div>
        <div class="field">
          <span class="label">Cupón:</span>
          <span class="value">${appliedCoupon}</span>
        </div>
      </div>
      
      <div class="section">
        <div class="section-title">👤 Cliente</div>
        <div class="field">
          <span class="label">Nombre:</span>
          <span class="value">${nombre || "No proporcionado"}</span>
        </div>
        <div class="field">
          <span class="label">Email:</span>
          <span class="value">${customerEmail ? `<a href="mailto:${customerEmail}">${customerEmail}</a>` : "No proporcionado"}</span>
        </div>
      </div>
    </div>
    <div class="footer">
      <p class="payment-id">Payment Intent: ${paymentIntentId}</p>
      <p>Fecha: ${new Date().toLocaleString("es-ES", { timeZone: "Europe/Madrid" })}</p>
    </div>
  </div>
</body>
</html>
    `.trim();

    // Send email notification
    await sendNotificationEmail(subject, text, html);

    console.log(`Payment success notification sent for: ${paymentIntentId}`);
    res.json({ success: true });
  } catch (error) {
    console.error("Payment success notification error:", error);
    res.status(500).json({ success: false, error: "Error sending notification" });
  }
});

// Mailrelay subscribe endpoint (placeholder - implement your logic)
app.post("/api/mailrelay/subscribe", async (req, res) => {
  try {
    const { nombre, email, timeSinceLoad } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // TODO: Implement Mailrelay API integration
    // For now, just return success
    console.log("Subscribe request:", { nombre, email, timeSinceLoad });

    res.json({ success: true, message: "Subscribed successfully" });
  } catch (err) {
    console.error("Subscribe error:", err);
    res.status(500).json({ message: "Error al suscribir" });
  }
});

// Mailrelay resend endpoint (placeholder - implement your logic)
app.post("/api/mailrelay/resend", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    // TODO: Implement Mailrelay API integration
    console.log("Resend request:", { email });

    res.json({ success: true, message: "Email resent successfully" });
  } catch (err) {
    console.error("Resend error:", err);
    res.status(500).json({ message: "Error al reenviar" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for potential testing
module.exports = { app, sendNotificationEmail };
