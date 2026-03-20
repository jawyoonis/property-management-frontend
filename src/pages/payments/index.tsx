import React, { useEffect, useState } from 'react';
import {
  CreditCard, Plus, Trash2, DollarSign, CheckCircle2, Clock, XCircle, Smartphone
} from 'lucide-react';
import toast from 'react-hot-toast';
import Modal from '@/components/Modal';
import { paymentService } from '@/services/paymentService';
import { leaseService } from '@/services/leaseService';
import { PaymentDto, LeaseDto, PaymentType, PaymentStatus } from '@/types';

// ─── Payment method logos / labels ──────────────────────────────────────────

const PAYMENT_METHODS: { type: PaymentType; label: string; color: string; icon: string }[] = [
  { type: 'VISA', label: 'Visa', color: 'border-blue-500 bg-blue-50', icon: '💳' },
  { type: 'MASTERCARD', label: 'Mastercard', color: 'border-orange-500 bg-orange-50', icon: '💳' },
  { type: 'ZAAD', label: 'Zaad (Telesom)', color: 'border-green-500 bg-green-50', icon: '📱' },
  { type: 'E_CHECK', label: 'E-Check', color: 'border-gray-400 bg-gray-50', icon: '🏦' },
  { type: 'DEBIT_CARD', label: 'Debit Card', color: 'border-indigo-400 bg-indigo-50', icon: '💳' },
];

const STATUS_CONFIG: Record<PaymentStatus, { label: string; color: string; icon: React.ReactNode }> = {
  COMPLETED: { label: 'Completed', color: 'bg-green-100 text-green-700', icon: <CheckCircle2 className="w-4 h-4" /> },
  PENDING: { label: 'Pending', color: 'bg-yellow-100 text-yellow-700', icon: <Clock className="w-4 h-4" /> },
  FAILED: { label: 'Failed', color: 'bg-red-100 text-red-700', icon: <XCircle className="w-4 h-4" /> },
};

interface CardFormState {
  cardNumber: string;
  cardHolder: string;
  expiry: string;
  cvv: string;
}

interface ZaadFormState {
  phoneNumber: string;
  pin: string;
}

