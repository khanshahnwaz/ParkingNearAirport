import { useState } from 'react';
import emailjs from "emailjs-com";

// --- Configuration ---
// !!! IMPORTANT: Update this base URL to point to your PHP backend directory !!!
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE;
const EMAILJS_SERVICE_ID = process.env.NEXT_PUBLIC_EMAILJS_SERVICE_ID;
const EMAILJS_TEMPLATE_ID = process.env.NEXT_PUBLIC_EMAILJS_TEMPLATE_ID;
const EMAILJS_PUBLIC_KEY = process.env.NEXT_PUBLIC_EMAILJS_PUBLIC_KEY;

/**
 * Handles all API calls using POST method as required by the PHP config.
 * Implements exponential backoff for resilience.
 */
export const apiFetch = async (endpoint, payload = {}) => {
    const url = `${API_BASE_URL}/${endpoint}`;
    const maxRetries = 3;
    let lastError = null;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            console.log("payload ",payload)
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (!data.ok) {
                // PHP APIs return { ok: false, error: '...' } on failure
                throw new Error(data.error || 'API response indicated failure.');
            }

            return data.data;

        } catch (error) {
            lastError = error;
            console.error(`Attempt ${attempt + 1} failed for ${endpoint}:`, error);

            if (attempt < maxRetries - 1) {
                // Exponential backoff
                const delay = Math.pow(2, attempt) * 1000;
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    // If all retries fail, throw the last error
    throw new Error(`Failed to fetch ${endpoint} after ${maxRetries} attempts. Last error: ${lastError.message}`);
};




// buildEmailPayload
export function buildEmailPayload(orderRecord) {
  const bookingDetails = orderRecord.booking_details;
  const isConfirmed = orderRecord.status === 'ACCEPTED';
  // Green for success
  const headerColor = '#10b981'; 

  // Convert amounts from cents to dollars for display
  const totalPaid = orderRecord.amount; 

  // --- 1. Generate Dynamic Line Items HTML (for {{order_details_html}}) ---
  const lineItems = bookingDetails.lineItems || [
    // Fallback if lineItems array is missing
    { name: bookingDetails.name || 'Booking Fee', price: bookingDetails.base,duration:bookingDetails.duration,CancellationCoverage:bookingDetails.cancellation?"YES":"NO" }
  ];
  
  let itemsHtml = '<table style="width: 100%; border-collapse: collapse; margin-bottom: 10px;">';
  itemsHtml += '<thead><tr>';
  itemsHtml += '<th style="text-align: left; padding: 8px 0; border-bottom: 1px solid #ddd; color: #555;">Item/Service</th>';
  itemsHtml += '<th style="text-align: right; padding: 8px 0; border-bottom: 1px solid #ddd; color: #555;">Price</th>';
    itemsHtml += '<th style="text-align: right; padding: 8px 0; border-bottom: 1px solid #ddd; color: #555;">Duration</th>';
  itemsHtml += '<th style="text-align: right; padding: 8px 0; border-bottom: 1px solid #ddd; color: #555;">CancellationCoverage</th>';

  itemsHtml += '</tr></thead><tbody>';

  // let subtotal = 0;
  lineItems.forEach(item => {
    // Prices in the database are stored in cents, convert to dollars
    const price = (item.price || 0) ;
    itemsHtml += '<tr>';
    itemsHtml += `<td style="text-align: left; padding: 6px 0; color: #333;">${item.name}</td>`;
    itemsHtml += `<td style="text-align: right; padding: 6px 0; color: #333;">£${price.toFixed(2)}</td>`;
        itemsHtml += `<td style="text-align: right; padding: 6px 0; color: #333;">${item.duration}</td>`;
    itemsHtml += `<td style="text-align: right; padding: 6px 0; color: #333;">${item.CancellationCoverage}</td>`;

    // subtotal += price;
    itemsHtml += '</tr>';
  });
  itemsHtml += '</tbody></table>';

  // --- 2. Generate Discount Row HTML (for {{discount_html}}) ---
  const discountAmount = (bookingDetails.discount || 0);
  let discountHtml = '';

  // The displayed subtotal is the total *before* the discount was applied.
  const displaySubtotal = totalPaid - discountAmount;

  if (discountAmount > 0) {
    discountHtml = `
      <tr>
        <td style="padding: 4px 0; width: 65%; text-align: right; color: #ef4444; font-weight: 500;">Discount (Code: ${bookingDetails.promoCode || 'N/A'}):</td>
        <td style="padding: 4px 0; width: 35%; text-align: right; color: #ef4444;">- $${discountAmount.toFixed(2)}</td>
      </tr>`;
  }
  
  // --- 3. Build the Final Payload ---
  return {
    email: bookingDetails.email || orderRecord.user_email,
    user_name: bookingDetails.firstName|| 'Customer',
    header_color: headerColor,
    main_title: 'Your Booking is Confirmed!',
    main_message: 'Your reservation is now complete! Here are your details.',
    
    // Detailed Order Info
    booking_id: orderRecord.id,
    date_time: new Date(orderRecord.created_at).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }), 
    payment_status: orderRecord.status,
    payment_method: 'Stripe (Card)', 
    transaction_id: orderRecord.stripe_session_id || 'N/A', 
    
    // Financials
    order_details_html: itemsHtml,
    subtotal: `£${displaySubtotal.toFixed(2)}`,
    discount_html: discountHtml,
    cancellation:`${bookingDetails.cancellation?"YES":"NO"}`,
    total_amount: `£${totalPaid}`,

    // Action/Policy
    action_button_text: 'Manage Booking',
    action_link: process.env.NEXT_PUBLIC_BASE,
    cancellation_policy_message: 'Please review our terms and conditions for cancellation or modification. All changes must be made 24 hours in advance.',
  };
}



export async function sendConfirmationEmail(payload) {

  // console.log("payload ",payload)
  try {
    emailjs.init(EMAILJS_PUBLIC_KEY);

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID,
      payload
    );

    console.log("✅ Email successfully sent!", response.status, response.text);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
  }
}
