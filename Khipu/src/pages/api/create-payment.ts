import type { APIRoute } from 'astro';

interface PaymentRequest {
  amount: number;
  currency: string;
  subject: string;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    // Check if request has body
    const contentType = request.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return new Response(
        JSON.stringify({ error: 'Content-Type must be application/json' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const text = await request.text();
    if (!text.trim()) {
      return new Response(
        JSON.stringify({ error: 'Request body is empty' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    let requestData: PaymentRequest;
    try {
      requestData = JSON.parse(text);
    } catch (parseError) {
      return new Response(
        JSON.stringify({ error: 'Invalid JSON in request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { amount, currency, subject } = requestData;

    // Validate input
    if (!amount || amount <= 0) {
      return new Response(
        JSON.stringify({ error: 'Amount must be greater than 0' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!subject || subject.trim().length === 0) {
      return new Response(
        JSON.stringify({ error: 'Subject is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const receiverId = import.meta.env.KHIPU_RECEIVER_ID;
    const secret = import.meta.env.KHIPU_SECRET;
    const apiKey = import.meta.env.KHIPU_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Khipu API Key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Prepare payment data for API 3.0
    const paymentData = {
      amount,
      currency,
      subject: subject.trim(),
      return_url: `${new URL(request.url).origin}/payment-success`,
      cancel_url: `${new URL(request.url).origin}/payment-cancelled`,
      // notify_url: `${new URL(request.url).origin}/api/payment-notification`, // Comentado para desarrollo local
      expires_date: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
    };

    console.log('Creating payment with API 3.0:', {
      url: 'https://payment-api.khipu.com/v3/payments',
      amount,
      currency,
      subject: subject.trim()
    });

    // Debug: Log API key (partial for security)
    console.log('Using API Key:', apiKey ? `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}` : 'NOT_SET');
    console.log('Request payload:', JSON.stringify(paymentData, null, 2));

    // Make request to Khipu API 3.0
    const response = await fetch('https://payment-api.khipu.com/v3/payments', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(paymentData)
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Khipu API Error Response:', errorText);
      console.error('Full error details:', {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create payment',
          details: response.status === 401 ? 'Invalid credentials' : 'Service unavailable',
          khipuError: errorText
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Khipu API Success Response:', JSON.stringify(data, null, 2));
    
    // Check if the response contains an error even with 200 status
    if (data.error_payment_post_payments) {
      const errorDetails = JSON.parse(data.error_payment_post_payments.http_body);
      console.error('Khipu API returned an error:', errorDetails);
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to create payment',
          details: errorDetails.message || 'Validation error',
          khipuError: errorDetails
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        payment_url: data.payment_url,
        payment_id: data.payment_id,
        amount: data.amount,
        currency: data.currency,
        subject: data.subject
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Payment creation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};