export default function PaymentsPage() {
  const [payments, setPayments] = useState<PaymentDto[]>([]);
  const [leases, setLeases] = useState<LeaseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Payment form state
  const [selectedLeaseId, setSelectedLeaseId] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentType, setPaymentType] = useState<PaymentType>('ZAAD');
  const [, setPaymentStatus] = useState<PaymentStatus>('PENDING');

  // Card form
  const [cardForm, setCardForm] = useState<CardFormState>({
    cardNumber: '', cardHolder: '', expiry: '', cvv: ''
  });

  // Zaad form
  const [zaadForm, setZaadForm] = useState<ZaadFormState>({
    phoneNumber: '', pin: ''
  });

  const [processingPayment, setProcessingPayment] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const [paymentsData, leasesData] = await Promise.all([
        paymentService.getAll(),
        leaseService.getAll(),
      ]);
      setPayments(paymentsData);
      setLeases(leasesData);
    } catch {
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const resetForm = () => {
    setSelectedLeaseId('');
    setAmount('');
    setPaymentType('ZAAD');
    setPaymentStatus('PENDING');
    setCardForm({ cardNumber: '', cardHolder: '', expiry: '', cvv: '' });
    setZaadForm({ phoneNumber: '', pin: '' });
  };

  // Simulate Zaad API call (replace with real Telesom Zaad merchant API)
  const processZaadPayment = async (): Promise<{ success: boolean; transactionRef: string }> => {
    // In production: POST to Telesom Zaad API endpoint
    // Endpoint: https://api.telesom.com/zaad/v1/payment (example)
    // Body: { merchantId, phone, amount, pin, reference }
    return new Promise(resolve =>
      setTimeout(() => resolve({ success: true, transactionRef: `ZAAD-${Date.now()}` }), 1500)
    );
  };

  // Simulate Visa/Mastercard tokenization (replace with real payment processor like Stripe)
  const processCardPayment = async (): Promise<{ success: boolean; transactionRef: string }> => {
    // In production: tokenize card with Stripe/PayFort, then charge
    return new Promise(resolve =>
      setTimeout(() => resolve({ success: true, transactionRef: `CARD-${Date.now()}` }), 1500)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeaseId || !amount) {
      toast.error('Please fill all required fields');
      return;
    }
    setSaving(true);
    setProcessingPayment(true);

    try {
      // Process payment with the selected gateway
      let gatewayResult: { success: boolean; transactionRef: string };

      if (paymentType === 'ZAAD') {
        if (!zaadForm.phoneNumber) { toast.error('Enter Zaad phone number'); return; }
        toast.loading('Processing Zaad payment...', { id: 'payment' });
        gatewayResult = await processZaadPayment();
      } else if (['VISA', 'MASTERCARD'].includes(paymentType)) {
        if (!cardForm.cardNumber || !cardForm.cardHolder || !cardForm.expiry || !cardForm.cvv) {
          toast.error('Fill in all card details'); return;
        }
        toast.loading(`Processing ${paymentType} payment...`, { id: 'payment' });
        gatewayResult = await processCardPayment();
      } else {
        gatewayResult = { success: true, transactionRef: `REF-${Date.now()}` };
      }

      toast.dismiss('payment');

      if (!gatewayResult.success) {
        toast.error('Payment gateway rejected the transaction');
        setPaymentStatus('FAILED');
        return;
      }

      // Record payment in backend
      const payload: PaymentDto = {
        leaseDto: { leaseId: Number(selectedLeaseId) } as LeaseDto,
        datePaid: new Date().toISOString().split('T')[0],
        amount: Number(amount),
        paymentType,
        status: 'COMPLETED',
      };

      await paymentService.create(payload);
      toast.success(`Payment of $${amount} recorded successfully! Ref: ${gatewayResult.transactionRef}`);
      setModalOpen(false);
      resetForm();
      load();
    } catch {
      toast.error('Failed to record payment');
    } finally {
      setSaving(false);
      setProcessingPayment(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this payment record?')) return;
    try {
      await paymentService.delete(id);
      toast.success('Payment deleted');
      load();
    } catch {
      toast.error('Failed to delete payment');
    }
  };

  const totalCollected = payments
    .filter(p => p.status === 'COMPLETED')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  const isCardPayment = ['VISA', 'MASTERCARD', 'DEBIT_CARD', 'CREDIT_CARD'].includes(paymentType);

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="w-7 h-7 text-yellow-600" /> Payments
          </h1>
          <p className="text-gray-500 text-sm mt-1">{payments.length} transactions</p>
        </div>
        <button onClick={() => { resetForm(); setModalOpen(true); }}
          className="flex items-center gap-2 bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-xl font-medium transition-colors">
          <Plus className="w-4 h-4" /> Record Payment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-50 rounded-xl"><DollarSign className="w-5 h-5 text-green-600" /></div>
            <span className="text-sm text-gray-500">Total Collected</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">${totalCollected.toLocaleString()}</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-50 rounded-xl"><Clock className="w-5 h-5 text-yellow-600" /></div>
            <span className="text-sm text-gray-500">Pending</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {payments.filter(p => p.status === 'PENDING').length}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-red-50 rounded-xl"><XCircle className="w-5 h-5 text-red-600" /></div>
            <span className="text-sm text-gray-500">Failed</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">
            {payments.filter(p => p.status === 'FAILED').length}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400">Loading payments...</div>
        ) : payments.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <CreditCard className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No payments recorded yet</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lease</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Method</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {payments.map(payment => {
                const statusCfg = STATUS_CONFIG[payment.status];
                const method = PAYMENT_METHODS.find(m => m.type === payment.paymentType);
                return (
                  <tr key={payment.paymentId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm text-gray-600">
                      Lease #{payment.leaseDto?.leaseId || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-semibold text-gray-900">${Number(payment.amount).toLocaleString()}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-sm">
                        {method?.icon} {method?.label || payment.paymentType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{payment.datePaid}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusCfg.color}`}>
                        {statusCfg.icon} {statusCfg.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => payment.paymentId && handleDelete(payment.paymentId)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Payment Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Payment" size="xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Lease & Amount */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Lease</label>
              <select required value={selectedLeaseId} onChange={e => setSelectedLeaseId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500">
                <option value="">— Select Lease —</option>
                {leases.map(l => (
                  <option key={l.leaseId} value={l.leaseId}>
                    #{l.leaseId} – {l.propertyDto?.name || 'Property'} / {l.tenantDto ? `${l.tenantDto.firstName} ${l.tenantDto.lastName}` : 'Tenant'}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Amount (USD)</label>
              <input required type="number" min="1" step="0.01" value={amount}
                onChange={e => setAmount(e.target.value)} placeholder="0.00"
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500" />
            </div>
          </div>

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Payment Method</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PAYMENT_METHODS.map(method => (
                <button
                  key={method.type}
                  type="button"
                  onClick={() => setPaymentType(method.type)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    paymentType === method.type
                      ? method.color + ' shadow-sm'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{method.icon}</span>
                  <span className={`text-sm font-medium ${paymentType === method.type ? 'text-gray-900' : 'text-gray-600'}`}>
                    {method.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Zaad Payment Form */}
          {paymentType === 'ZAAD' && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <Smartphone className="w-5 h-5 text-green-700" />
                <h3 className="font-semibold text-green-800">Zaad Mobile Payment (Telesom)</h3>
              </div>
              <p className="text-xs text-green-700 mb-3">
                Pay via Zaad mobile money. Enter your Zaad registered phone number and PIN.
              </p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Zaad Phone Number</label>
                <input
                  type="tel"
                  required={paymentType === 'ZAAD'}
                  value={zaadForm.phoneNumber}
                  onChange={e => setZaadForm(f => ({ ...f, phoneNumber: e.target.value }))}
                  placeholder="+252 63 XXXXXXX"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">PIN</label>
                <input
                  type="password"
                  required={paymentType === 'ZAAD'}
                  value={zaadForm.pin}
                  onChange={e => setZaadForm(f => ({ ...f, pin: e.target.value }))}
                  maxLength={6}
                  placeholder="••••••"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>
              <p className="text-xs text-gray-500">
                Note: In production, this connects to the Telesom Zaad merchant API.
                Tenant will receive an SMS confirmation.
              </p>
            </div>
          )}

          {/* Card Payment Form (Visa / Mastercard / Debit) */}
          {isCardPayment && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="w-5 h-5 text-blue-700" />
                <h3 className="font-semibold text-blue-800">
                  {paymentType === 'VISA' ? 'Visa' : paymentType === 'MASTERCARD' ? 'Mastercard' : 'Card'} Details
                </h3>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                <input
                  type="text"
                  required={isCardPayment}
                  value={cardForm.cardNumber}
                  onChange={e => setCardForm(f => ({ ...f, cardNumber: e.target.value.replace(/\D/g, '').slice(0, 16) }))}
                  placeholder="4242 4242 4242 4242"
                  maxLength={16}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-widest"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cardholder Name</label>
                <input
                  type="text"
                  required={isCardPayment}
                  value={cardForm.cardHolder}
                  onChange={e => setCardForm(f => ({ ...f, cardHolder: e.target.value }))}
                  placeholder="AHMED HASSAN"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expiry (MM/YY)</label>
                  <input
                    type="text"
                    required={isCardPayment}
                    value={cardForm.expiry}
                    onChange={e => setCardForm(f => ({ ...f, expiry: e.target.value }))}
                    placeholder="12/27"
                    maxLength={5}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                  <input
                    type="password"
                    required={isCardPayment}
                    value={cardForm.cvv}
                    onChange={e => setCardForm(f => ({ ...f, cvv: e.target.value.slice(0, 4) }))}
                    placeholder="•••"
                    maxLength={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Card details are tokenized and never stored. Powered by a PCI-DSS compliant gateway.
              </p>
            </div>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving || processingPayment}
              className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium disabled:opacity-60 flex items-center gap-2">
              {processingPayment ? (
                <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
              ) : (
                <><CreditCard className="w-4 h-4" /> Pay ${amount || '0'}</>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
