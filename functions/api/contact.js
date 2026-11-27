/**
 * Cloudflare Pages Function: /api/contact
 * Handles multi-intent quote inquiries, AI/CRM audits, and Linux hosting orders.
 */

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

function jsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      ...CORS_HEADERS,
    },
  });
}

function sanitizeText(value, maxLength = 2000) {
  if (typeof value !== 'string') return '';
  return value.replace(/<[^>]*>/g, '').trim().slice(0, maxLength);
}

export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

export async function onRequestPost(context) {
  try {
    const contentType = context.request.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return jsonResponse({ success: false, error: 'Expected application/json payload.' }, 400);
    }

    const body = await context.request.json();

    // Anti-spam honeypot trap: silently succeed for bots
    if (body.website_url_hp && String(body.website_url_hp).trim().length > 0) {
      const botRef = `NX-${Date.now().toString(36).toUpperCase()}`;
      return jsonResponse({
        success: true,
        referenceId: botRef,
        message: `Thank you! Your inquiry has been logged by NEXSORA. Reference ID: ${botRef}`,
      });
    }

    const name = sanitizeText(body.name, 120);
    const email = sanitizeText(body.email, 160);
    const phone = sanitizeText(body.phone, 40);
    const company = sanitizeText(body.company, 140);
    const service = sanitizeText(body.service, 80);
    const plan = sanitizeText(body.plan, 40);
    const budget = sanitizeText(body.budget, 120);
    const message = sanitizeText(body.message, 3000);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (name.length < 2) {
      return jsonResponse({ success: false, error: 'Please enter your full name (at least 2 characters).' }, 400);
    }
    if (!emailRegex.test(email)) {
      return jsonResponse({ success: false, error: 'Please provide a valid work email address.' }, 400);
    }
    if (phone.length < 7) {
      return jsonResponse({ success: false, error: 'Please provide a valid phone or WhatsApp number.' }, 400);
    }
    if (!service) {
      return jsonResponse({ success: false, error: 'Please select a service or hosting inquiry.' }, 400);
    }
    if (message.length < 10) {
      return jsonResponse({ success: false, error: 'Please share at least 10 characters about your project or hosting needs.' }, 400);
    }

    const referenceId = `NX-${Date.now().toString(36).toUpperCase()}`;
    const leadRecord = {
      referenceId,
      name,
      email,
      phone,
      company: company || 'N/A',
      service,
      plan: plan || 'N/A',
      budget: budget || 'N/A',
      message,
      submittedAt: new Date().toISOString(),
    };

    // Optional Resend Email API notification (configure RESEND_API_KEY in Cloudflare Pages Secrets)
    if (context.env && context.env.RESEND_API_KEY) {
      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${context.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'NEXSORA Lead Engine <noreply@nexsorasolution.com>',
          to: ['hello@nexsorasolution.com'],
          reply_to: email,
          subject: `[${referenceId}] New NEXSORA Inquiry: ${service}${plan ? ` (${plan})` : ''}`,
          text: [
            `Reference ID: ${referenceId}`,
            `Name: ${name}`,
            `Email: ${email}`,
            `Phone/WhatsApp: ${phone}`,
            `Company/Domain: ${leadRecord.company}`,
            `Service: ${service}`,
            `Hosting Plan: ${leadRecord.plan}`,
            `Budget/Timeline: ${leadRecord.budget}`,
            '',
            'Message:',
            message,
          ].join('\n'),
        }),
      });
    }

    // Optional Automation Webhook (Slack, CRM, WhatsApp) via LEAD_WEBHOOK_URL secret
    if (context.env && context.env.LEAD_WEBHOOK_URL) {
      await fetch(context.env.LEAD_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(leadRecord),
      });
    }

    return jsonResponse({
      success: true,
      referenceId,
      message: `Thank you! Your inquiry has been logged by NEXSORA. Reference ID: ${referenceId}`,
    });
  } catch (err) {
    return jsonResponse(
      { success: false, error: 'Unable to process your inquiry right now. Please try again or email hello@nexsorasolution.com.' },
      500
    );
  }
}

export async function onRequest() {
  return jsonResponse({ success: false, error: 'Method not allowed.' }, 405);
}

