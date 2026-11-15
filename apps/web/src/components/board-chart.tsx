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
import { Spinner } from '@fewmail/ui/components/spinner'
import { Settings02Icon } from '@hugeicons/core-free-icons'
import { useMutation } from '@tanstack/react-query'
import type { ComponentProps } from 'react'
import { useState } from 'react'

import { useStatusLabel } from '~/components/board-entries'
import { useDates, useLocale, useMoneyFormat, useT } from '~/lib/i18n'
import { orpc, refetchChanged } from '~/lib/orpc'

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
  isOff,
  label,
  labels,
  onChange,
  value,
  values,
}: {
  isOff?: (value: Value) => boolean
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
        <SelectItem key={option} value={option} disabled={isOff?.(option)}>
          {labels[option]}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

const isOverTime = (groupBy: BoardChart['groupBy']) =>
  groupBy === 'month' || groupBy === 'week'

/** A pie over months or a sum without amounts draws nothing true, so those choices are off and a switch that would make one picks the next best. */
const ChartEditor = ({
  canMove,
  chart,
  currencies,
  hasAmounts,
  onChange,
  onMove,
  onRemove,
  sumCurrency,
}: {
  canMove: { earlier: boolean; later: boolean }
  chart: BoardChart
  currencies: string[]
  hasAmounts: boolean
  sumCurrency: string | null
  onChange: (chart: BoardChart) => void
  onMove: (step: -1 | 1) => void
  onRemove: () => void
}) => {
  const t = useT()
  const [title, setTitle] = useState(chart.title)
  const commitTitle = () =>
    title.trim() &&
    title.trim() !== chart.title &&
    onChange({ ...chart, title: title.trim() })

  return (
    <Popover onOpenChange={(open) => !open && commitTitle()}>
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
          onBlur={commitTitle}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.nativeEvent.isComposing) {
              event.preventDefault()
              commitTitle()
            }
          }}
          aria-label={t.boards.chart.title}
          data-mask
        />
        <ChoiceSelect
          label={t.boards.chart.type}
          labels={t.boards.chart.types}
          values={BOARD_CHART_TYPES}
          value={chart.type}
          isOff={(type) => type === 'pie' && isOverTime(chart.groupBy)}
          onChange={(type) => onChange({ ...chart, type })}
        />
        <ChoiceSelect
          label={t.boards.chart.measure}
          labels={t.boards.chart.measures}
          values={BOARD_MEASURES}
          value={chart.measure}
          isOff={(measure) => measure === 'sum' && !hasAmounts}
          onChange={(measure) => onChange({ ...chart, measure })}
        />
        <ChoiceSelect
          label={t.boards.chart.groupBy}
          labels={t.boards.chart.groupings}
          values={BOARD_GROUPINGS}
          value={chart.groupBy}
          onChange={(groupBy) =>
            onChange({
              ...chart,
              groupBy,
              type:
                chart.type === 'pie' && isOverTime(groupBy)
                  ? 'bar'
                  : chart.type,
            })
          }
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
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            disabled={!canMove.earlier}
            onClick={() => onMove(-1)}
          >
            {t.boards.chart.moveEarlier}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            className="flex-1"
            disabled={!canMove.later}
            onClick={() => onMove(1)}
          >
            {t.boards.chart.moveLater}
          </Button>
        </div>
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
  const statusLabel = useStatusLabel()
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
    const label = series.groupBy === 'status' ? statusLabel(key) : key
    return { heading: label, label }
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

