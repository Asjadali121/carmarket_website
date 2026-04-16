'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ordersAPI } from '../../../../lib/api';
import { useSelector } from 'react-redux';
import Spinner from '../../../../components/Spinner';

function formatPrice(p) {
  const n = parseFloat(p);
  if (n >= 10000000) return `PKR ${(n / 1000000).toFixed(2)}M`;
  if (n >= 100000) return `PKR ${(n / 100000).toFixed(1)}L`;
  return `PKR ${n.toLocaleString()}`;
}

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  confirmed: 'bg-blue-100 text-blue-700 border-blue-200',
  processing: 'bg-purple-100 text-purple-700 border-purple-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

export default function OrderDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAuthenticated } = useSelector(s => s.auth);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) { router.push('/auth/login'); return; }
    ordersAPI.getOrder(id)
      .then(r => { setOrder(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [id, isAuthenticated]);

  if (loading) return <Spinner center size="lg" />;
  if (!order) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">📦</p>
      <p className="text-gray-500">Order not found.</p>
      <Link href="/dashboard" className="btn-primary mt-4 inline-block">Back to Dashboard</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <Link href="/dashboard" className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-flex items-center gap-1">
            ← Back to Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">Order {order.order_number}</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Placed on {new Date(order.created_at).toLocaleDateString('en-PK', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <span className={`badge border text-sm px-3 py-1 ${statusColors[order.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </span>
      </div>

      {/* Invoice Card */}
      <div className="card overflow-hidden mb-6">
        {/* Invoice Header */}
        <div className="bg-blue-700 text-white p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-blue-200 text-xs uppercase tracking-widest mb-1">Invoice / Order Receipt</p>
              <p className="text-2xl font-bold">{order.order_number}</p>
            </div>
            <div className="text-right text-sm">
              <p className="text-blue-200">CarMarket Pakistan</p>
              <p className="text-blue-200">support@carmarket.pk</p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Car Details */}
          {order.car_details && (
            <div className="flex gap-4 p-4 bg-gray-50 rounded-xl">
              <img
                src={order.car_details.primary_image || 'https://placehold.co/120x80/e2e8f0/94a3b8?text=Car'}
                alt={order.car_details.title}
                className="w-28 h-20 object-cover rounded-lg flex-shrink-0"
                onError={e => { e.target.src = 'https://placehold.co/120x80/e2e8f0/94a3b8?text=Car'; }}
              />
              <div>
                <h3 className="font-bold text-gray-800">{order.car_details.title}</h3>
                <p className="text-sm text-gray-500 mt-0.5">{order.car_details.year} · {order.car_details.city}</p>
                <p className="text-blue-600 font-bold mt-1">{formatPrice(order.car_details.price)}</p>
              </div>
            </div>
          )}

          {/* Buyer & Payment Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Buyer Details</h3>
              <div className="space-y-2">
                {[
                  ['Name', order.buyer_name],
                  ['Email', order.buyer_email],
                  ['Phone', order.buyer_phone],
                  ['Address', order.buyer_address || 'N/A'],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-sm">
                    <span className="text-gray-400 w-16 flex-shrink-0">{k}</span>
                    <span className="font-medium text-gray-700">{v}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Payment Details</h3>
              <div className="space-y-2">
                {[
                  ['Method', order.payment_type?.replace('_', ' ')],
                  ['Status', order.status],
                  ['Date', new Date(order.created_at).toLocaleDateString()],
                ].map(([k, v]) => (
                  <div key={k} className="flex gap-2 text-sm">
                    <span className="text-gray-400 w-16 flex-shrink-0">{k}</span>
                    <span className="font-medium text-gray-700 capitalize">{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Installment Details */}
          {order.payment_type === 'installment' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-blue-800 mb-3">📅 Installment Plan</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                {[
                  ['Down Payment', formatPrice(order.down_payment)],
                  ['Monthly EMI', formatPrice(order.monthly_installment)],
                  ['Duration', `${order.duration_months} months`],
                  ['Interest Rate', `${order.interest_rate}%`],
                ].map(([k, v]) => (
                  <div key={k} className="text-center">
                    <p className="text-xs text-blue-500 mb-0.5">{k}</p>
                    <p className="font-bold text-blue-800">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking Details */}
          {order.payment_type === 'booking' && order.booking_amount && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
              <h3 className="text-sm font-bold text-orange-800 mb-2">📋 Booking Details</h3>
              <div className="flex justify-between text-sm">
                <span className="text-orange-600">Booking Amount Paid</span>
                <span className="font-bold text-orange-800">{formatPrice(order.booking_amount)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span className="text-orange-600">Remaining Balance</span>
                <span className="font-bold text-orange-800">{formatPrice(parseFloat(order.total_amount) - parseFloat(order.booking_amount))}</span>
              </div>
            </div>
          )}

          {/* Total */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-800">Total Amount</span>
              <span className="text-2xl font-bold text-blue-700">{formatPrice(order.total_amount)}</span>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs font-semibold text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Link href="/dashboard" className="btn-secondary flex-1 py-3 text-center">← Dashboard</Link>
        <Link href="/cars" className="btn-primary flex-1 py-3 text-center">Browse More Cars →</Link>
      </div>
    </div>
  );
}
