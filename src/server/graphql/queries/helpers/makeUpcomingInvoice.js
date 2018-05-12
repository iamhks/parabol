import {UPCOMING} from 'universal/utils/constants'
import stripe from 'server/billing/stripe'
import {fromEpochSeconds} from 'server/utils/epochTime'
import getUpcomingInvoiceId from 'server/utils/getUpcomingInvoiceId'

export default async function makeUpcomingInvoice (orgId, stripeId, stripeSubscriptionId) {
  if (!stripeId || !stripeSubscriptionId) return undefined
  let stripeInvoice
  try {
    stripeInvoice = await stripe.invoices.retrieveUpcoming(stripeId, {
      subscription: stripeSubscriptionId
    })
  } catch (e) {
    // useful for debugging prod accounts in dev
    return undefined
  }
  return {
    id: getUpcomingInvoiceId(orgId),
    amountDue: stripeInvoice.amount_due,
    total: stripeInvoice.total,
    endAt: fromEpochSeconds(stripeInvoice.period_end),
    invoiceDate: fromEpochSeconds(stripeInvoice.date),
    orgId,
    startAt: fromEpochSeconds(stripeInvoice.period_start),
    startingBalance: stripeInvoice.startingBalance,
    status: UPCOMING
  }
}
