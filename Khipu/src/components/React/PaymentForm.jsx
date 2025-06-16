import React, { useState } from 'react';

export default function PaymentForm() {
  const [formData, setFormData] = useState({
    amount: 1000,
    currency: 'CLP',
    subject: 'Producto de ejemplo'
  });
  const [paymentUrl, setPaymentUrl] = useState('');
  const [paymentId, setPaymentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? Number(value) : value
    }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (formData.amount <= 0) {
      setError('El monto debe ser mayor a 0');
      return false;
    }
    if (!formData.subject.trim()) {
      setError('El asunto es requerido');
      return false;
    }
    return true;
  };

  const createPayment = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess(false);

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

      setPaymentUrl(data.payment_url);
      setPaymentId(data.payment_id);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="payment-form react-form">
      <div className="form-header">
        <div className="framework-badge react">React</div>
        <h3>Formulario de Pago</h3>
        <p>Crea un pago usando React y la API de Khipu</p>
      </div>

      <div className="form-body">
        <div className="form-group">
          <label htmlFor="react-subject">Descripción del pago</label>
          <input
            id="react-subject"
            name="subject"
            type="text"
            value={formData.subject}
            onChange={handleInputChange}
            placeholder="Ej: Compra de producto"
            disabled={loading}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="react-amount">Monto</label>
            <input
              id="react-amount"
              name="amount"
              type="number"
              value={formData.amount}
              onChange={handleInputChange}
              min="1"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label htmlFor="react-currency">Moneda</label>
            <select
              id="react-currency"
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              disabled={loading}
            >
              <option value="CLP">CLP - Peso Chileno</option>
              <option value="USD">USD - Dólar</option>
            </select>
          </div>
        </div>

        <div className="amount-preview">
          Total: <strong>{formatCurrency(formData.amount, formData.currency)}</strong>
        </div>

        {error && (
          <div className="alert error">
            <span>⚠️</span>
            {error}
          </div>
        )}

        {success && (
          <div className="alert success">
            <span>✅</span>
            ¡Pago creado exitosamente!
          </div>
        )}

        <button
          onClick={createPayment}
          disabled={loading}
          className={`btn-primary ${loading ? 'loading' : ''}`}
        >
          {loading ? (
            <>
              <div className="spinner"></div>
              Creando pago...
            </>
          ) : (
            'Crear Pago con React'
          )}
        </button>

        {paymentUrl && (
          <div className="payment-result">
            <p>¡Pago creado! Haz clic para continuar:</p>
            <div className="payment-info">
              <div className="payment-id">
                <strong>ID del Pago:</strong> 
                <code>{paymentId}</code>
                <button 
                  onClick={() => navigator.clipboard.writeText(paymentId)}
                  className="copy-btn"
                  title="Copiar ID"
                >
                  📋
                </button>
              </div>
            </div>
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary"
            >
              Ir a Khipu Checkout 🚀
            </a>
          </div>
        )}
      </div>

      <style dangerouslySetInnerHTML={{
        __html: `
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

        .framework-badge.react {
          background: linear-gradient(135deg, #61dafb, #21759b);
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
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-group input:disabled,
        .form-group select:disabled {
          background: #f9fafb;
          color: #6b7280;
        }

        .amount-preview {
          background: #f0f9ff;
          border: 2px solid #bae6fd;
          border-radius: 0.5rem;
          padding: 1rem;
          text-align: center;
          margin-bottom: 1.5rem;
          font-size: 1.125rem;
          color: #0c4a6e;
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
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          color: white;
          margin-bottom: 1rem;
        }

        .btn-primary:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb, #1e40af);
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
        `
      }} />
    </div>
  );
}