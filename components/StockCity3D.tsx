'use client';

interface StockData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  open: number;
  previousClose: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  eps?: number;
  sentiment?: number;
}

interface StockCity3DProps {
  stocks: StockData[];
  selectedStock: StockData | null;
  onSelectStock: (stock: StockData) => void;
}

export default function StockCity3D({ stocks, selectedStock, onSelectStock }: StockCity3DProps) {
  const getBuildingHeight = (price: number): number => {
    return Math.max(150, Math.min(450, price * 1.5));
  };

  const getBuildingColor = (changePercent: number): string => {
    if (changePercent >= 2) return 'from-emerald-500 to-emerald-700';
    if (changePercent >= 0) return 'from-emerald-400 to-emerald-600';
    if (changePercent >= -2) return 'from-red-500 to-red-700';
    return 'from-red-600 to-red-800';
  };

  return (
    <div className="w-full h-full flex items-center justify-center" style={{ perspective: '2000px' }}>
      <div
        className="flex items-end gap-8"
        style={{
          transformStyle: 'preserve-3d',
          height: '500px',
          transform: 'rotateX(8deg) rotateY(-5deg)'
        }}
      >
        {stocks.map((stock, index) => {
          const height = getBuildingHeight(stock.price);
          const colorClass = getBuildingColor(stock.changePercent);
          const isSelected = selectedStock?.symbol === stock.symbol;

          return (
            <div
              key={stock.symbol}
              className="relative cursor-pointer transition-all duration-500"
              style={{
                height: `${height}px`,
                width: '90px',
                transformStyle: 'preserve-3d',
                transform: `rotateY(25deg) ${isSelected ? 'translateY(-20px)' : 'translateY(0)'}`,
                alignSelf: 'flex-end'
              }}
              onClick={() => onSelectStock(stock)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = `rotateY(25deg) translateY(-15px)`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = `rotateY(25deg) ${isSelected ? 'translateY(-20px)' : ''}`;
              }}
            >
              <div
                className="absolute inset-0"
                style={{ transformStyle: 'preserve-3d' }}
              >
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${colorClass} rounded-t-xl ${
                    isSelected ? 'ring-4 ring-blue-400' : ''
                  }`}
                  style={{
                    transform: 'translateZ(45px)',
                    boxShadow: isSelected
                      ? '0 0 60px rgba(59, 130, 246, 0.9), 0 30px 80px rgba(0, 0, 0, 0.8)'
                      : '0 20px 60px rgba(0, 0, 0, 0.7)',
                  }}
                >
                  <div className="absolute inset-0 p-2">
                    <div className="grid grid-cols-3 gap-1 h-full">
                      {Array.from({ length: Math.floor(height / 30) * 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-yellow-200/30 rounded-sm"
                          style={{ height: '12px', marginBottom: '4px' }}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="absolute top-6 left-0 right-0 text-center z-10">
                    <div className="bg-slate-900/80 backdrop-blur-sm px-3 py-2 inline-block rounded-lg border border-white/20">
                      <div className="text-white font-bold text-xl">{stock.symbol}</div>
                    </div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 bg-slate-900/90 backdrop-blur-sm p-3 text-center rounded-b-xl">
                    <div className="text-white text-base font-semibold">
                      ${stock.price.toFixed(2)}
                    </div>
                    <div className={`text-sm font-medium ${stock.changePercent >= 0 ? 'text-emerald-300' : 'text-red-300'}`}>
                      {stock.changePercent >= 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <div
                  className={`absolute top-0 left-full h-full bg-gradient-to-b ${colorClass}`}
                  style={{
                    width: '90px',
                    transform: 'rotateY(90deg)',
                    transformOrigin: 'left',
                    filter: 'brightness(0.6)',
                    borderRadius: '0 12px 0 0',
                  }}
                >
                  <div className="absolute inset-0 p-2">
                    <div className="grid grid-cols-2 gap-1 h-full">
                      {Array.from({ length: Math.floor(height / 35) * 2 }).map((_, i) => (
                        <div
                          key={i}
                          className="bg-yellow-200/20 rounded-sm"
                          style={{ height: '10px', marginBottom: '4px' }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div
                  className={`absolute top-0 left-0 right-0 bg-gradient-to-br ${colorClass}`}
                  style={{
                    height: '90px',
                    transform: 'rotateX(90deg)',
                    transformOrigin: 'top',
                    filter: 'brightness(0.8)',
                    borderRadius: '12px',
                  }}
                />
              </div>

              <div
                className="absolute left-1/2 bg-black/50 blur-2xl rounded-full"
                style={{
                  bottom: '-10px',
                  width: '120%',
                  height: '30px',
                  transform: 'translateX(-50%)',
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
