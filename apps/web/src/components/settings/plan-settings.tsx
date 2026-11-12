import type { BillingInterval, PaidPlan, Plan } from '@fewmail/shared/agent'
import { PAID_PLANS, PLAN_LIMITS, PRICE_USD } from '@fewmail/shared/agent'
import type { Messages } from '@fewmail/shared/i18n'
import { formatResetDay } from '@fewmail/shared/i18n/locales'
import { Button } from '@fewmail/ui/components/button'
import {
  SettingsGroup,
  SettingsRow,
} from '@fewmail/ui/components/custom/settings-group'
import { Progress } from '@fewmail/ui/components/progress'
import { Switch } from '@fewmail/ui/components/switch'
import { useMutation } from '@tanstack/react-query'
import { useState } from 'react'

import { useLocale, useT } from '~/lib/i18n'
import { useMe } from '~/lib/me'
import { orpc } from '~/lib/orpc'

const isPaid = (kind: Plan): kind is PaidPlan =>
  (PAID_PLANS as readonly Plan[]).includes(kind)

const planDescription = (
  t: Messages,
  plan: {
    cancelAtPeriodEnd: boolean
    kind: Plan
    periodEnd: Date | null
    trialEndsAt: Date | null
  },
  formatDate: (date: Date) => string
) => {
  if (plan.kind === 'trial' && plan.trialEndsAt) {
    return t.plan.trialDescription(formatDate(plan.trialEndsAt))
  }
  if (isPaid(plan.kind) && plan.periodEnd) {
    return plan.cancelAtPeriodEnd
      ? t.plan.cancels(t.plan[plan.kind], formatDate(plan.periodEnd))
      : t.plan.proRenews(formatDate(plan.periodEnd))
  }
  return t.plan.freeDescription
}

const redirectTo = ({ url }: { url: string }) => location.assign(url)

const UsageMeter = ({
  label,
  total,
  used,
}: {
  label: (used: string, total: string) => string
  total: number
  used: number
}) => {
  const locale = useLocale()
  return (
    <div className="flex w-40 flex-col items-end gap-1.5">
      <span className="text-muted-foreground text-xs tabular-nums">
        {label(used.toLocaleString(locale), total.toLocaleString(locale))}
      </span>
      <Progress
        value={Math.min(100, (used / total) * 100)}
        variant={used >= total ? 'destructive' : 'default'}
      />
    </div>
  )
}

export const PlanSettings = () => {
  const t = useT()
  const locale = useLocale()
  const { plan, usage } = useMe()
  const checkout = useMutation(
    orpc.billing.checkout.mutationOptions({ onSuccess: redirectTo })
  )
  const portal = useMutation(
    orpc.billing.portal.mutationOptions({ onSuccess: redirectTo })
  )
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>('month')
  const formatPrice =
    billingInterval === 'year' ? t.plan.priceYearly : t.plan.price
  const limits = plan.kind === 'free' ? null : PLAN_LIMITS[plan.kind]
  const choices =
    plan.kind === 'max'
      ? []
      : PAID_PLANS.filter((choice) => choice !== plan.kind)
  const limitsText = (choice: PaidPlan) => {
    const { emails, messages } = PLAN_LIMITS[choice]
    const describe = choice === 'max' ? t.plan.maxLimits : t.plan.proLimits
    return describe(emails.toLocaleString(locale), String(messages))
  }

  return (
    <>
      <SettingsGroup title={t.plan.title}>
        <SettingsRow
          title={t.plan[plan.kind]}
          description={planDescription(t, plan, (date) =>
            formatResetDay(locale, date)
          )}
        >
          {isPaid(plan.kind) && (
            <Button
              size="sm"
              variant="outline"
              disabled={portal.isPending}
              onClick={() => portal.mutate()}
            >
              {t.plan.manage}
            </Button>
          )}
        </SettingsRow>
        {limits && (
          <SettingsRow
            title={t.plan.usage}
            description={t.plan.resets(formatResetDay(locale, usage.resetsAt))}
          >
            <div className="flex flex-col gap-3">
              <UsageMeter
                label={t.plan.emailsUsed}
                used={usage.emails}
                total={limits.emails}
              />
              <UsageMeter
                label={t.plan.messagesUsed}
                used={usage.messages}
                total={limits.messages}
              />
            </div>
          </SettingsRow>
        )}
      </SettingsGroup>
      {choices.length > 0 && (
        <SettingsGroup title={t.plan.upgrade}>
          {!isPaid(plan.kind) && (
            <SettingsRow
              title={t.plan.yearly}
              description={t.plan.yearlyHint}
              htmlFor="yearly-billing"
            >
              <Switch
                id="yearly-billing"
                checked={billingInterval === 'year'}
                onCheckedChange={(yearly) =>
                  setBillingInterval(yearly ? 'year' : 'month')
                }
              />
            </SettingsRow>
          )}
          {choices.map((choice) => (
            <SettingsRow
              key={choice}
              title={`${t.plan[choice]} · ${formatPrice(PRICE_USD[choice][billingInterval])}`}
              description={limitsText(choice)}
            >
              <Button
                size="sm"
                variant={
                  plan.kind === 'free' && choice === 'pro'
                    ? 'default'
                    : 'outline'
                }
                disabled={checkout.isPending || portal.isPending}
                onClick={() =>
                  isPaid(plan.kind)
                    ? portal.mutate()
                    : checkout.mutate({
                        interval: billingInterval,
                        plan: choice,
                      })
                }
              >
                {t.plan.choose(t.plan[choice])}
              </Button>
            </SettingsRow>
          ))}
          {plan.kind === 'free' && (
            <p className="text-muted-foreground p-3.5 text-sm">
              {t.plan.includes}
            </p>
          )}
        </SettingsGroup>
      )}
    </>
  )
}