/** `onPick` gets the clicked bucket's key (a month, a week, a group or a status); clicking the picked one again clears it. */
const ChartBody = ({
  onPick,
  picked,
  series,
}: {
  onPick: (key: string | null) => void
  picked: string | null
  series: ChartSeries
}) => {
  const t = useT()
  const locale = useLocale()
  const money = useMoneyFormat()
  const rows = useRows(series)
  const { sumCurrency } = series
  const formatValue = (value: number) =>
    sumCurrency
      ? money(Math.round(value * 100), sumCurrency)
      : value.toLocaleString(locale)
  const config = {
    value: {
      colors: PRIMARY,
      formatValue,
      label: sumCurrency
        ? t.boards.chart.measures.sum
        : t.boards.chart.measures.count,
    },
  } satisfies ChartConfig
  const pickAt = (index: number | undefined) => {
    const key = index === undefined ? undefined : series.points[index]?.key
    if (key !== undefined) {
      onPick(key === picked ? null : key)
    }
  }
  const chartProps = {
    className: 'cursor-pointer',
    onClick: ({
      activeTooltipIndex,
    }: {
      activeTooltipIndex?: number | string | null
    }) =>
      pickAt(
        activeTooltipIndex === null || activeTooltipIndex === undefined
          ? undefined
          : Number(activeTooltipIndex)
      ),
  }

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
        return [
          key,
          { colors: { dark: [color], light: [color] }, formatValue, label },
        ]
      })
    ) satisfies ChartConfig
    const pickedIndex = series.points.findIndex(({ key }) => key === picked)
    return (
      <EvilPieChart
        // The pie keeps its own selection; remounting lines it up with a filter cleared elsewhere.
        key={picked ?? ''}
        data={sectors}
        dataKey="value"
        nameKey="key"
        config={sectorConfig}
        className="h-44 w-full"
        defaultSelectedSector={pickedIndex === -1 ? null : `s${pickedIndex}`}
        onSelectionChange={(selection) =>
          selection ? pickAt(Number(selection.dataKey.slice(1))) : onPick(null)
        }
      >
        <EvilPieChart.Pie isClickable />
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
        chartProps={chartProps}
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
        chartProps={chartProps}
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
      chartProps={chartProps}
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
      {t.boards.chart.skipped(series.left)}
    </p>
  )
}

const hasLeft = ({ left }: ChartSeries) =>
  left.amount + left.currency + left.payment > 0

export const BoardChartCard = ({
  canMove,
  hasAmounts,
  onChange,
  onMove,
  onPick,
  onRemove,
  picked,
  series,
}: {
  canMove: { earlier: boolean; later: boolean }
  hasAmounts: boolean
  onChange: (chart: BoardChart) => void
  onMove: (step: -1 | 1) => void
  onPick: (key: string | null) => void
  onRemove: () => void
  picked: string | null
  series: ChartSeries
}) => (
  <section className="bg-card ring-foreground/6 flex flex-col gap-2 rounded-2xl p-4 ring">
    <header className="flex items-center justify-between gap-2">
      <h3 className="text-sm font-medium" data-mask>
        {series.title}
      </h3>
      <ChartEditor
        canMove={canMove}
        chart={toChart(series)}
        currencies={series.currencies}
        hasAmounts={hasAmounts}
        sumCurrency={series.sumCurrency}
        onChange={onChange}
        onMove={onMove}
        onRemove={onRemove}
      />
    </header>
    <div data-mask>
      <ChartBody series={series} picked={picked} onPick={onPick} />
    </div>
    {hasLeft(series) && <SkippedNote series={series} />}
  </section>
)

/** Adds a chart from the user's words; Enter with nothing typed adds a count per month to start from. */
export const AddChart = ({
  boardId,
  onOpenChange,
  open,
}: {
  boardId: string
  onOpenChange: (open: boolean) => void
  open: boolean
}) => {
  const t = useT()
  const [ask, setAsk] = useState('')
  const add = useMutation(
    orpc.boards.addChart.mutationOptions({
      onSettled: () => refetchChanged(['boards']),
      onSuccess: () => {
        onOpenChange(false)
        setAsk('')
      },
    })
  )

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger
        render={<Button variant="secondary" className="justify-self-start" />}
      >
        {t.boards.chart.add}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80">
        <form
          className="flex flex-col gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            add.mutate({ ask: ask.trim(), id: boardId })
          }}
        >
          <Input
            autoFocus
            value={ask}
            disabled={add.isPending}
            onChange={(event) => setAsk(event.target.value)}
            placeholder={t.boards.chart.askPlaceholder}
            aria-label={t.boards.chart.ask}
            data-mask
          />
          <Button type="submit" size="sm" disabled={add.isPending}>
            {add.isPending && <Spinner />}
            {t.boards.chart.add}
          </Button>
        </form>
      </PopoverContent>
    </Popover>
  )
}
