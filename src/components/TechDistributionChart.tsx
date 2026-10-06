import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { Code2, Sparkles, Cpu } from 'lucide-react';

interface TechDistributionChartProps {
  languages: { name: string; count: number; percentage: number; color: string }[];
}

export const TechDistributionChart: React.FC<TechDistributionChartProps> = ({ languages }) => {
  if (!languages || languages.length === 0) return null;

  const data = languages.map((lang) => ({
    name: lang.name,
    count: lang.count,
    percentage: lang.percentage,
    color: lang.color || '#00B4AB',
  }));

  return (
    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <Code2 size={15} className="text-cyan-500" />
          <span className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
            Repository Stack Distribution
          </span>
        </div>
        <span className="text-[11px] font-mono text-slate-500 dark:text-gray-400">
          Dart Ecosystem Focused
        </span>
      </div>

      <div className="h-28 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 30, left: 10, bottom: 4 }}>
            <XAxis type="number" hide domain={[0, 100]} />
            <YAxis
              type="category"
              dataKey="name"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: 'currentColor' }}
              width={65}
              className="text-slate-700 dark:text-gray-300 font-mono font-semibold"
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const item = payload[0].payload;
                  return (
                    <div className="p-2.5 rounded-xl bg-slate-900 text-white border border-white/15 shadow-xl font-mono text-xs">
                      <div className="font-bold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span>{item.name}</span>
                      </div>
                      <div className="text-gray-300 mt-1">
                        Repos: <span className="text-cyan-300 font-bold">{item.count}</span> ({item.percentage}%)
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Bar dataKey="percentage" radius={[0, 6, 6, 0]} barSize={16}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
