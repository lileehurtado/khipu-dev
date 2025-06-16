import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params, request }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Payment ID is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = import.meta.env.KHIPU_API_KEY;

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Khipu API Key not configured' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    console.log('Fetching payment status for ID:', id);

    // Make request to Khipu API 3.0
    const response = await fetch(`https://payment-api.khipu.com/v3/payments/${id}`, {
      method: 'GET',
      headers: {
        'x-api-key': apiKey,
        'Accept': 'application/json'
      }
    });    console.log('Payment status response:', response.status);

    if (!response.ok) {
      let errorDetails = 'Service unavailable';
      try {
        const errorText = await response.text();
        console.error('Khipu API Error:', errorText);
        
        // Try to parse as JSON for better error details
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.message || errorJson.error || errorText;
        } catch {
          errorDetails = errorText || `HTTP ${response.status}`;
        }
      } catch (readError) {
        console.error('Could not read error response:', readError);
        errorDetails = `HTTP ${response.status}`;
      }
      
      return new Response(
        JSON.stringify({ 
          error: 'Failed to fetch payment status',
          details: response.status === 404 ? 'Payment not found' : errorDetails,
          status_code: response.status
        }),
        { status: response.status, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('Payment status data:', JSON.stringify(data, null, 2));
    
    // Return essential payment status information
    return new Response(
      JSON.stringify({ 
        payment_id: data.payment_id,
        status: data.status,
        status_detail: data.status_detail,
        amount: data.amount,
        currency: data.currency,
        subject: data.subject,
        conciliation_date: data.conciliation_date,
        payment_method: data.payment_method,
        bank: data.bank,
        payer_name: data.payer_name,
        expires_date: data.expires_date,
        // URLs útiles
        payment_url: data.payment_url,
        receipt_url: data.receipt_url
      }),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Payment status error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
