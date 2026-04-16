'use client';
import { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter, useSearchParams } from 'next/navigation';
import { ordersAPI, carsAPI } from '../../lib/api';
import { clearCart } from '../../store/slices/cartSlice';
import Spinner from '../../components/Spinner';
import toast from 'react-hot-toast';

function formatPrice(price) {
  const n = parseFloat(price);
  if (n >= 10000000) return `PKR ${(n / 1000000).toFixed(2)}M`;
  if (n >= 100000) return `PKR ${(n / 100000).toFixed(1)}L`;
  return `PKR ${n.toLocaleString()}`;
}

export default function CheckoutPage() {
  const { user, isAuthenticated } = useSelector(s => s.auth);
  const { items } = useSelector(s => s.cart);
  const dispatch = useDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const carId = searchParams.get('car');

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [paymentType, setPaymentType] = useState('full');
  const [emiResult, setEmiResult] = useState(null);
  const [form, setForm] = useState({
    buyer_name: '', buyer_email: '', buyer_phone: '',
    buyer_address: '', notes: '',
    down_payment: '', interest_rate: 12, duration_months: 24,
  });

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    if (user) {
      setForm(f => ({
        ...f,
        buyer_name: `${user.first_name} ${user.last_name}`.trim(),
        buyer_email: user.email,
        buyer_phone: user.phone || '',
        buyer_address: user.city || '',
      }));
    }
    if (carId) {
      setFetching(true);
      carsAPI.getById(carId).then(r => { setCar(r.data); setFetching(false); }).catch(() => setFetching(false));
    } else if (items.length > 0) {
      setCar(items[0].car);
      setFetching(false);
    } else {
      setFetching(false);
    }
  }, [user, carId, isAuthenticated, items]);

  const calcEMI = async () => {
    if (!selectedCar) return;
    try {
      const res = await ordersAPI.calculateEMI({
        principal: parseFloat(selectedCar.price),
        down_payment: form.down_payment || parseFloat(selectedCar.price) * 0.2,
        interest_rate: parseFloat(form.interest_rate),
        months: parseInt(form.duration_months),
      });
      setEmiResult(res.data);
    } catch {}
  };

  const set = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedCar) { toast.error('No car selected'); return; }
    setLoading(true);
    try {
      const orderData = {
        car: selectedCar.id,
        payment_type: paymentType,
        total_amount: selectedCar.price,
        booking_amount: paymentType === 'booking' ? parseFloat(selectedCar.price) * 0.1 : 0,
        buyer_name: form.buyer_name,
        buyer_email: form.buyer_email,
        buyer_phone: form.buyer_phone,
        buyer_address: form.buyer_address,
        notes: form.notes,
        ...(paymentType === 'installment' ? {
          down_payment: form.down_payment || parseFloat(selectedCar.price) * 0.2,
          interest_rate: form.interest_rate,
          duration_months: form.duration_months,
          monthly_installment: emiResult?.monthly_installment || 0,
        } : {}),
      };
      const res = await ordersAPI.createOrder(orderData);
      dispatch(clearCart());
      toast.success('🎉 Order placed successfully!');
      router.push(`/dashboard/orders/${res.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to place order. Please try again.');
    }
    setLoading(false);
  };

  const selectedCar = car;

  if (fetching) return <Spinner center size="lg" />;

  if (!selectedCar) return (
    <div className="max-w-md mx-auto px-4 py-20 text-center">
      <p className="text-5xl mb-4">🚗</p>
      <h2 className="text-xl font-bold text-gray-800 mb-2">No car selected</h2>
      <p className="text-gray-500 mb-6">Please select a car to checkout</p>
      <button onClick={() => router.push('/cars')} className="btn-primary">Browse Cars</button>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Checkout</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-5">
          {/* Payment Type */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 mb-4 text-lg">Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                ['full', '💵 Full Payment', 'Pay the complete amount upfront'],
                ['installment', '📅 Installment Plan', 'Spread payments over time'],
                ['booking', '📋 Book & Reserve', 'Pay 10% to reserve the car'],
              ].map(([val, label, desc]) => (
                <label key={val} className={`cursor-pointer border-2 rounded-xl p-3 transition-all ${paymentType === val ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-blue-200'}`}>
                  <input type="radio" name="payment" value={val} checked={paymentType === val}
                    onChange={() => { setPaymentType(val); setEmiResult(null); }} className="hidden" />
                  <p className="font-semibold text-sm text-gray-800">{label}</p>
                  <p className="text-xs text-gray-500 mt-1">{desc}</p>
                  {val === 'full' && <p className="text-xs text-green-600 font-medium mt-1">{formatPrice(selectedCar.price)}</p>}
                  {val === 'booking' && <p className="text-xs text-orange-600 font-medium mt-1">Pay {formatPrice(parseFloat(selectedCar.price) * 0.1)}</p>}
                </label>
              ))}
            </div>
          </div>

          {/* Installment Options */}
          {paymentType === 'installment' && (
            <div className="card p-5">
              <h2 className="font-bold text-gray-800 mb-4 text-lg">📅 Installment Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Down Payment (PKR)</label>
                  <input type="number" className="input-field" value={form.down_payment}
                    onChange={e => { set('down_payment', e.target.value); setEmiResult(null); }}
                    placeholder={`Minimum: ${formatPrice(parseFloat(selectedCar.price) * 0.2)}`} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">
                    Annual Interest Rate: <span className="text-blue-600 font-bold">{form.interest_rate}%</span>
                  </label>
                  <input type="range" min="5" max="30" step="0.5" className="w-full accent-blue-600"
                    value={form.interest_rate} onChange={e => { set('interest_rate', e.target.value); setEmiResult(null); }} />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 block mb-1">Loan Duration</label>
                  <div className="grid grid-cols-5 gap-2">
                    {[12, 24, 36, 48, 60].map(m => (
                      <button key={m} type="button" onClick={() => { set('duration_months', m); setEmiResult(null); }}
                        className={`py-2 text-sm rounded-xl border font-medium transition-colors ${parseInt(form.duration_months) === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
                        {m}mo
                      </button>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={calcEMI} className="btn-secondary w-full py-2.5 text-sm">
                  Calculate Monthly Payment
                </button>
                {emiResult && (
                  <div className="bg-blue-50 rounded-xl p-4 grid grid-cols-2 gap-3">
                    <div className="col-span-2 text-center pb-3 border-b border-blue-200">
                      <p className="text-xs text-blue-500 mb-0.5">Monthly Installment</p>
                      <p className="text-2xl font-bold text-blue-700">{formatPrice(emiResult.monthly_installment)}</p>
                    </div>
                    {[['Total Payable', formatPrice(emiResult.total_payable)],
                      ['Total Interest', formatPrice(emiResult.total_interest)]].map(([l, v]) => (
                      <div key={l} className="text-center">
                        <p className="text-xs text-gray-500">{l}</p>
                        <p className="font-semibold text-sm text-gray-800">{v}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Contact Details */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 mb-4 text-lg">Contact Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                ['Full Name *', 'buyer_name', 'text', 'Ali Hassan'],
                ['Email *', 'buyer_email', 'email', 'ali@example.com'],
                ['Phone *', 'buyer_phone', 'tel', '03XX-XXXXXXX'],
                ['City / Address', 'buyer_address', 'text', 'Karachi, DHA Phase 5'],
              ].map(([label, key, type, placeholder]) => (
                <div key={key}>
                  <label className="text-sm font-medium text-gray-700 block mb-1">{label}</label>
                  <input type={type} className="input-field" value={form[key]} required={label.includes('*')}
                    onChange={e => set(key, e.target.value)} placeholder={placeholder} />
                </div>
              ))}
              <div className="col-span-2">
                <label className="text-sm font-medium text-gray-700 block mb-1">Message / Notes (optional)</label>
                <textarea className="input-field" rows="2" value={form.notes}
                  onChange={e => set('notes', e.target.value)}
                  placeholder="Any special requirements or questions for the seller..." />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full btn-primary py-4 text-base">
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <span className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full" />
                Placing Order...
              </span>
            ) : '✅ Confirm Order'}
          </button>
        </form>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-1">
          <div className="card p-5 sticky top-20">
            <h2 className="font-bold text-gray-800 text-lg mb-4">Order Summary</h2>
            <img
              src={selectedCar.primary_image || 'https://placehold.co/400x250/e2e8f0/94a3b8?text=No+Image'}
              alt={selectedCar.title}
              className="w-full h-36 object-cover rounded-xl mb-4"
              onError={e => { e.target.src = 'https://placehold.co/400x250/e2e8f0/94a3b8?text=No+Image'; }}
            />
            <h3 className="font-semibold text-gray-800 text-sm leading-tight mb-3">{selectedCar.title}</h3>
            <div className="space-y-2 text-sm text-gray-600 border-t pt-3">
              <div className="flex justify-between"><span>Car Price</span><span className="font-semibold">{formatPrice(selectedCar.price)}</span></div>
              {paymentType === 'booking' && (
                <div className="flex justify-between text-orange-600">
                  <span>Booking Amount (10%)</span>
                  <span className="font-semibold">{formatPrice(parseFloat(selectedCar.price) * 0.1)}</span>
                </div>
              )}
              {paymentType === 'installment' && emiResult && (
                <div className="flex justify-between text-blue-600">
                  <span>Monthly EMI</span>
                  <span className="font-semibold">{formatPrice(emiResult.monthly_installment)}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between font-bold">
                <span>
                  {paymentType === 'booking' ? 'To Pay Now' : paymentType === 'installment' ? 'Total Amount' : 'Total'}
                </span>
                <span className="text-blue-600">
                  {paymentType === 'booking' ? formatPrice(parseFloat(selectedCar.price) * 0.1) : formatPrice(selectedCar.price)}
                </span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-green-50 rounded-lg">
              <p className="text-xs text-green-700 font-medium">🔒 Secure Transaction</p>
              <p className="text-xs text-green-600 mt-0.5">Your information is protected</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
