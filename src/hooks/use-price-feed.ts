
'use client';

import { useState, useEffect } from 'react';

export type TokenPrice = {
  symbol: string;
  name: string;
  price: number;
  change24h: number;
};

const BASE_PRICES: Record<string, { name: string; price: number }> = {
  BTC: { name: 'Bitcoin', price: 98500 },
  ETH: { name: 'Ethereum', price: 3450 },
  SOL: { name: 'Solana', price: 145 },
  USDT: { name: 'Tether', price: 1.00 },
  BNB: { name: 'BNB', price: 580 },
};

/**
 * Simulates a real-time crypto price feed with slight fluctuations.
 */
export function usePriceFeed() {
  const [prices, setPrices] = useState<TokenPrice[]>([]);

  useEffect(() => {
    const updatePrices = () => {
      const newPrices = Object.entries(BASE_PRICES).map(([symbol, data]) => {
        // Random fluctuation between -0.5% and +0.5%
        const fluctuation = 1 + (Math.random() * 0.01 - 0.005);
        const currentPrice = data.price * fluctuation;
        const change = (Math.random() * 10 - 5); // Simulated 24h change

        return {
          symbol,
          name: data.name,
          price: currentPrice,
          change24h: change,
        };
      });
      setPrices(newPrices);
    };

    updatePrices();
    const interval = setInterval(updatePrices, 5000); // Update every 5 seconds
    return () => clearInterval(interval);
  }, []);

  return prices;
}
