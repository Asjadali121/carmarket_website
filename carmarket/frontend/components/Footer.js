import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">🚗</span>
            <span className="text-white text-xl font-bold">CarMarket</span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">
            Pakistan's premier car marketplace. Buy, sell, and finance your dream car with ease.
          </p>
          <div className="flex gap-3 mt-4">
            <span className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-xs cursor-pointer hover:bg-blue-500">f</span>
            <span className="w-8 h-8 bg-sky-500 rounded-full flex items-center justify-center text-xs cursor-pointer hover:bg-sky-400">t</span>
            <span className="w-8 h-8 bg-pink-600 rounded-full flex items-center justify-center text-xs cursor-pointer hover:bg-pink-500">ig</span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Browse Cars</h4>
          <ul className="space-y-2 text-sm">
            {[['All Cars','/cars'],['Economy Cars','/cars?category=1'],['Luxury Cars','/cars?category=2'],['SUVs','/cars?car_type=2'],['Electric Cars','/cars?fuel_type=electric'],['Hybrids','/cars?fuel_type=hybrid']].map(([l,h]) => (
              <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Sell Your Car</h4>
          <ul className="space-y-2 text-sm">
            {[['Post Free Ad','/auth/register'],['Seller Dashboard','/dashboard/seller'],['Login','/auth/login'],['Register','/auth/register']].map(([l,h]) => (
              <li key={h}><Link href={h} className="hover:text-white transition-colors">{l}</Link></li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-white font-semibold mb-4">Contact Us</h4>
          <ul className="space-y-2 text-sm text-gray-400">
            <li className="flex items-center gap-2">📞 <span>0300-1234567</span></li>
            <li className="flex items-center gap-2">✉️ <span>support@carmarket.pk</span></li>
            <li className="flex items-center gap-2">📍 <span>Karachi, Pakistan</span></li>
            <li className="flex items-center gap-2">🕐 <span>Mon–Sat 9am–6pm</span></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-gray-700 py-4 text-center text-xs text-gray-500">
        © {new Date().getFullYear()} CarMarket Pakistan. All rights reserved. |
        <Link href="/cars" className="hover:text-gray-300 ml-1">Browse Cars</Link>
      </div>
    </footer>
  );
}
