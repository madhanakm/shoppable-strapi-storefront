import React, { useState } from 'react';
import { X, GitCompare, ShoppingCart, Star } from 'lucide-react';
import { useCompare } from '@/contexts/CompareContext';
import { useCart } from '@/contexts/CartContext';
import { formatPrice } from '@/lib/utils';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CompareModal = ({ onClose }: { onClose: () => void }) => {
  const { compareList, removeFromCompare } = useCompare();
  const { addToCart } = useCart();

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full sm:max-w-5xl max-h-[92vh] sm:max-h-[90vh] overflow-auto z-10">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-gray-800">Product Comparison</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Table */}
        <div className="p-3 md:p-4 overflow-x-auto">
          <table className="w-full text-xs md:text-sm">
            <thead>
              <tr>
                <td className="w-20 md:w-32 font-semibold text-gray-500 text-xs py-2 pr-2 md:pr-4">Product</td>
                {compareList.map(p => (
                  <td key={p.id} className="text-center px-2 md:px-3 py-2 min-w-[130px] md:min-w-[180px]">
                    <div className="relative">
                      <button
                        onClick={() => removeFromCompare(p.id)}
                        className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                      <Link to={`/product/${p.id}`} onClick={onClose}>
                        <img
                          src={p.image || 'https://via.placeholder.com/150'}
                          alt={p.name}
                          className="w-20 h-20 md:w-28 md:h-28 object-contain mx-auto rounded-xl border border-gray-100 p-2 hover:border-primary transition-colors"
                          onError={(e: any) => { e.target.src = 'https://via.placeholder.com/150'; }}
                        />
                      </Link>
                    </div>
                  </td>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Name */}
              <tr className="hover:bg-gray-50">
                <td className="font-semibold text-gray-500 text-xs md:text-sm py-2 md:py-3 pr-2 md:pr-4 whitespace-nowrap">Name</td>
                {compareList.map(p => (
                  <td key={p.id} className="text-center px-3 py-3">
                    <Link to={`/product/${p.id}`} onClick={onClose} className="font-semibold text-sm text-gray-800 hover:text-primary line-clamp-2 uppercase">
                      {p.name}
                    </Link>
                  </td>
                ))}
              </tr>

              {/* Price */}
              <tr className="hover:bg-gray-50">
                <td className="font-semibold text-gray-500 text-xs md:text-sm py-2 md:py-3 pr-2 md:pr-4 whitespace-nowrap">Price</td>
                {compareList.map(p => (
                  <td key={p.id} className="text-center px-3 py-3">
                    <span className="text-lg font-bold text-primary">
                      {p.priceRange || formatPrice(p.price)}
                    </span>
                  </td>
                ))}
              </tr>

              {/* Category */}
              <tr className="hover:bg-gray-50">
                <td className="font-semibold text-gray-500 text-xs md:text-sm py-2 md:py-3 pr-2 md:pr-4 whitespace-nowrap">Category</td>
                {compareList.map(p => (
                  <td key={p.id} className="text-center px-3 py-3">
                    <span className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-full">{p.category || '—'}</span>
                  </td>
                ))}
              </tr>

              {/* Rating */}
              <tr className="hover:bg-gray-50">
                <td className="font-semibold text-gray-500 text-xs md:text-sm py-2 md:py-3 pr-2 md:pr-4 whitespace-nowrap">Rating</td>
                {compareList.map(p => (
                  <td key={p.id} className="text-center px-3 py-3">
                    {p.rating && p.rating > 0 ? (
                      <div className="flex items-center justify-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="font-semibold text-sm">{p.rating.toFixed(1)}</span>
                        {p.reviewCount ? <span className="text-xs text-gray-400">({p.reviewCount})</span> : null}
                      </div>
                    ) : (
                      <span className="text-sm text-gray-400">No reviews</span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Brand */}
              <tr className="hover:bg-gray-50">
                <td className="font-semibold text-gray-500 text-xs md:text-sm py-2 md:py-3 pr-2 md:pr-4 whitespace-nowrap">Brand</td>
                {compareList.map(p => (
                  <td key={p.id} className="text-center px-3 py-3">
                    <span className="text-sm text-gray-600">{p.brand || '—'}</span>
                  </td>
                ))}
              </tr>

              {/* Description */}
              {compareList.some(p => p.description) && (
                <tr className="hover:bg-gray-50">
                  <td className="font-semibold text-gray-500 text-xs md:text-sm py-2 md:py-3 pr-2 md:pr-4 whitespace-nowrap">Description</td>
                  {compareList.map(p => (
                    <td key={p.id} className="text-center px-3 py-3">
                      <p className="text-xs text-gray-600 line-clamp-3 text-left">{p.description || '—'}</p>
                    </td>
                  ))}
                </tr>
              )}

              {/* Add to Cart */}
              <tr>
                <td className="py-4 pr-4"></td>
                {compareList.map(p => (
                  <td key={p.id} className="text-center px-3 py-4">
                    <Button
                      size="sm"
                      className="w-full bg-primary hover:bg-primary/90 text-white text-xs"
                      onClick={() => addToCart(p.skuid || p.id.toString(), p.id.toString(), 1, p.name, p.price)}
                    >
                      <ShoppingCart className="w-3 h-3 mr-1" />
                      Add to Cart
                    </Button>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const CompareBar = () => {
  const { compareList, removeFromCompare, clearCompare } = useCompare();
  const [showModal, setShowModal] = useState(false);

  if (compareList.length === 0) return null;

  return (
    <>
      {/* Floating Bar */}
      <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 bg-white border border-gray-200 rounded-2xl shadow-2xl px-4 py-3 flex items-center gap-3 max-w-[95vw]">
        <div className="flex items-center gap-2">
          <GitCompare className="w-4 h-4 text-primary flex-shrink-0" />
          <span className="text-sm font-semibold text-gray-700 hidden sm:block">Compare</span>
        </div>

        <div className="flex items-center gap-2">
          {compareList.map(p => (
            <div key={p.id} className="relative">
              <img
                src={p.image || 'https://via.placeholder.com/40'}
                alt={p.name}
                className="w-10 h-10 object-contain rounded-lg border border-gray-200 bg-gray-50"
                onError={(e: any) => { e.target.src = 'https://via.placeholder.com/40'; }}
              />
              <button
                onClick={() => removeFromCompare(p.id)}
                className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </div>
          ))}
          {/* Empty slots */}
          {Array.from({ length: 3 - compareList.length }).map((_, i) => (
            <div key={i} className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
              <span className="text-gray-300 text-lg">+</span>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-1">
          <Button
            size="sm"
            onClick={() => setShowModal(true)}
            disabled={compareList.length < 2}
            className="bg-primary hover:bg-primary/90 text-white text-xs px-3 h-8"
          >
            Compare {compareList.length > 0 ? `(${compareList.length})` : ''}
          </Button>
          <button onClick={clearCompare} className="text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {showModal && <CompareModal onClose={() => setShowModal(false)} />}
    </>
  );
};

export default CompareBar;
