import type { RouterOutputs } from '@fewmail/api/router'
import type { BoardChart } from '@fewmail/shared/agent'
import {
  BOARD_CHART_TYPES,
  BOARD_GROUPINGS,
  BOARD_MEASURES,
} from '@fewmail/shared/agent'
import { Button } from '@fewmail/ui/components/button'
import { IconButton } from '@fewmail/ui/components/custom/icon-button'
import { EvilAreaChart } from '@fewmail/ui/components/evilcharts/charts/recharts-area-chart'
import { EvilBarChart } from '@fewmail/ui/components/evilcharts/charts/recharts-bar-chart'
import { EvilLineChart } from '@fewmail/ui/components/evilcharts/charts/recharts-line-chart'
import { EvilPieChart } from '@fewmail/ui/components/evilcharts/charts/recharts-pie-chart'
import type { ChartConfig } from '@fewmail/ui/components/evilcharts/ui/recharts-chart'
import { Input } from '@fewmail/ui/components/input'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@fewmail/ui/components/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@fewmail/ui/components/select'
import { Settings02Icon } from '@hugeicons/core-free-icons'
import type { ComponentProps } from 'react'
import { useState } from 'react'

import { useDates, useT } from '~/lib/i18n'

export type ChartSeries = RouterOutputs['boards']['get']['charts'][number]

const PRIMARY = { dark: ['var(--primary)'], light: ['var(--primary)'] }
/** Shares step the one accent's strength; a second hue would read as a category color. */
const SHARE_STRENGTHS = [100, 78, 60, 45, 34, 26, 20]

export const toChart = ({
  currency,
  groupBy,
  id,
  measure,
  title,
  type,
}: BoardChart): BoardChart => ({
  ...(currency && { currency }),
  groupBy,
  id,
  measure,
  title,
  type,
})

