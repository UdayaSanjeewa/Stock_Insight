'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Search, TrendingUp, TrendingDown, Star } from 'lucide-react';
import Link from 'next/link';

interface StockSearchProps {
  onStockSelect: (symbol: string) => void;
  selectedStock: string;
}

export function StockSearch({ onStockSelect, selectedStock }: StockSearchProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  // Popular stocks with mock data
  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 175.43, change: 2.1, popular: true },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 138.21, change: -0.8, popular: true },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 378.85, change: 1.5, popular: true },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 144.98, change: 0.7, popular: true },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 219.16, change: -3.2, popular: true },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 481.86, change: 4.8, popular: true },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: 296.73, change: 1.9, popular: true },
    { symbol: 'NFLX', name: 'Netflix Inc.', price: 421.25, change: -1.1, popular: false },
    { symbol: 'ORCL', name: 'Oracle Corp.', price: 98.43, change: 0.9, popular: false },
    { symbol: 'CRM', name: 'Salesforce Inc.', price: 214.38, change: -0.4, popular: false },
  ];

  const filteredStocks = popularStocks.filter(stock => 
    stock.symbol.toLowerCase().includes(searchValue.toLowerCase()) ||
    stock.name.toLowerCase().includes(searchValue.toLowerCase())
  );

  const selectedStockInfo = popularStocks.find(stock => stock.symbol === selectedStock);

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="flex-1">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={open}
                className="w-full md:w-96 justify-between h-12 text-left"
              >
                <div className="flex items-center gap-3">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <div className="font-semibold">{selectedStock}</div>
                    {selectedStockInfo && (
                      <div className="text-xs text-muted-foreground">
                        {selectedStockInfo.name}
                      </div>
                    )}
                  </div>
                </div>
                {selectedStockInfo && (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">${selectedStockInfo.price}</span>
                    <div className={`flex items-center gap-1 ${
                      selectedStockInfo.change >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {selectedStockInfo.change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span className="text-xs">
                        {selectedStockInfo.change >= 0 ? '+' : ''}{selectedStockInfo.change}%
                      </span>
                    </div>
                  </div>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 p-0">
              <Command>
                <CommandInput 
                  placeholder="Search stocks..." 
                  value={searchValue}
                  onValueChange={setSearchValue}
                />
                <CommandEmpty>No stocks found.</CommandEmpty>
                <CommandGroup heading="Popular Stocks">
                  {filteredStocks.filter(stock => stock.popular).map((stock) => (
                    <CommandItem
                      key={stock.symbol}
                      value={stock.symbol}
                      onSelect={(currentValue) => {
                        onStockSelect(currentValue.toUpperCase());
                        setOpen(false);
                        setSearchValue('');
                      }}
                    >
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <div>
                            <div className="font-semibold">{stock.symbol}</div>
                            <div className="text-xs text-muted-foreground">
                              {stock.name}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold">${stock.price}</div>
                          <div className={`text-xs flex items-center gap-1 ${
                            stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {stock.change >= 0 ? (
                              <TrendingUp className="h-3 w-3" />
                            ) : (
                              <TrendingDown className="h-3 w-3" />
                            )}
                            {stock.change >= 0 ? '+' : ''}{stock.change}%
                          </div>
                        </div>
                      </div>
                    </CommandItem>
                  ))}
                </CommandGroup>
                {filteredStocks.filter(stock => !stock.popular).length > 0 && (
                  <CommandGroup heading="Other Stocks">
                    {filteredStocks.filter(stock => !stock.popular).map((stock) => (
                      <CommandItem
                        key={stock.symbol}
                        value={stock.symbol}
                        onSelect={(currentValue) => {
                          onStockSelect(currentValue.toUpperCase());
                          setOpen(false);
                          setSearchValue('');
                        }}
                      >
                        <div className="flex items-center justify-between w-full">
                          <div>
                            <div className="font-semibold">{stock.symbol}</div>
                            <div className="text-xs text-muted-foreground">
                              {stock.name}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">${stock.price}</div>
                            <div className={`text-xs flex items-center gap-1 ${
                              stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {stock.change >= 0 ? (
                                <TrendingUp className="h-3 w-3" />
                              ) : (
                                <TrendingDown className="h-3 w-3" />
                              )}
                              {stock.change >= 0 ? '+' : ''}{stock.change}%
                            </div>
                          </div>
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                )}
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-wrap gap-2">
          {popularStocks.filter(stock => stock.popular).slice(0, 4).map((stock) => (
            <Link
              key={stock.symbol}
              href={`/stock/${stock.symbol.toLowerCase()}`}
            >
              <Button
                variant={selectedStock === stock.symbol ? "default" : "outline"}
                size="sm"
                className="flex items-center gap-2"
              >
                <span>{stock.symbol}</span>
                <span className={`text-xs ${
                  stock.change >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stock.change >= 0 ? '+' : ''}{stock.change}%
                </span>
              </Button>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}