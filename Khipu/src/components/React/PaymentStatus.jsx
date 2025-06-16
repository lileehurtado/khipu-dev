import React, { useState } from 'react';

export default function PaymentStatus() {
  const [paymentId, setPaymentId] = useState('');
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchPaymentStatus = async () => {
    if (!paymentId.trim()) {
      setError('Ingresa un ID de pago válido');
      return;
    }

    setLoading(true);
    setError('');
    setPaymentStatus(null);

    try {
      const response = await fetch(`/api/payment-status/${paymentId.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al consultar el estado del pago');
      }

      setPaymentStatus(data);
    } catch (err) {
      setError(err.message || 'Error al consultar el estado del pago');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'done': return '#22c55e'; // green
      case 'verifying': return '#f59e0b'; // amber
      case 'pending': return '#6b7280'; // gray
      default: return '#ef4444'; // red
    }
  };

  const getStatusText = (status, statusDetail) => {
    switch (status) {
      case 'done': 
        return statusDetail === 'normal' ? '✅ Pagado' : '✅ Completado';
      case 'verifying': 
        return '🔄 Verificando';
      case 'pending': 
        return '⏳ Pendiente';
      default: 
        return '❌ Error';
    }
  };

  const formatCurrency = (amount, currency) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('es-CL');
  };

  return (
    <div className="payment-status react-status">
      <div className="form-header">
        <div className="framework-badge react">React</div>
        <h3>Consultar Estado de Pago</h3>
        <p>Verifica el estado actual de un pago usando su ID</p>
      </div>

      <div className="form-group">
        <label htmlFor="paymentId">ID del Pago:</label>
        <input
          type="text"
          id="paymentId"
          value={paymentId}
          onChange={(e) => setPaymentId(e.target.value)}
          placeholder="Ej: gqzdy6chjne9"
          className="form-input"
        />
      </div>

      {error && (
        <div className="alert error">
          <span>⚠️</span>
          {error}
        </div>
      )}

      <button
        onClick={fetchPaymentStatus}
        disabled={loading}
        className={`btn-primary ${loading ? 'loading' : ''}`}
      >
        {loading ? (
          <>
            <div className="spinner"></div>
            Consultando...
          </>
        ) : (
          'Consultar Estado'
        )}
      </button>

      {paymentStatus && (
        <div className="payment-result">
          <div className="status-header">
            <h4>Estado del Pago</h4>
            <div 
              className="status-badge"
              style={{ backgroundColor: getStatusColor(paymentStatus.status) }}
            >
              {getStatusText(paymentStatus.status, paymentStatus.status_detail)}
            </div>
          </div>

          <div className="payment-details">
            <div className="detail-group">
              <strong>ID de Pago:</strong>
              <span>{paymentStatus.payment_id}</span>
            </div>

            <div className="detail-group">
              <strong>Asunto:</strong>
              <span>{paymentStatus.subject}</span>
            </div>

            <div className="detail-group">
              <strong>Monto:</strong>
              <span>{formatCurrency(paymentStatus.amount, paymentStatus.currency)}</span>
            </div>

            {paymentStatus.payment_method && (
              <div className="detail-group">
                <strong>Método de Pago:</strong>
                <span>
                  {paymentStatus.payment_method === 'simplified_transfer' 
                    ? 'Transferencia Simplificada' 
                    : 'Transferencia Regular'}
                </span>
              </div>
            )}

            {paymentStatus.bank && (
              <div className="detail-group">
                <strong>Banco:</strong>
                <span>{paymentStatus.bank}</span>
              </div>
            )}

            {paymentStatus.payer_name && (
              <div className="detail-group">
                <strong>Pagador:</strong>
                <span>{paymentStatus.payer_name}</span>
              </div>
            )}

            <div className="detail-group">
              <strong>Fecha de Expiración:</strong>
              <span>{formatDate(paymentStatus.expires_date)}</span>
            </div>

            {paymentStatus.conciliation_date && (
              <div className="detail-group">
                <strong>Fecha de Conciliación:</strong>
                <span>{formatDate(paymentStatus.conciliation_date)}</span>
              </div>
            )}
          </div>

          {paymentStatus.status === 'pending' && paymentStatus.payment_url && (
            <div className="action-buttons">
              <a
                href={paymentStatus.payment_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Completar Pago 💳
              </a>
            </div>
          )}

          {paymentStatus.receipt_url && paymentStatus.status === 'done' && (
            <div className="action-buttons">
              <a
                href={paymentStatus.receipt_url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
              >
                Ver Comprobante 📄
              </a>
            </div>
          )}
        </div>
      )}

      <style dangerouslySetInnerHTML={{
        __html: `
        .payment-status {
          background: white;
          border-radius: 1rem;
          padding: 2rem;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          margin-top: 2rem;
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
          background: linear-gradient(135deg, #61dafb, #21759b);
          color: white;
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #374151;
        }

        .form-input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 2px solid #e5e7eb;
          border-radius: 0.5rem;
          font-size: 1rem;
          transition: border-color 0.2s ease;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .alert {
          padding: 1rem;
          border-radius: 0.5rem;
          margin-bottom: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .alert.error {
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .btn-primary {
          width: 100%;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
          padding: 1rem 2rem;
          border-radius: 0.5rem;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .btn-primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(102, 126, 234, 0.4);
        }

        .btn-primary:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .btn-secondary {
          display: inline-block;
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          text-decoration: none;
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: all 0.2s ease;
          margin: 0.5rem;
        }

        .btn-secondary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(240, 147, 251, 0.4);
        }

        .spinner {
          width: 1rem;
          height: 1rem;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .payment-result {
          background: #f8fafc;
          border-radius: 0.75rem;
          padding: 1.5rem;
          border: 1px solid #e2e8f0;
        }

        .status-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e2e8f0;
        }

        .status-header h4 {
          margin: 0;
          color: #1f2937;
        }

        .status-badge {
          padding: 0.5rem 1rem;
          border-radius: 2rem;
          color: white;
          font-weight: 600;
          font-size: 0.875rem;
        }

        .payment-details {
          display: grid;
          gap: 1rem;
        }

        .detail-group {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1rem;
          padding: 0.75rem;
          background: white;
          border-radius: 0.5rem;
          border: 1px solid #e5e7eb;
        }

        .detail-group strong {
          color: #374151;
        }

        .detail-group span {
          color: #1f2937;
          word-break: break-all;
        }        .action-buttons {
          margin-top: 1.5rem;
          text-align: center;
          padding-top: 1rem;
          border-top: 1px solid #e2e8f0;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 1rem;
        }

        @media (max-width: 768px) {
          .detail-group {
            grid-template-columns: 1fr;
            gap: 0.5rem;
          }
        }
        `
      }} />
    </div>
  );
}
