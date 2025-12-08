import { useMemo } from 'react';

interface DataPoint {
  feature: string;
  value: number;
  impact: number;
  color: string;
}

export interface WaterfallChartProps {
  data: DataPoint[];
}

interface ChartBar {
  feature: string;
  value: number;
  color: string;
  start: number;
  end: number;
  isPositive: boolean;
  isBase?: boolean;
  isTotal?: boolean;
}

export default function WaterfallChart({ data }: WaterfallChartProps) {
  const chartData = useMemo(() => {
    const sortedData = [...data].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));
    const topFeatures = sortedData.slice(0, 6);
    const remainingFeatures = sortedData.slice(6);
    const remainingSum = remainingFeatures.reduce((sum, item) => sum + item.impact, 0);

    const bars: ChartBar[] = [];

    bars.push({
      feature: 'Base',
      value: 0,
      color: '#64748b',
      start: 0,
      end: 0,
      isPositive: true,
      isBase: true,
    });

    let cumulativeValue = 0;

    topFeatures.forEach((item) => {
      const start = cumulativeValue;
      const end = cumulativeValue + item.impact;

      bars.push({
        feature: item.feature,
        value: item.impact,
        color: item.color,
        start,
        end,
        isPositive: item.impact >= 0,
      });

      cumulativeValue = end;
    });

    if (remainingFeatures.length > 0) {
      const start = cumulativeValue;
      const end = cumulativeValue + remainingSum;

      bars.push({
        feature: `${remainingFeatures.length} features`,
        value: remainingSum,
        color: remainingSum >= 0 ? '#10B981' : '#EF4444',
        start,
        end,
        isPositive: remainingSum >= 0,
      });

      cumulativeValue = end;
    }

    bars.push({
      feature: 'Total',
      value: cumulativeValue,
      color: '#3b82f6',
      start: 0,
      end: cumulativeValue,
      isPositive: cumulativeValue >= 0,
      isTotal: true,
    });

    return { bars, total: cumulativeValue, totalFeatures: data.length };
  }, [data]);

  const { bars, total, totalFeatures } = chartData;

  const maxValue = Math.max(0, ...bars.map(b => Math.max(b.start, b.end)));
  const minValue = Math.min(0, ...bars.map(b => Math.min(b.start, b.end)));
  const range = maxValue - minValue;
  const padding = range * 0.15;

  const getYPosition = (value: number) => {
    return ((maxValue + padding - value) / (range + 2 * padding)) * 100;
  };

  const getHeight = (start: number, end: number) => {
    return Math.abs(getYPosition(end) - getYPosition(start));
  };

  return (
    <div className="w-full bg-white rounded-lg border border-slate-200 p-6">
      <div className="relative min-h-[400px] h-[500px] overflow-x-auto">
        {/* Zero line */}
        <svg className="absolute inset-0 w-full h-full">
          <line
            x1="0"
            y1={`${getYPosition(0)}%`}
            x2="100%"
            y2={`${getYPosition(0)}%`}
            stroke="#94a3b8"
            strokeWidth="2"
            strokeDasharray="8 4"
          />
        </svg>

        {/* Chart content */}
        <div className="relative h-full flex items-stretch justify-start gap-12 px-8" style={{ minWidth: '800px' }}>
          {bars.map((bar, index) => {
            const isConnector = !bar.isBase && !bar.isTotal && index < bars.length - 1;
            const top = bar.isBase ? getYPosition(0) : Math.min(getYPosition(bar.start), getYPosition(bar.end));
            const height = bar.isBase ? 0 : getHeight(bar.start, bar.end);

            return (
              <div key={index} className="relative flex flex-col items-center" style={{ width: '120px' }}>
                <div className="relative flex-1 w-full">
                  {!bar.isBase && (
                    <div
                      className="absolute w-full transition-all duration-300 hover:shadow-lg hover:scale-105 cursor-pointer rounded-t-md"
                      style={{
                        backgroundColor: bar.color,
                        top: `${top}%`,
                        height: `${height}%`,
                        minHeight: '6px',
                        borderRadius: '6px 6px 0 0',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
                        <span className="text-xs font-bold text-slate-800 bg-white px-2 py-1 rounded shadow-sm">
                          {bar.value > 0 ? '+' : ''}{Number(bar.value).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}

                  {bar.isBase && (
                    <div
                      className="absolute w-full"
                      style={{
                        top: `${getYPosition(0)}%`,
                        height: '3px',
                        backgroundColor: '#64748b',
                        borderRadius: '2px',
                      }}
                    />
                  )}

                  {isConnector && (
                    <svg
                      className="absolute"
                      style={{
                        top: `${getYPosition(bar.end)}%`,
                        left: '50%',
                        width: '100%',
                        height: `${Math.abs(getYPosition(bars[index + 1].start) - getYPosition(bar.end))}%`,
                      }}
                    >
                      <line
                        x1="0"
                        y1="0"
                        x2="50%"
                        y2="100%"
                        stroke="#cbd5e1"
                        strokeWidth="3"
                        strokeDasharray="6 3"
                      />
                    </svg>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs font-semibold text-slate-800 max-w-[120px] break-words leading-tight">
                    {bar.feature}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Y-axis labels */}
        <div className="absolute left-3 top-0 bottom-0 flex flex-col justify-between py-8 text-xs text-slate-600 font-semibold">
          <span className="bg-white px-2 py-1 rounded shadow-sm">{Number(maxValue).toFixed(1)}</span>
          <span className="bg-white px-2 py-1 rounded shadow-sm font-bold text-slate-800">0.0</span>
          <span className="bg-white px-2 py-1 rounded shadow-sm">{Number(minValue).toFixed(1)}</span>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-200 bg-slate-50 rounded-lg p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-slate-600 mb-2 font-medium">Total Features</p>
            <p className="text-2xl font-bold text-slate-800">{totalFeatures}</p>
          </div>
          <div className="text-center bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-slate-600 mb-2 font-medium">Final Value</p>
            <p className={`text-2xl font-bold ${total >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
              {Number(total).toFixed(2)}
            </p>
          </div>
          <div className="text-center bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-slate-600 mb-2 font-medium">Positive Impact</p>
            <p className="text-2xl font-bold text-emerald-600">
              {bars.filter(b => !b.isBase && !b.isTotal && b.isPositive && b.value > 0).length}
            </p>
          </div>
          <div className="text-center bg-white rounded-lg p-4 shadow-sm">
            <p className="text-sm text-slate-600 mb-2 font-medium">Negative Impact</p>
            <p className="text-2xl font-bold text-red-600">
              {bars.filter(b => !b.isBase && !b.isTotal && !b.isPositive && b.value < 0).length}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
