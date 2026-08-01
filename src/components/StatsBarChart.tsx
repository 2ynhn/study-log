import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

export interface StatsBarChartDatum {
  name: string
  실제: number
  목표: number
}

export function StatsBarChart({ data }: { data: StatsBarChartDatum[] }) {
  const width = Math.max(data.length * 96, 320)

  return (
    <div style={{ overflowX: 'auto' }}>
      <div style={{ width, height: 260 }}>
        <ResponsiveContainer>
          <BarChart data={data} barCategoryGap={16} barGap={2}>
            <CartesianGrid vertical={false} stroke="var(--chart-gridline)" />
            <XAxis
              dataKey="name"
              tick={{ fill: 'var(--chart-ink-muted)', fontSize: 12 }}
              axisLine={{ stroke: 'var(--chart-baseline)' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: 'var(--chart-ink-muted)', fontSize: 12 }}
              axisLine={false}
              tickLine={false}
              width={36}
              allowDecimals={false}
            />
            <Tooltip
              cursor={{ fill: 'var(--chart-gridline)' }}
              contentStyle={{
                background: 'var(--chart-surface)',
                border: '1px solid var(--chart-gridline)',
                borderRadius: 8,
                color: 'var(--chart-ink-primary)',
                fontSize: 13,
              }}
            />
            <Legend wrapperStyle={{ fontSize: 12, color: 'var(--chart-ink-secondary)' }} />
            <Bar dataKey="실제" fill="var(--chart-series-actual)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
            <Bar dataKey="목표" fill="var(--chart-series-goal)" radius={[4, 4, 0, 0]} maxBarSize={24} isAnimationActive={false} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
