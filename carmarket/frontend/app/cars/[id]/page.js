'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { carsAPI, ordersAPI } from '../../../lib/api';
import { useDispatch, useSelector } from 'react-redux';
import { addToCart } from '../../../store/slices/cartSlice';
import { toggleWishlist } from '../../../store/slices/wishlistSlice';
import Spinner from '../../../components/Spinner';
import toast from 'react-hot-toast';

function formatPrice(price) {
  const n = parseFloat(price);
  if (n >= 10000000) return `PKR ${(n / 1000000).toFixed(2)}M`;
  if (n >= 100000) return `PKR ${(n / 100000).toFixed(1)}L`;
  return `PKR ${n.toLocaleString()}`;
}

export default function CarDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector(s => s.auth);
  const { items: wishlistItems } = useSelector(s => s.wishlist);
  const isWishlisted = wishlistItems.some(w => w.car?.id === parseInt(id));

  const [car, setCar] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [emi, setEmi] = useState({ down_payment: '', interest_rate: 12, months: 24 });
  const [emiResult, setEmiResult] = useState(null);
  const [emiLoading, setEmiLoading] = useState(false);
  const [relatedCars, setRelatedCars] = useState([]);

  useEffect(() => {
    setLoading(true);
    carsAPI.getById(id).then(r => {
      setCar(r.data);
      setLoading(false);
      // Fetch related cars
      if (r.data.brand) {
        carsAPI.getAll({ brand: r.data.brand, page_size: 4 }).then(rel => {
          const cars = (rel.data.results || rel.data).filter(c => c.id !== parseInt(id));
          setRelatedCars(cars.slice(0, 3));
        }).catch(() => {});
      }
    }).catch(() => setLoading(false));
  }, [id]);

  const calcEMI = async () => {
    if (!car) return;
    setEmiLoading(true);
    try {
      const res = await ordersAPI.calculateEMI({
        principal: parseFloat(car.price),
        down_payment: emi.down_payment || parseFloat(car.price) * 0.2,
        interest_rate: parseFloat(emi.interest_rate),
        months: parseInt(emi.months),
      });
      setEmiResult(res.data);
    } catch { toast.error('Calculation failed'); }
    setEmiLoading(false);
  };

  if (loading) return <Spinner center size="lg" />;
  if (!car) return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">🚗</p>
      <p className="text-gray-500 text-lg">Car not found.</p>
      <Link href="/cars" className="btn-primary mt-4">Browse Cars</Link>
    </div>
  );

  const images = car.images?.length > 0 ? car.images : [{ image: 'https://placehold.co/800x500/e2e8f0/94a3b8?text=No+Image', id: 0 }];

  const specs = [
    ['Year', car.year],
    ['Mileage', `${car.mileage?.toLocaleString()} km`],
    ['Fuel Type', car.fuel_type],
    ['Transmission', car.transmission?.toUpperCase()],
    ['Drive Type', car.drive_type?.toUpperCase()],
    ['Condition', car.condition],
    ['Engine', car.engine_capacity ? `${car.engine_capacity} cc` : 'N/A'],
    ['Color', car.color || 'N/A'],
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Link href="/" className="hover:text-blue-600">Home</Link>
        <span>›</span>
        <Link href="/cars" className="hover:text-blue-600">Cars</Link>
        <span>›</span>
        <span className="text-gray-800 font-medium truncate">{car.title}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left: Images */}
        <div className="lg:col-span-3">
          <div className="rounded-2xl overflow-hidden bg-gray-100 relative">
            <img
              src={images[activeImg]?.image}
              alt={car.title}
              className="w-full h-80 md:h-[420px] object-cover"
              onError={e => { e.target.src = 'https://placehold.co/800x500/e2e8f0/94a3b8?text=No+Image'; }}
            />
            {car.is_featured && (
              <span className="absolute top-4 left-4 badge bg-yellow-400 text-yellow-900 shadow">⭐ Featured</span>
            )}
            <span className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded-lg">
              {activeImg + 1} / {images.length}
            </span>
          </div>
          {images.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              {images.map((img, i) => (
                <img key={img.id} src={img.image} alt=""
                  onClick={() => setActiveImg(i)}
                  className={`h-16 w-24 object-cover rounded-xl cursor-pointer flex-shrink-0 border-2 transition-all ${activeImg === i ? 'border-blue-500 scale-105' : 'border-transparent hover:border-gray-300'}`}
                  onError={e => { e.target.src = 'https://placehold.co/100x70/e2e8f0/94a3b8?text=No+Image'; }}
                />
              ))}
            </div>
          )}

          {/* Specs Grid */}
          <div className="card p-5 mt-5">
            <h2 className="font-bold text-gray-800 text-lg mb-4">Specifications</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {specs.map(([key, val]) => (
                <div key={key} className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-xs text-gray-500 mb-1">{key}</p>
                  <p className="font-semibold text-gray-800 text-sm capitalize">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description */}
          <div className="card p-5 mt-5">
            <h2 className="font-bold text-gray-800 text-lg mb-3">Description</h2>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{car.description}</p>
          </div>

          {/* Seller Info */}
          <div className="card p-5 mt-5">
            <h2 className="font-bold text-gray-800 text-lg mb-3">Seller Information</h2>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-lg">
                {car.seller?.first_name?.[0]}{car.seller?.last_name?.[0]}
              </div>
              <div>
                <p className="font-semibold text-gray-800">{car.seller?.first_name} {car.seller?.last_name}</p>
                <p className="text-sm text-gray-500">{car.seller?.city || 'Pakistan'}</p>
                {car.seller?.phone && <p className="text-sm text-blue-600 font-medium">{car.seller.phone}</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Right: Price + Actions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-5">
            <h1 className="text-xl font-bold text-gray-900 leading-tight mb-2">{car.title}</h1>
            <p className="text-3xl font-bold text-blue-600 mb-3">{formatPrice(car.price)}</p>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {car.category && <span className="badge bg-blue-100 text-blue-800">{car.category.name}</span>}
              {car.car_type && <span className="badge bg-purple-100 text-purple-800">{car.car_type.name}</span>}
              {car.car_class && <span className="badge bg-gray-100 text-gray-700">{car.car_class.name}</span>}
              {car.tags?.map(t => <span key={t.id} className="badge bg-green-100 text-green-700">{t.name}</span>)}
            </div>

            {/* Quick info */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              {[
                ['📍', car.location || car.city],
                ['📅', car.year],
                ['⛽', car.fuel_type],
                ['⚙️', car.transmission],
              ].map(([icon, val]) => (
                <div key={icon} className="flex items-center gap-1.5 text-sm text-gray-600">
                  <span>{icon}</span>
                  <span className="capitalize">{val}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-gray-400 mb-4">👁 {car.views_count} views · Listed {new Date(car.created_at).toLocaleDateString()}</p>

            {/* Action buttons */}
            <div className="space-y-2">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    if (!isAuthenticated) { toast.error('Please login first'); return; }
                    dispatch(addToCart(car.id));
                    toast.success('Added to cart!');
                  }}
                  className="flex-1 btn-primary py-3"
                >
                  🛒 Add to Cart
                </button>
                <button
                  onClick={() => {
                    if (!isAuthenticated) { toast.error('Please login first'); return; }
                    dispatch(toggleWishlist(car.id));
                    toast.success(isWishlisted ? 'Removed from wishlist' : '❤️ Saved!');
                  }}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${isWishlisted ? 'border-red-300 bg-red-50 text-red-500' : 'border-gray-200 bg-white text-gray-400 hover:border-red-300 hover:text-red-400'}`}
                >
                  {isWishlisted ? '❤️' : '🤍'}
                </button>
              </div>
              <button
                onClick={() => router.push(`/checkout?car=${car.id}`)}
                className="w-full btn-success py-3 text-base"
              >
                ✅ Buy Now / Book
              </button>
            </div>

            {/* Car status */}
            {car.status === 'sold' && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-center">
                <p className="text-red-700 font-semibold text-sm">This car has been sold</p>
              </div>
            )}
          </div>

          {/* EMI Calculator */}
          <div className="card p-5">
            <h2 className="font-bold text-gray-800 text-lg mb-4 flex items-center gap-2">
              <span>💳</span> EMI Calculator
            </h2>
            <div className="space-y-3">
              <div className="bg-blue-50 p-3 rounded-lg flex justify-between">
                <span className="text-sm text-gray-600">Car Price</span>
                <span className="font-bold text-blue-700">{formatPrice(car.price)}</span>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Down Payment (PKR) — min 20%: {formatPrice(parseFloat(car.price) * 0.2)}
                </label>
                <input type="number" className="input-field text-sm"
                  placeholder={`e.g. ${Math.round(parseFloat(car.price) * 0.2)}`}
                  value={emi.down_payment}
                  onChange={e => setEmi(p => ({ ...p, down_payment: e.target.value }))} />
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">
                  Annual Interest Rate: <span className="text-blue-600 font-bold">{emi.interest_rate}%</span>
                </label>
                <input type="range" min="5" max="30" step="0.5" className="w-full accent-blue-600"
                  value={emi.interest_rate}
                  onChange={e => setEmi(p => ({ ...p, interest_rate: e.target.value }))} />
                <div className="flex justify-between text-xs text-gray-400 mt-0.5"><span>5%</span><span>30%</span></div>
              </div>

              <div>
                <label className="text-xs font-medium text-gray-600 block mb-1">Loan Duration</label>
                <div className="grid grid-cols-5 gap-1">
                  {[12, 24, 36, 48, 60].map(m => (
                    <button key={m} onClick={() => setEmi(p => ({ ...p, months: m }))}
                      className={`py-1.5 text-xs rounded-lg border transition-colors font-medium ${parseInt(emi.months) === m ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400'}`}>
                      {m}mo
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={calcEMI} disabled={emiLoading} className="w-full btn-primary py-2.5">
                {emiLoading ? 'Calculating...' : 'Calculate EMI'}
              </button>

              {emiResult && (
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 space-y-2.5">
                  <div className="text-center pb-2 border-b border-blue-200">
                    <p className="text-xs text-blue-600 mb-0.5">Monthly Installment</p>
                    <p className="text-2xl font-bold text-blue-700">{formatPrice(emiResult.monthly_installment)}</p>
                  </div>
                  {[
                    ['Down Payment', formatPrice(emiResult.down_payment), 'text-gray-700'],
                    ['Loan Amount', formatPrice(emiResult.loan_amount), 'text-gray-700'],
                    ['Total Interest', formatPrice(emiResult.total_interest), 'text-orange-600'],
                    ['Total Payable', formatPrice(emiResult.total_payable), 'text-gray-900 font-bold'],
                  ].map(([label, val, cls]) => (
                    <div key={label} className="flex justify-between text-sm">
                      <span className="text-gray-500">{label}</span>
                      <span className={cls}>{val}</span>
                    </div>
                  ))}
                  <button onClick={() => router.push(`/checkout?car=${car.id}`)}
                    className="w-full btn-primary mt-2 text-sm py-2">
                    Proceed with Installment →
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Related Cars */}
      {relatedCars.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-800 mb-5">Similar {car.brand} Cars</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {relatedCars.map(rc => (
              <Link key={rc.id} href={`/cars/${rc.id}`} className="card hover:shadow-md transition-shadow overflow-hidden group">
                <img src={rc.primary_image || 'https://placehold.co/400x200/e2e8f0/94a3b8?text=No+Image'} alt=""
                  className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={e => { e.target.src = 'https://placehold.co/400x200/e2e8f0/94a3b8?text=No+Image'; }} />
                <div className="p-3">
                  <p className="font-medium text-sm text-gray-800 line-clamp-1">{rc.title}</p>
                  <p className="text-blue-600 font-bold text-sm mt-1">{formatPrice(rc.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
