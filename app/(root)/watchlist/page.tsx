import React from 'react';
import { getUserWatchlistWithData } from '@/lib/actions/watchlist.actions';
import { searchStocks } from '@/lib/actions/finnhub.actions';
import WatchlistTable from '@/components/WatchlistTable';
import SearchCommand from '@/components/SearchCommand';

const WatchlistPage = async () => {
  const watchlistData = await getUserWatchlistWithData();
  const initialStocks = await searchStocks();
  
  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-semibold text-2xl text-gray-100">Watchlist</h1>
        <SearchCommand 
          renderAs="button" 
          label="Add Stock"
          initialStocks={initialStocks}
        />
      </div>
      
      {/* Watchlist Table */}
      <WatchlistTable watchlist={watchlistData} />
    </div>
  );
};

export default WatchlistPage;
