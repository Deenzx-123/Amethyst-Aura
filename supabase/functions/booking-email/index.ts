import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function formatServices(services: any[]): string {
  return services
    .map((s: any) =>
      typeof s === 'string'
        ? `<tr>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#cccccc;font-size:14px;">${s}</td>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;text-align:right;color:#c9a84c;font-size:14px;">—</td>
          </tr>`
        : `<tr>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;color:#cccccc;font-size:14px;">${s.name}</td>
            <td style="padding:10px 0;border-bottom:1px solid #2a2a2a;text-align:right;color:#c9a84c;font-size:14px;">₦${s.price?.toLocaleString() ?? "—"}</td>
          </tr>`
    )
    .join("");
}

function adminEmailHtml(data: any): string {
  const { name, email, phone, date, time, services, total_price, receipt_url } = data;
  const serviceRows = Array.isArray(services) ? formatServices(services) : `<tr><td colspan="2" style="color:#cccccc;padding:10px 0;">No services listed</td></tr>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>New Booking</title></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#111111;border-top:3px solid #c9a84c;padding:40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:6px;color:#c9a84c;text-transform:uppercase;">Amethyst Aura Aesthetics Spa</p>
            <h1 style="margin:0;font-size:28px;color:#ffffff;font-weight:normal;letter-spacing:2px;">New Booking Received</h1>
            <div style="width:40px;height:1px;background:#c9a84c;margin:20px auto 0;"></div>
          </td>
        </tr>
        <tr>
          <td style="background:#1a1600;border-left:3px solid #c9a84c;border-right:3px solid #c9a84c;padding:16px 40px;text-align:center;">
            <p style="margin:0;font-size:13px;color:#c9a84c;letter-spacing:3px;text-transform:uppercase;">⚡ Payment Receipt Uploaded — Action Required</p>
          </td>
        </tr>
        <tr>
          <td style="background:#141414;border-left:3px solid #c9a84c;border-right:3px solid #c9a84c;padding:36px 40px 0;">
            <p style="margin:0 0 20px;font-size:10px;letter-spacing:4px;color:#c9a84c;text-transform:uppercase;">Customer Details</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;color:#888888;font-size:12px;letter-spacing:2px;text-transform:uppercase;width:120px;">Name</td>
                <td style="padding:8px 0;color:#ffffff;font-size:14px;">${name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#888888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Email</td>
                <td style="padding:8px 0;color:#ffffff;font-size:14px;">${email}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#888888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Phone</td>
                <td style="padding:8px 0;color:#ffffff;font-size:14px;">${phone}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="background:#141414;border-left:3px solid #c9a84c;border-right:3px solid #c9a84c;padding:24px 40px;"><div style="height:1px;background:#2a2a2a;"></div></td></tr>
        <tr>
          <td style="background:#141414;border-left:3px solid #c9a84c;border-right:3px solid #c9a84c;padding:0 40px;">
            <p style="margin:0 0 20px;font-size:10px;letter-spacing:4px;color:#c9a84c;text-transform:uppercase;">Appointment</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="padding:8px 0;color:#888888;font-size:12px;letter-spacing:2px;text-transform:uppercase;width:120px;">Date</td>
                <td style="padding:8px 0;color:#ffffff;font-size:14px;">${date}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#888888;font-size:12px;letter-spacing:2px;text-transform:uppercase;">Time</td>
                <td style="padding:8px 0;color:#ffffff;font-size:14px;">${time}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr><td style="background:#141414;border-left:3px solid #c9a84c;border-right:3px solid #c9a84c;padding:24px 40px;"><div style="height:1px;background:#2a2a2a;"></div></td></tr>
        <tr>
          <td style="background:#141414;border-left:3px solid #c9a84c;border-right:3px solid #c9a84c;padding:0 40px 24px;">
            <p style="margin:0 0 16px;font-size:10px;letter-spacing:4px;color:#c9a84c;text-transform:uppercase;">Services Selected</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${serviceRows}
              <tr>
                <td style="padding:16px 0 0;color:#ffffff;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Total Investment</td>
                <td style="padding:16px 0 0;text-align:right;color:#c9a84c;font-size:20px;">₦${total_price?.toLocaleString() ?? "0"}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#141414;border-left:3px solid #c9a84c;border-right:3px solid #c9a84c;padding:0 40px 40px;">
            <div style="height:1px;background:#2a2a2a;margin-bottom:28px;"></div>
            <p style="margin:0 0 16px;font-size:10px;letter-spacing:4px;color:#c9a84c;text-transform:uppercase;">Payment Receipt</p>
            ${receipt_url
              ? `<a href="${receipt_url}" style="display:inline-block;background:#c9a84c;color:#000000;text-decoration:none;padding:14px 32px;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">View Receipt →</a>`
              : `<p style="color:#666666;font-size:13px;margin:0;">No receipt attached</p>`
            }
          </td>
        </tr>
        <tr>
          <td style="background:#0d0d0d;border:3px solid #c9a84c;border-top:none;padding:28px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#555555;letter-spacing:2px;">Log in to your admin dashboard to confirm this booking.</p>
          </td>
        </tr>
        <tr><td style="height:40px;"></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function customerEmailHtml(data: any): string {
  const { name, date, time, services, total_price } = data;
  const serviceRows = Array.isArray(services) ? formatServices(services) : `<tr><td colspan="2" style="color:#cccccc;padding:10px 0;">No services listed</td></tr>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Appointment Confirmed</title></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
        <tr>
          <td style="background:#111111;border-top:3px solid #c9a84c;padding:50px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:6px;color:#c9a84c;text-transform:uppercase;">Amethyst Aura Aesthetics Spa</p>
            <div style="width:40px;height:1px;background:#c9a84c;margin:20px auto;"></div>
            <div style="font-size:36px;margin-bottom:16px;">✦</div>
            <h1 style="margin:0 0 8px;font-size:32px;color:#ffffff;font-weight:normal;letter-spacing:2px;font-style:italic;">Your Ritual is Confirmed</h1>
            <p style="margin:16px 0 0;font-size:13px;color:#888888;letter-spacing:1px;">We are delighted to welcome you.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#141414;border-left:3px solid #c9a84c;border-right:3px solid #c9a84c;padding:36px 40px 24px;">
            <p style="margin:0;font-size:15px;color:#cccccc;line-height:1.8;">Dear <span style="color:#ffffff;">${name}</span>,</p>
            <p style="margin:16px 0 0;font-size:14px;color:#888888;line-height:1.8;">Your payment has been received and your appointment is now fully confirmed. We have everything prepared for your arrival and look forward to giving you an exceptional experience.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#141414;border-left:3px solid #c9a84c;border-right:3px solid #c9a84c;padding:0 40px 36px;">
            <div style="height:1px;background:#2a2a2a;margin-bottom:28px;"></div>
            <p style="margin:0 0 20px;font-size:10px;letter-spacing:4px;color:#c9a84c;text-transform:uppercase;">Your Appointment</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td style="background:#1a1a1a;border-left:2px solid #c9a84c;padding:20px 24px;width:50%;">
                  <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;">Date</p>
                  <p style="margin:0;font-size:16px;color:#ffffff;">${date}</p>
                </td>
                <td style="width:12px;"></td>
                <td style="background:#1a1a1a;border-left:2px solid #c9a84c;padding:20px 24px;width:50%;">
                  <p style="margin:0 0 6px;font-size:10px;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;">Time</p>
                  <p style="margin:0;font-size:16px;color:#ffffff;">${time}</p>
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#141414;border-left:3px solid #c9a84c;border-right:3px solid #c9a84c;padding:0 40px 36px;">
            <div style="height:1px;background:#2a2a2a;margin-bottom:28px;"></div>
            <p style="margin:0 0 16px;font-size:10px;letter-spacing:4px;color:#c9a84c;text-transform:uppercase;">Your Rituals</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${serviceRows}
              <tr>
                <td style="padding:16px 0 0;color:#ffffff;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Total Paid</td>
                <td style="padding:16px 0 0;text-align:right;color:#c9a84c;font-size:20px;">₦${total_price?.toLocaleString() ?? "0"}</td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="background:#111111;border-left:3px solid #c9a84c;border-right:3px solid #c9a84c;padding:36px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:14px;color:#888888;line-height:1.8;font-style:italic;">"Pure stillness awaits you."</p>
            <p style="margin:16px 0 0;font-size:12px;color:#555555;">Questions? Reply to this email and we will be in touch.</p>
          </td>
        </tr>
        <tr>
          <td style="background:#0d0d0d;border:3px solid #c9a84c;border-top:none;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;">Amethyst Aura Aesthetics Spa</p>
            <p style="margin:0;font-size:11px;color:#444444;letter-spacing:1px;">amethystauramedspa26@gmail.com</p>
          </td>
        </tr>
        <tr><td style="height:40px;"></td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function thankYouEmailHtml(data: any): string {
  const { name, services, total_price } = data;
  const serviceRows = Array.isArray(services) ? formatServices(services) : `<tr><td colspan="2" style="color:#cccccc;padding:10px 0;">No services listed</td></tr>`;

  return `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Thank You</title></head>
<body style="margin:0;padding:0;background:#0d0d0d;font-family:Georgia,serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d0d0d;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

        <!-- Header -->
        <tr>
          <td style="background:#111111;border-top:3px solid #c9a84c;padding:50px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:11px;letter-spacing:6px;color:#c9a84c;text-transform:uppercase;">Amethyst Aura Aesthetics Spa</p>
            <div style="width:40px;height:1px;background:#c9a84c;margin:20px auto;"></div>
            <div style="font-size:36px;margin-bottom:16px;">🤍</div>
            <h1 style="margin:0 0 8px;font-size:32px;color:#ffffff;font-weight:normal;letter-spacing:2px;font-style:italic;">Thank You, ${name}</h1>
            <p style="margin:16px 0 0;font-size:13px;color:#888888;letter-spacing:1px;">It was a pleasure having you with us.</p>
          </td>
        </tr>

        <!-- Message -->
        <tr>
          <td style="background:#141414;border-left:3px solid #c9a84c;border-right:3px solid #c9a84c;padding:36px 40px;">
            <p style="margin:0;font-size:14px;color:#888888;line-height:1.9;">We hope your experience at Amethyst Aura left you feeling restored, radiant, and completely at peace. It was truly our honour to care for you.</p>
            <p style="margin:20px 0 0;font-size:14px;color:#888888;line-height:1.9;">Your visit matters to us deeply, and we would love to hear about your experience.</p>
          </td>
        </tr>

        <!-- Services Summary -->
        <tr>
          <td style="background:#141414;border-left:3px solid #c9a84c;border-right:3px solid #c9a84c;padding:0 40px 36px;">
            <div style="height:1px;background:#2a2a2a;margin-bottom:28px;"></div>
            <p style="margin:0 0 16px;font-size:10px;letter-spacing:4px;color:#c9a84c;text-transform:uppercase;">Your Session</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              ${serviceRows}
              <tr>
                <td style="padding:16px 0 0;color:#ffffff;font-size:12px;letter-spacing:3px;text-transform:uppercase;">Total</td>
                <td style="padding:16px 0 0;text-align:right;color:#c9a84c;font-size:20px;">₦${total_price?.toLocaleString() ?? "0"}</td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- Review Request -->
        <tr>
          <td style="background:#1a1600;border-left:3px solid #c9a84c;border-right:3px solid #c9a84c;padding:36px 40px;text-align:center;">
            <p style="margin:0 0 8px;font-size:10px;letter-spacing:4px;color:#c9a84c;text-transform:uppercase;">Share Your Experience</p>
            <p style="margin:0 0 24px;font-size:14px;color:#888888;line-height:1.8;">Your feedback helps us grow and helps others discover the sanctuary they deserve. Would you take a moment to leave us a review?</p>
            <a href="https://amethystauraspa.com.ng/review"
               style="display:inline-block;background:#c9a84c;color:#000000;text-decoration:none;padding:14px 36px;font-size:11px;letter-spacing:3px;text-transform:uppercase;font-family:Arial,sans-serif;">
              Leave a Review ✦
            </a>
          </td>
        </tr>

        <!-- Come Back -->
        <tr>
          <td style="background:#111111;border-left:3px solid #c9a84c;border-right:3px solid #c9a84c;padding:36px 40px;text-align:center;">
            <p style="margin:0;font-size:14px;color:#888888;line-height:1.8;font-style:italic;">"Stillness is not the absence of life — it is its fullest expression."</p>
            <p style="margin:20px 0 0;font-size:13px;color:#666666;">We look forward to welcoming you back soon.</p>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#0d0d0d;border:3px solid #c9a84c;border-top:none;padding:24px 40px;text-align:center;">
            <p style="margin:0 0 4px;font-size:11px;letter-spacing:3px;color:#c9a84c;text-transform:uppercase;">Amethyst Aura Aesthetics Spa</p>
            <p style="margin:0;font-size:11px;color:#444444;letter-spacing:1px;">amethystauramedspa26@gmail.com</p>
          </td>
        </tr>
        <tr><td style="height:40px;"></td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { type, name, email, phone, services, total_price, date, time, receipt_url } = body;

    // PATH A: status → 'confirmed' → confirmation email to CUSTOMER
    if (type === 'confirmed') {
      await resend.emails.send({
        from: "Amethyst Aura <noreply@amethystauraspa.com.ng>",
        to: [email],
        subject: `✦ Your Appointment is Confirmed — Amethyst Aura`,
        html: customerEmailHtml({ name, date, time, services, total_price }),
      });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATH C: status → 'completed' → thank you + review email to CUSTOMER
    if (type === 'completed') {
      await resend.emails.send({
        from: "Amethyst Aura <noreply@amethystauraspa.com.ng>",
        to: [email],
        subject: `🤍 Thank You for Visiting — Amethyst Aura`,
        html: thankYouEmailHtml({ name, services, total_price }),
      });
      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // PATH B: receipt uploaded → notification email to ADMIN
    await resend.emails.send({
      from: "Amethyst Aura <noreply@amethystauraspa.com.ng>",
      to: ["amethystauramedspa26@gmail.com"],
      subject: `⚡New Booking Received: ${name} — Action Required`,
      html: adminEmailHtml({ name, email, phone, date, time, services, total_price, receipt_url }),
    });
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error("Function error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
