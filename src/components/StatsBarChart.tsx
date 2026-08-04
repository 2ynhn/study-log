import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatMinutes } from '../utils/time'

export interface StatsBarChartDatum {
  name: string
  color: string
  실제: number
  목표: number
}

export function StatsBarChart({ data }: { data: StatsBarChartDatum[] }) {
  const width = Math.max(data.length * 100, 320)

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ width, height: 190 }}>
        <ResponsiveContainer>
          <BarChart data={data} barCategoryGap={14} barGap={3}>
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--color-text-muted)', fontSize: 16, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip
              cursor={{ fill: 'var(--color-track)' }}
              formatter={(value) => formatMinutes(Number(value))}
              contentStyle={{
                background: 'var(--color-surface)',
                border: '1.5px dashed var(--color-border)',
                borderRadius: 8,
                color: 'var(--color-text)',
                fontSize: 16,
              }}
            />
            <Bar dataKey="실제" radius={[2, 2, 0, 0]} maxBarSize={9} isAnimationActive={false}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={entry.color} />
              ))}
            </Bar>
            <Bar
              dataKey="목표"
              fill="none"
              stroke="rgba(60,50,40,.3)"
              strokeWidth={1.5}
              strokeDasharray="3 2"
              radius={[2, 2, 0, 0]}
              maxBarSize={9}
              isAnimationActive={false}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
