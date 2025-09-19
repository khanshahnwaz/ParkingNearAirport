// app/api/razorpay/route.js
import { NextResponse } from 'next/server';
import Razorpay from 'razorpay';

export async function POST(req) {
  const { amount } = await req.json();

  if (!amount || amount <= 0) {
    return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
  }

  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });

  const options = {
    amount: amount * 100, // Amount in paisa
    currency: "INR",
    receipt: `receipt_order_${Date.now()}`,
    payment_capture: 1, // Auto-capture the payment
  };

  try {
    const order = await razorpay.orders.create(options);
    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Order creation failed', details: error.message }, { status: 500 });
  }
}