const ChoiceSelect = <Value extends string>({
  label,
  labels,
  onChange,
  value,
  values,
}: {
  label: string
  labels: Record<Value, string>
  onChange: (value: Value) => void
  value: Value
  values: readonly Value[]
}) => (
  <Select
    items={values.map((option) => ({ label: labels[option], value: option }))}
    value={value}
    onValueChange={(next) => next && onChange(next)}
  >
    <SelectTrigger aria-label={label}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      {values.map((option) => (
        <SelectItem key={option} value={option}>
          {labels[option]}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

const ChartEditor = ({
  chart,
  currencies,
  onChange,
  onRemove,
  sumCurrency,
}: {
  chart: BoardChart
  currencies: string[]
  sumCurrency: string | null
  onChange: (chart: BoardChart) => void
  onRemove: () => void
}) => {
  const t = useT()
  const [title, setTitle] = useState(chart.title)

  return (
    <Popover>
      <PopoverTrigger
        render={
          <IconButton
            icon={Settings02Icon}
            label={t.boards.chart.edit}
            size="icon-sm"
            variant="ghost-muted"
          />
        }
      />
      <PopoverContent align="end" className="w-72">
        <Input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onBlur={() =>
            title.trim() &&
            title !== chart.title &&
            onChange({ ...chart, title: title.trim() })
          }
          aria-label={t.boards.chart.title}
          data-mask
        />
        <ChoiceSelect
          label={t.boards.chart.type}
          labels={t.boards.chart.types}
          values={BOARD_CHART_TYPES}
          value={chart.type}
          onChange={(type) => onChange({ ...chart, type })}
        />
        <ChoiceSelect
          label={t.boards.chart.measure}
          labels={t.boards.chart.measures}
          values={BOARD_MEASURES}
          value={chart.measure}
          onChange={(measure) => onChange({ ...chart, measure })}
        />
        <ChoiceSelect
          label={t.boards.chart.groupBy}
          labels={t.boards.chart.groupings}
          values={BOARD_GROUPINGS}
          value={chart.groupBy}
          onChange={(groupBy) => onChange({ ...chart, groupBy })}
        />
        {currencies.length > 1 && sumCurrency && (
          <ChoiceSelect
            label={t.boards.chart.currency}
            labels={Object.fromEntries(currencies.map((code) => [code, code]))}
            values={currencies}
            value={sumCurrency}
            onChange={(currency) => onChange({ ...chart, currency })}
          />
        )}
        <Button variant="ghost-destructive" size="sm" onClick={onRemove}>
          {t.boards.chart.remove}
        </Button>
      </PopoverContent>
    </Popover>
  )
}

const useRows = (series: ChartSeries) => {
  const t = useT()
  const dates = useDates()
  const labels = (key: string) => {
    if (series.groupBy === 'month') {
      const month = new Date(`${key}-01T00:00:00`)
      return {
        heading: dates.format(month, 'LLLL yyyy'),
        label: dates.format(month, 'MMM'),
      }
    }
    if (series.groupBy === 'week') {
      const label = dates.format(new Date(`${key}T00:00:00`), 'd MMM')
      return { heading: t.boards.chart.weekOf(label), label }
    }
    return { heading: key, label: key }
  }
  const rows = series.points.map(({ count, key, value }) => {
    const { heading, label } = labels(key)
    return {
      heading: count > 0 ? `${heading} · ${t.boards.entries(count)}` : heading,
      label,
      value: Math.round(value * 100) / 100,
    }
  })
  return series.rest > 0
    ? [
        ...rows,
        {
          heading: t.boards.chart.other,
          label: t.boards.chart.other,
          value: series.rest,
        },
      ]
    : rows
}

const headingOf: ComponentProps<
  typeof EvilBarChart.Tooltip
>['labelFormatter'] = (_, payload) => payload[0]?.payload?.heading

const ChartBody = ({ series }: { series: ChartSeries }) => {
  const t = useT()
  const rows = useRows(series)
  const config = {
    value: {
      colors: PRIMARY,
      label: series.sumCurrency ?? t.boards.chart.measures.count,
    },
  } satisfies ChartConfig

  if (rows.length === 0) {
    return (
      <p className="text-muted-foreground flex h-44 items-center justify-center text-sm">
        {t.boards.chart.empty}
      </p>
    )
  }
  if (series.type === 'pie') {
    const sectors = rows.map((row, index) => ({ ...row, key: `s${index}` }))
    const sectorConfig = Object.fromEntries(
      sectors.map(({ key, label }, index) => {
        const color = `color-mix(in oklch, var(--primary) ${SHARE_STRENGTHS[index] ?? 15}%, transparent)`
        return [key, { colors: { dark: [color], light: [color] }, label }]
      })
    ) satisfies ChartConfig
    return (
      <EvilPieChart
        data={sectors}
        dataKey="value"
        nameKey="key"
        config={sectorConfig}
        className="h-44 w-full"
      >
        <EvilPieChart.Pie />
        <EvilPieChart.Tooltip />
        <EvilPieChart.Legend />
      </EvilPieChart>
    )
  }
  if (series.type === 'line') {
    return (
      <EvilLineChart
        data={rows}
        config={config}
        className="h-44 w-full"
        xDataKey="label"
      >
        <EvilLineChart.Grid />
        <EvilLineChart.XAxis dataKey="label" interval="preserveStartEnd" />
        <EvilLineChart.Tooltip labelFormatter={headingOf} />
        <EvilLineChart.Line dataKey="value" />
      </EvilLineChart>
    )
  }
  if (series.type === 'area') {
    return (
      <EvilAreaChart
        data={rows}
        config={config}
        className="h-44 w-full"
        xDataKey="label"
      >
        <EvilAreaChart.Grid />
        <EvilAreaChart.XAxis dataKey="label" interval="preserveStartEnd" />
        <EvilAreaChart.Tooltip labelFormatter={headingOf} />
        <EvilAreaChart.Area dataKey="value" />
      </EvilAreaChart>
    )
  }
  return (
    <EvilBarChart
      data={rows}
      config={config}
      className="h-44 w-full"
      xDataKey="label"
    >
      <EvilBarChart.Grid />
      <EvilBarChart.XAxis dataKey="label" interval="preserveStartEnd" />
      <EvilBarChart.Tooltip labelFormatter={headingOf} />
      <EvilBarChart.Bar dataKey="value" />
    </EvilBarChart>
  )
}

const SkippedNote = ({ series }: { series: ChartSeries }) => {
  const t = useT()
  return (
    <p className="text-muted-foreground text-xs">
      {t.boards.chart.skipped(series.skipped)}
    </p>
  )
}

export const BoardChartCard = ({
  onChange,
  onRemove,
  series,
}: {
  onChange: (chart: BoardChart) => void
  onRemove: () => void
  series: ChartSeries
}) => (
  <section className="bg-card ring-foreground/6 flex flex-col gap-2 rounded-2xl p-4 ring">
    <header className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-medium" data-mask>
        {series.title}
      </h3>
      <ChartEditor
        chart={toChart(series)}
        currencies={series.currencies}
        sumCurrency={series.sumCurrency}
        onChange={onChange}
        onRemove={onRemove}
      />
    </header>
    <div data-mask>
      <ChartBody series={series} />
    </div>
    {series.skipped > 0 && <SkippedNote series={series} />}
  </section>
)
