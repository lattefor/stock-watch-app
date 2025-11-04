'use server';

import { connectToDatabase } from '@/database/mongoose';
import { Watchlist } from '@/database/models/watchlist.model';
import { auth } from '@/lib/better-auth/auth';
import { headers } from 'next/headers';

export async function getWatchlistSymbolsByEmail(email: string): Promise<string[]> {
  if (!email) return [];

  try {
    const mongoose = await connectToDatabase();
    const db = mongoose.connection.db;
    if (!db) throw new Error('MongoDB connection not found');

    // Better Auth stores users in the "user" collection
    const user = await db.collection('user').findOne<{ _id?: unknown; id?: string; email?: string }>({ email });

    if (!user) return [];

    const userId = (user.id as string) || String(user._id || '');
    if (!userId) return [];

    const items = await Watchlist.find({ userId }, { symbol: 1 }).lean();
    return items.map((i) => String(i.symbol));
  } catch (err) {
    console.error('getWatchlistSymbolsByEmail error:', err);
    return [];
  }
}

export async function addToWatchlist(symbol: string, company: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: 'User not authenticated' };
    }

    await connectToDatabase();
    
    const existingItem = await Watchlist.findOne({ 
      userId: session.user.id, 
      symbol: symbol.toUpperCase() 
    });
    
    if (existingItem) {
      return { success: false, message: 'Stock already in watchlist' };
    }

    await Watchlist.create({
      userId: session.user.id,
      symbol: symbol.toUpperCase(),
      company: company,
    });

    return { success: true, message: 'Added to watchlist' };
  } catch (err) {
    console.error('addToWatchlist error:', err);
    return { success: false, message: 'Failed to add to watchlist' };
  }
}

export async function removeFromWatchlist(symbol: string): Promise<{ success: boolean; message: string }> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, message: 'User not authenticated' };
    }

    await connectToDatabase();
    
    const result = await Watchlist.deleteOne({ 
      userId: session.user.id, 
      symbol: symbol.toUpperCase() 
    });
    
    if (result.deletedCount === 0) {
      return { success: false, message: 'Stock not found in watchlist' };
    }

    return { success: true, message: 'Removed from watchlist' };
  } catch (err) {
    console.error('removeFromWatchlist error:', err);
    return { success: false, message: 'Failed to remove from watchlist' };
  }
}

export async function getUserWatchlist(): Promise<{ symbol: string; company: string; addedAt: Date }[]> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return [];
    }

    await connectToDatabase();
    
    const items = await Watchlist.find({ userId: session.user.id })
      .select('symbol company addedAt')
      .sort({ addedAt: -1 })
      .lean();
    
    return items.map(item => ({
      symbol: String(item.symbol),
      company: String(item.company),
      addedAt: item.addedAt
    }));
  } catch (err) {
    console.error('getUserWatchlist error:', err);
    return [];
  }
}

export async function getUserWatchlistWithData(): Promise<StockWithData[]> {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return [];
    }

    await connectToDatabase();
    
    const items = await Watchlist.find({ userId: session.user.id })
      .select('symbol company addedAt')
      .sort({ addedAt: -1 })
      .lean();
    
    // Import here to avoid circular dependency
    const { getStockQuote, getStockProfile, getStockFinancials } = await import('@/lib/actions/finnhub.actions');
    
    const enrichedItems = await Promise.all(
      items.map(async (item) => {
        const symbol = String(item.symbol);
        const [quote, profile, financials] = await Promise.all([
          getStockQuote(symbol),
          getStockProfile(symbol),
          getStockFinancials(symbol)
        ]);
        
        const currentPrice = quote?.c;
        const changePercent = quote?.dp;
        const marketCap = profile?.marketCapitalization;
        const peRatio = financials?.metric?.peBasicExclExtraTTM;
        
        return {
          userId: session.user.id,
          symbol,
          company: String(item.company),
          addedAt: item.addedAt,
          currentPrice,
          changePercent,
          priceFormatted: currentPrice ? `$${currentPrice.toFixed(2)}` : 'N/A',
          changeFormatted: changePercent ? `${changePercent > 0 ? '+' : ''}${changePercent.toFixed(2)}%` : 'N/A',
          marketCap: marketCap ? 
            marketCap >= 1000000 ? `$${(marketCap / 1000000).toFixed(2)}T` :
            marketCap >= 1000 ? `$${(marketCap / 1000).toFixed(2)}B` :
            `$${marketCap.toFixed(2)}M` : 'N/A',
          peRatio: peRatio ? peRatio.toFixed(1) : 'N/A'
        };
      })
    );
    
    return enrichedItems;
  } catch (err) {
    console.error('getUserWatchlistWithData error:', err);
    return [];
  }
}
