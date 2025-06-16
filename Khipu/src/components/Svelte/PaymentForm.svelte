<script>
  let formData = {
    amount: 1500,
    currency: 'CLP',
    subject: 'Servicio premium'
  };
  let paymentUrl = '';
  let loading = false;
  let error = '';
  let success = false;

  function handleInputChange(event) {
    const { name, value } = event.target;
    formData = {
      ...formData,
      [name]: name === 'amount' ? Number(value) : value
    };
    error = ''; // Clear error when user types
  }

  function validateForm() {
    if (formData.amount <= 0) {
      error = 'El monto debe ser mayor a 0';
      return false;
    }
    if (!formData.subject.trim()) {
      error = 'El asunto es requerido';
      return false;
    }
    return true;
  }

  async function createPayment() {
    if (!validateForm()) return;

    loading = true;
    error = '';
    success = false;

    try {
      const response = await fetch('/api/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al crear el pago');
      }

      paymentUrl = data.payment_url;
      success = true;
    } catch (err) {
      error = err.message || 'Error al procesar el pago';
    } finally {
      loading = false;
    }
  }

  function formatCurrency(amount, currency) {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  }
</script>

<div class="payment-form svelte-form">
  <div class="form-header">
    <div class="framework-badge svelte">Svelte</div>
    <h3>Formulario de Pago</h3>
    <p>Crea un pago usando Svelte y la API de Khipu</p>
  </div>

  <div class="form-body">
    <div class="form-group">
      <label for="svelte-subject">Descripción del pago</label>
      <input
        id="svelte-subject"
        name="subject"
        type="text"
        bind:value={formData.subject}
        on:input={handleInputChange}
        placeholder="Ej: Suscripción mensual"
        disabled={loading}
      />
    </div>

    <div class="form-row">
      <div class="form-group">
        <label for="svelte-amount">Monto</label>
        <input
          id="svelte-amount"
          name="amount"
          type="number"
          bind:value={formData.amount}
          on:input={handleInputChange}
          min="1"
          disabled={loading}
        />
      </div>

      <div class="form-group">
        <label for="svelte-currency">Moneda</label>
        <select
          id="svelte-currency"
          name="currency"
          bind:value={formData.currency}
          on:change={handleInputChange}
          disabled={loading}
        >
          <option value="CLP">CLP - Peso Chileno</option>
          <option value="USD">USD - Dólar</option>
        </select>
      </div>
    </div>

    <div class="amount-preview">
      Total: <strong>{formatCurrency(formData.amount, formData.currency)}</strong>
    </div>

    {#if error}
      <div class="alert error">
        <span>⚠️</span>
        {error}
      </div>
    {/if}

    {#if success}
      <div class="alert success">
        <span>✅</span>
        ¡Pago creado exitosamente!
      </div>
    {/if}

    <button
      on:click={createPayment}
      disabled={loading}
      class="btn-primary"
      class:loading
    >
      {#if loading}
        <div class="spinner"></div>
        Creando pago...
      {:else}
        Crear Pago con Svelte
      {/if}
    </button>

    {#if paymentUrl}
      <div class="payment-result">
        <p>¡Pago creado! Haz clic para continuar:</p>
        <a
          href={paymentUrl}
          target="_blank"
          rel="noopener noreferrer"
          class="btn-secondary"
        >
          Ir a Khipu Checkout 🚀
        </a>
      </div>
    {/if}
  </div>
</div>

<style>
  .payment-form {
    background: white;
    border-radius: 1rem;
    padding: 2rem;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    backdrop-filter: blur(10px);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .payment-form:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
  }

  .form-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .framework-badge {
    display: inline-block;
    padding: 0.5rem 1rem;
    border-radius: 2rem;
    font-size: 0.875rem;
    font-weight: 600;
    margin-bottom: 1rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .framework-badge.svelte {
    background: linear-gradient(135deg, #ff3e00, #ff8a00);
    color: white;
  }

  .form-header h3 {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 0.5rem;
    color: #1f2937;
  }

  .form-header p {
    color: #6b7280;
    font-size: 0.875rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1rem;
  }

  .form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #374151;
    font-size: 0.875rem;
  }

  .form-group input,
  .form-group select {
    width: 100%;
    padding: 0.75rem 1rem;
    border: 2px solid #e5e7eb;
    border-radius: 0.5rem;
    font-size: 1rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    background: white;
  }

  .form-group input:focus,
  .form-group select:focus {
    outline: none;
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
  }

  .form-group input:disabled,
  .form-group select:disabled {
    background: #f9fafb;
    color: #6b7280;
  }

  .amount-preview {
    background: #fff7ed;
    border: 2px solid #fed7aa;
    border-radius: 0.5rem;
    padding: 1rem;
    text-align: center;
    margin-bottom: 1.5rem;
    font-size: 1.125rem;
    color: #c2410c;
  }

  .alert {
    padding: 1rem;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.875rem;
  }

  .alert.error {
    background: #fef2f2;
    border: 1px solid #fecaca;
    color: #dc2626;
  }

  .alert.success {
    background: #f0fdf4;
    border: 1px solid #bbf7d0;
    color: #16a34a;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-decoration: none;
    text-align: center;
  }

  .btn-primary {
    background: linear-gradient(135deg, #f97316, #ea580c);
    color: white;
    margin-bottom: 1rem;
  }

  .btn-primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #ea580c, #dc2626);
    transform: translateY(-1px);
  }

  .btn-primary:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  .btn-secondary {
    background: linear-gradient(135deg, #10b981, #059669);
    color: white;
  }

  .btn-secondary:hover {
    background: linear-gradient(135deg, #059669, #047857);
    transform: translateY(-1px);
  }

  .spinner {
    width: 1rem;
    height: 1rem;
    border: 2px solid rgba(255, 255, 255, 0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }

  .payment-result {
    text-align: center;
    padding: 1.5rem;
    background: #f0fdf4;
    border-radius: 0.5rem;
    border: 1px solid #bbf7d0;
  }

  .payment-result p {
    margin-bottom: 1rem;
    color: #16a34a;
    font-weight: 500;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .form-row {
      grid-template-columns: 1fr;
    }
    
    .payment-form {
      padding: 1.5rem;
    }
  }
</style>