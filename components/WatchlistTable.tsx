'use client';

import { Star } from 'lucide-react';
import WatchlistButton from './WatchlistButton';

const WatchlistTable = ({ watchlist }: WatchlistTableProps) => {
  if (watchlist.length === 0) {
    return (
      <div className="bg-gray-900 rounded-lg p-8 text-center">
        <p className="text-gray-400 text-lg">Your watchlist is empty</p>
        <p className="text-sm text-gray-500 mt-2">Add stocks to track them here</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px]">
        {/* Table Header */}
        <thead>
          <tr className="bg-gray-800 text-gray-300 text-sm font-medium">
            <th className="text-left p-4">Company</th>
            <th className="text-left p-4">Symbol</th>
            <th className="text-left p-4">Price</th>
            <th className="text-left p-4">Change</th>
            <th className="text-left p-4">Market Cap</th>
            <th className="text-left p-4">P/E Ratio</th>
            <th className="text-left p-4">Alert</th>
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-gray-800">
          {watchlist.map((stock) => (
            <tr key={stock.symbol} className="hover:bg-gray-800/50 transition-colors">
              {/* Company */}
              <td className="p-4">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  <span className="text-gray-100 font-medium">{stock.company}</span>
                </div>
              </td>

              {/* Symbol */}
              <td className="p-4 text-gray-300 font-mono">{stock.symbol}</td>

              {/* Price */}
              <td className="p-4 text-gray-100 font-medium">{stock.priceFormatted}</td>

              {/* Change */}
              <td className={`p-4 font-medium ${
                stock.changePercent && stock.changePercent > 0 
                  ? 'text-green-500' 
                  : stock.changePercent && stock.changePercent < 0 
                  ? 'text-red-500' 
                  : 'text-gray-400'
              }`}>
                {stock.changeFormatted}
              </td>

              {/* Market Cap */}
              <td className="p-4 text-gray-300">{stock.marketCap}</td>

              {/* P/E Ratio */}
              <td className="p-4 text-gray-300">{stock.peRatio}</td>

              {/* Alert Button */}
              <td className="p-4">
                <button className="bg-yellow-600 hover:bg-yellow-700 text-black px-3 py-1 rounded text-sm font-medium transition-colors">
                  Add Alert
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      </div>
    </div>
  );
};

export default WatchlistTable;