/*
  Ejemplo avanzado de integración de Khipu en Astro (Modo Desarrollador)
  -------------------------------------------------------------------
  Soporta componentes de React y Svelte.

  Estructura de proyecto:
  ----------------------
  astro-khipu-demo/
  ├ .env
  ├ astro.config.mjs
  ├ package.json
  ├ tsconfig.json
  ├ styles/
  │  └ global.css
  └ src/
     ├ layouts/
     │  └ BaseLayout.astro
     ├ components/
     │  ├ React/
     │  │  └ PaymentForm.jsx
     │  └ Svelte/
     │     └ PaymentForm.svelte
     └ pages/
        ├ index.astro
        └ api/
           └ create-payment.ts

  1) .env
     --------
     KHIPU_RECEIVER_ID=tu_receiver_id_de_sandbox
     KHIPU_SECRET=tu_secret_de_sandbox

  2) astro.config.mjs
     -----------------
     import dotenv from 'dotenv';
     import react from '@astrojs/react';
     import svelte from '@astrojs/svelte';
     
     dotenv.config();

     export default {
       integrations: [react(), svelte()],
       vite: {
         define: {
           'import.meta.env.KHIPU_RECEIVER_ID': JSON.stringify(process.env.KHIPU_RECEIVER_ID),
           'import.meta.env.KHIPU_SECRET': JSON.stringify(process.env.KHIPU_SECRET),
         }
       }
     };

  3) src/pages/api/create-payment.ts
     ---------------------------------
     import type { APIRoute } from 'astro';

     export const post: APIRoute = async ({ request }) => {
       const { amount, currency, subject } = await request.json();
       const receiverId = import.meta.env.KHIPU_RECEIVER_ID;
       const secret     = import.meta.env.KHIPU_SECRET;

       const params = new URLSearchParams({
         receiver_id: receiverId,
         amount: String(amount),
         currency,
         subject,
         return_url: 'http://localhost:3000',
       });

       const authHeader = 'Basic ' + Buffer.from(`${receiverId}:${secret}`).toString('base64');
       const res = await fetch('https://khipu.com/api/2.0/payments', {
         method: 'POST',
         headers: {
           'Authorization': authHeader,
           'Content-Type': 'application/x-www-form-urlencoded'
         },
         body: params
       });

       if (!res.ok) {
         const err = await res.text();
         return new Response(err, { status: res.status });
       }

       const data = await res.json();
       return new Response(JSON.stringify({ payment_url: data.payment_url }), { status: 200 });
     };

  4) src/layouts/BaseLayout.astro
     -----------------------------
     ---
     const { children } = Astro.props;
     ---
     <html lang="es">
       <head>
         <meta charset="UTF-8" />
         <meta name="viewport" content="width=device-width, initial-scale=1.0" />
         <link rel="stylesheet" href="/styles/global.css" />
       </head>
       <body>
         <header><h1>Demo Khipu + Astro</h1></header>
         <main>{children}</main>
         <footer><p>© 2025 Mi Compañía</p></footer>
       </body>
     </html>

  5) src/components/React/PaymentForm.jsx
     --------------------------------------
     import React, { useState } from 'react';

     export default function PaymentForm() {
       const [amount, setAmount] = useState(1000);
       const [currency, setCurrency] = useState('CLP');
       const [subject, setSubject] = useState('Pago de prueba React');
       const [url, setUrl] = useState('');

       const createPayment = async () => {
         const res = await fetch('/api/create-payment', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ amount, currency, subject })
         });
         const { payment_url } = await res.json();
         setUrl(payment_url);
       };

       return (
         <div>
           <input type="text" value={subject} onChange={e => setSubject(e.target.value)} placeholder="Asunto" />
           <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} />
           <select value={currency} onChange={e => setCurrency(e.target.value)}>
             <option>CLP</option>
             <option>USD</option>
           </select>
           <button onClick={createPayment}>Crear pago (React)</button>
           {url && <a href={url} target="_blank">Ir a checkout</a>}
         </div>
       );
     }

  6) src/components/Svelte/PaymentForm.svelte
     -----------------------------------------
     <script>
       let amount = 1000;
       let currency = 'CLP';
       let subject = 'Pago de prueba Svelte';
       let url = '';

       async function createPayment() {
         const res = await fetch('/api/create-payment', {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ amount, currency, subject })
         });
         const data = await res.json();
         url = data.payment_url;
       }
     </script>

     <input bind:value={subject} placeholder="Asunto" />
     <input type="number" bind:value={amount} />
     <select bind:value={currency}>
       <option>CLP</option>
       <option>USD</option>
     </select>
     <button on:click={createPayment}>Crear pago (Svelte)</button>
     {#if url}
       <a href={url} target="_blank">Ir a checkout</a>
     {/if}

  7) src/pages/index.astro
     -----------------------
     ---
     import BaseLayout from '../layouts/BaseLayout.astro';
     import PaymentFormReact from '../components/React/PaymentForm.jsx';
     import PaymentFormSvelte from '../components/Svelte/PaymentForm.svelte';
     ---

     <BaseLayout>
       <section>
         <h2>Componente React</h2>
         <PaymentFormReact />
       </section>
       <section>
         <h2>Componente Svelte</h2>
         <PaymentFormSvelte />
       </section>
     </BaseLayout>

  8) styles/global.css
     -------------------
     body { font-family: system-ui, sans-serif; margin: 0; padding: 0; }
     header, footer { background: #f0f0f0; padding: 1rem; text-align: center; }
     main { padding: 2rem; }

  9) Instalar dependencias y ejecutar:
     ----------------------------------
     npm install astro @astrojs/react @astrojs/svelte react react-dom svelte dotenv
     npm run dev
*/
