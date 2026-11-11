import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { useQuery } from '@tanstack/react-query'
import { createFileRoute, redirect } from '@tanstack/react-router'

import { useDates, useLocale, useT } from '~/lib/i18n'
import { orpc } from '~/lib/orpc'

const useMoneyFormat = () => {
  const locale = useLocale()
  return (cents: number, currency: string) =>
    new Intl.NumberFormat(locale, { currency, style: 'currency' }).format(
      cents / 100
    )
}

const MoneyPage = () => {
  const t = useT()
  const dates = useDates()
  const money = useMoneyFormat()
  const { data } = useQuery(orpc.money.queryOptions())
  const isEmpty =
    data &&
    data.subscriptions.length === 0 &&
    data.upcomingBills.length === 0 &&
    data.recent.length === 0

  return (
    <main className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-10 pt-12 pb-16">
        <header className="flex flex-col gap-3">
          <h1 className="text-display font-serif tracking-tight">
            {t.money.title}
          </h1>
          <p className="text-brief text-foreground/85 font-serif">
            {t.money.lead}
          </p>
        </header>

        {isEmpty && (
          <p className="text-muted-foreground rounded-2xl border border-dashed px-4.5 py-4 text-sm">
            {t.money.empty}
          </p>
        )}

        {data && data.monthlyByCurrency.length > 0 && (
          <section className="flex flex-col gap-1">
            <span className="text-muted-foreground text-xs font-medium">
              {t.money.monthlyTotal}
            </span>
            <span className="font-serif text-3xl tabular-nums" data-mask>
              {data.monthlyByCurrency
                .map(({ currency, monthlyCents }) =>
                  money(monthlyCents, currency)
                )
                .join(' + ')}
            </span>
          </section>
        )}

        {data && data.upcomingBills.length > 0 && (
          <SettingsGroup title={t.money.upcoming}>
            {data.upcomingBills.map((bill) => (
              <SettingsRow
                key={bill.id}
                title={<span data-mask>{bill.merchant}</span>}
                description={
                  bill.dueAt
                    ? t.money.due(dates.format(bill.dueAt, 'EEE d MMM'))
                    : undefined
                }
              >
                <span className="tabular-nums" data-mask>
                  {money(bill.amountCents, bill.currency)}
                </span>
              </SettingsRow>
            ))}
          </SettingsGroup>
        )}

        {data && data.subscriptions.length > 0 && (
          <SettingsGroup title={t.money.subscriptions}>
            {data.subscriptions.map((subscription) => (
              <SettingsRow
                key={subscription.merchant}
                title={<span data-mask>{subscription.merchant}</span>}
                description={`${t.money.period[subscription.period]} · ${t.money.lastCharged(dates.format(subscription.lastChargedAt, 'd MMM'))}`}
              >
                <span className="tabular-nums" data-mask>
                  {money(subscription.amountCents, subscription.currency)}
                </span>
              </SettingsRow>
            ))}
          </SettingsGroup>
        )}

        {data && data.recent.length > 0 && (
          <SettingsGroup title={t.money.recent}>
            {data.recent.map((purchase) => (
              <SettingsRow
                key={purchase.id}
                title={<span data-mask>{purchase.merchant}</span>}
                description={dates.format(purchase.chargedAt, 'd MMM yyyy')}
              >
                <span className="tabular-nums" data-mask>
                  {money(purchase.amountCents, purchase.currency)}
                </span>
              </SettingsRow>
            ))}
          </SettingsGroup>
        )}
      </div>
    </main>
  )
}

export const Route = createFileRoute('/_app/money')({
  beforeLoad: ({ context }) => {
    if (context.me.plan.kind === 'free') {
      throw redirect({ to: '/mail' })
    }
  },
  component: MoneyPage,
})
