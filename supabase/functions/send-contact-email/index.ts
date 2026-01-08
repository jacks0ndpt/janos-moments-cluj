import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Simple validation functions (Zod-like validation without external dependency)
function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  if (!phone) return true; // Phone is optional
  const phoneRegex = /^[\d\s\-\+\(\)]{6,20}$/;
  return phoneRegex.test(phone);
}

function sanitizeInput(input: string): string {
  return input
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .trim();
}

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  eventType?: string;
  date?: string;
  location?: string;
  message?: string;
  language: "en" | "ro";
}

function validateFormData(data: any): { valid: boolean; errors: string[]; data?: ContactFormData } {
  const errors: string[] = [];

  // Required fields
  if (!data.name || typeof data.name !== "string" || data.name.trim().length < 2) {
    errors.push("Name is required and must be at least 2 characters");
  }
  if (data.name && data.name.length > 100) {
    errors.push("Name must be less than 100 characters");
  }

  if (!data.email || typeof data.email !== "string") {
    errors.push("Email is required");
  } else if (!validateEmail(data.email)) {
    errors.push("Invalid email address");
  }
  if (data.email && data.email.length > 255) {
    errors.push("Email must be less than 255 characters");
  }

  // Optional fields validation
  if (data.phone && !validatePhone(data.phone)) {
    errors.push("Invalid phone number format");
  }

  if (data.message && data.message.length > 2000) {
    errors.push("Message must be less than 2000 characters");
  }

  if (data.location && data.location.length > 200) {
    errors.push("Location must be less than 200 characters");
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return {
    valid: true,
    errors: [],
    data: {
      name: sanitizeInput(data.name),
      email: data.email.trim().toLowerCase(),
      phone: data.phone ? sanitizeInput(data.phone) : undefined,
      eventType: data.eventType ? sanitizeInput(data.eventType) : undefined,
      date: data.date ? sanitizeInput(data.date) : undefined,
      location: data.location ? sanitizeInput(data.location) : undefined,
      message: data.message ? sanitizeInput(data.message) : undefined,
      language: data.language === "ro" ? "ro" : "en",
    },
  };
}

function getEventTypeLabel(eventType: string | undefined, language: "en" | "ro"): string {
  if (!eventType) return language === "en" ? "Not specified" : "Nespecificat";
  
  const labels: Record<string, Record<string, string>> = {
    wedding: { en: "Wedding", ro: "Nuntă" },
    event: { en: "Event", ro: "Eveniment" },
    couples: { en: "Couples Session", ro: "Sesiune cupluri" },
  };

  return labels[eventType]?.[language] || eventType;
}

function generateNotificationEmail(data: ContactFormData): string {
  const eventTypeLabel = getEventTypeLabel(data.eventType, data.language);
  
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Form Submission</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f8f7f4;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <h1 style="font-family: 'Georgia', serif; font-size: 28px; color: #1a1a1a; margin: 0 0 24px 0; padding-bottom: 16px; border-bottom: 2px solid #d4af37;">
        📬 New Inquiry Received
      </h1>
      
      <p style="font-size: 16px; color: #4a4a4a; margin: 0 0 24px 0; line-height: 1.6;">
        You have received a new contact form submission from your website.
      </p>
      
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #1a1a1a; width: 140px;">Name:</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #4a4a4a;">${data.name}</td>
        </tr>
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #1a1a1a;">Email:</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #4a4a4a;">
            <a href="mailto:${data.email}" style="color: #d4af37; text-decoration: none;">${data.email}</a>
          </td>
        </tr>
        ${data.phone ? `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #1a1a1a;">Phone:</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #4a4a4a;">
            <a href="tel:${data.phone}" style="color: #d4af37; text-decoration: none;">${data.phone}</a>
          </td>
        </tr>
        ` : ""}
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #1a1a1a;">Event Type:</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #4a4a4a;">${eventTypeLabel}</td>
        </tr>
        ${data.date ? `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #1a1a1a;">Date:</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #4a4a4a;">${data.date}</td>
        </tr>
        ` : ""}
        ${data.location ? `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-weight: bold; color: #1a1a1a;">Location:</td>
          <td style="padding: 12px 0; border-bottom: 1px solid #eee; color: #4a4a4a;">${data.location}</td>
        </tr>
        ` : ""}
        ${data.message ? `
        <tr>
          <td style="padding: 12px 0; font-weight: bold; color: #1a1a1a; vertical-align: top;">Message:</td>
          <td style="padding: 12px 0; color: #4a4a4a; line-height: 1.6;">${data.message.replace(/\n/g, "<br>")}</td>
        </tr>
        ` : ""}
      </table>
      
      <div style="margin-top: 32px; padding: 16px; background-color: #f8f7f4; border-radius: 4px; text-align: center;">
        <p style="margin: 0; font-size: 14px; color: #666;">
          Language used: <strong>${data.language === "ro" ? "Romanian" : "English"}</strong>
        </p>
      </div>
    </div>
    
    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 24px;">
      Jimmy Hada Photography | Cluj-Napoca, Romania
    </p>
  </div>
</body>
</html>
  `;
}

function generateConfirmationEmail(data: ContactFormData): string {
  const isRomanian = data.language === "ro";
  
  const content = isRomanian ? {
    title: "Mulțumim pentru mesaj!",
    greeting: `Dragă ${data.name},`,
    body: "Mulțumesc că m-ai contactat! Am primit cererea ta și îți voi răspunde în maxim 48 de ore.",
    details: "Detaliile cererii tale:",
    eventType: "Tip eveniment",
    date: "Data",
    location: "Locație",
    closing: "Abia aștept să discutăm despre ziua ta specială!",
    signature: "Cu drag,",
    name: "Jimmy Hada",
    tagline: "Fotograf documentarist de nunți",
  } : {
    title: "Thank you for your message!",
    greeting: `Dear ${data.name},`,
    body: "Thank you for reaching out! I've received your inquiry and will get back to you within 48 hours.",
    details: "Your inquiry details:",
    eventType: "Event type",
    date: "Date",
    location: "Location",
    closing: "I look forward to discussing your special day!",
    signature: "Warm regards,",
    name: "Jimmy Hada",
    tagline: "Documentary Wedding Photographer",
  };

  const eventTypeLabel = getEventTypeLabel(data.eventType, data.language);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${content.title}</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Georgia', serif; background-color: #f8f7f4;">
  <div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
    <div style="background-color: #ffffff; border-radius: 8px; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
      <h1 style="font-family: 'Georgia', serif; font-size: 28px; color: #1a1a1a; margin: 0 0 24px 0; padding-bottom: 16px; border-bottom: 2px solid #d4af37; text-align: center;">
        ${content.title}
      </h1>
      
      <p style="font-size: 16px; color: #4a4a4a; margin: 0 0 16px 0; line-height: 1.6;">
        ${content.greeting}
      </p>
      
      <p style="font-size: 16px; color: #4a4a4a; margin: 0 0 24px 0; line-height: 1.6;">
        ${content.body}
      </p>
      
      ${data.eventType || data.date || data.location ? `
      <div style="background-color: #f8f7f4; border-radius: 4px; padding: 20px; margin: 24px 0;">
        <p style="font-weight: bold; color: #1a1a1a; margin: 0 0 12px 0;">${content.details}</p>
        <ul style="margin: 0; padding: 0; list-style: none; color: #4a4a4a;">
          ${data.eventType ? `<li style="padding: 4px 0;">📸 ${content.eventType}: ${eventTypeLabel}</li>` : ""}
          ${data.date ? `<li style="padding: 4px 0;">📅 ${content.date}: ${data.date}</li>` : ""}
          ${data.location ? `<li style="padding: 4px 0;">📍 ${content.location}: ${data.location}</li>` : ""}
        </ul>
      </div>
      ` : ""}
      
      <p style="font-size: 16px; color: #4a4a4a; margin: 24px 0 0 0; line-height: 1.6;">
        ${content.closing}
      </p>
      
      <div style="margin-top: 32px; padding-top: 24px; border-top: 1px solid #eee;">
        <p style="font-size: 16px; color: #4a4a4a; margin: 0; line-height: 1.4;">
          ${content.signature}<br>
          <strong style="color: #1a1a1a;">${content.name}</strong><br>
          <span style="font-style: italic; color: #666;">${content.tagline}</span>
        </p>
      </div>
    </div>
    
    <p style="text-align: center; font-size: 12px; color: #999; margin-top: 24px;">
      © 2024 Jimmy Hada Photography | Cluj-Napoca, Romania
    </p>
  </div>
</body>
</html>
  `;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawData = await req.json();
    console.log("Received form data:", JSON.stringify(rawData, null, 2));

    // Validate form data
    const validation = validateFormData(rawData);
    if (!validation.valid) {
      console.error("Validation errors:", validation.errors);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: "Validation failed", 
          details: validation.errors 
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const data = validation.data!;

    // Send notification email to photographer
    const notificationEmail = await resend.emails.send({
      from: "Janos Hada Photography <hello@jimmyhada.com>",
      to: ["hello@jimmyhada.com"],
      reply_to: data.email,
      subject: `🎉 Cerere Nouă: ${data.name} - ${getEventTypeLabel(data.eventType, "ro")}`,
      html: generateNotificationEmail(data),
    });

    console.log("Notification email sent:", notificationEmail);

    // Send confirmation email to client
    const confirmationEmail = await resend.emails.send({
      from: "Janos Hada Photography <hello@jimmyhada.com>",
      to: [data.email],
      subject: data.language === "ro" 
        ? "Mulțumim pentru mesaj! | Janos Hada Photography" 
        : "Thank you for your message! | Janos Hada Photography",
      html: generateConfirmationEmail(data),
    });

    console.log("Confirmation email sent:", confirmationEmail);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Emails sent successfully",
        notificationId: notificationEmail.data?.id,
        confirmationId: confirmationEmail.data?.id,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-contact-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || "An unexpected error occurred" 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
