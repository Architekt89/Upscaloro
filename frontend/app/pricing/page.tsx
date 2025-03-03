// Simple check icon component
function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 20 20" 
      fill="currentColor" 
      className="h-5 w-5 flex-shrink-0 text-green-500"
      {...props}
    >
      <path 
        fillRule="evenodd" 
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
        clipRule="evenodd" 
      />
    </svg>
  );
}

const tiers = [
  {
    name: 'Free',
    id: 'tier-free',
    href: '#',
    priceMonthly: '$0',
    description: 'Try out our AI upscaling technology with limited features.',
    features: [
      '3 images per month',
      'Max 2x upscaling',
      'Basic modes only',
      'No API access',
      'Standard support',
    ],
    mostPopular: false,
  },
  {
    name: 'Pro',
    id: 'tier-pro',
    href: '#',
    priceMonthly: '$9.99',
    description: 'Perfect for professionals who need high-quality image upscaling.',
    features: [
      '100 images per month',
      'Up to 16x upscaling',
      'All upscaling modes',
      'API access',
      'Priority support',
      'Advanced parameters',
      'Batch processing',
    ],
    mostPopular: true,
  },
  {
    name: 'Enterprise',
    id: 'tier-enterprise',
    href: '#',
    priceMonthly: 'Custom',
    description: 'Dedicated support and infrastructure for your organization.',
    features: [
      'Unlimited images',
      'Up to 16x upscaling',
      'All upscaling modes',
      'API access with higher rate limits',
      'Dedicated support',
      'Advanced parameters',
      'Batch processing',
      'Custom integration',
      'SLA guarantees',
    ],
    mostPopular: false,
  },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export default function PricingPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Pricing</h1>
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="p-6">
          <div className="sm:align-center sm:flex sm:flex-col">
            <h2 className="text-2xl font-bold mb-4">Pricing Plans</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-2xl">
              Choose the perfect plan for your needs. All plans include access to our AI-powered image upscaling technology.
            </p>
          </div>
          <div className="mt-12 space-y-4 sm:mt-16 sm:grid sm:grid-cols-2 sm:gap-6 sm:space-y-0 lg:mx-auto lg:max-w-4xl xl:mx-0 xl:max-w-none xl:grid-cols-3">
            {tiers.map((tier) => (
              <div
                key={tier.id}
                className={classNames(
                  tier.mostPopular
                    ? 'border-primary-500 dark:border-primary-400'
                    : 'border-gray-200 dark:border-gray-700',
                  'relative flex flex-col rounded-lg border bg-white dark:bg-gray-800 p-6 shadow-sm'
                )}
              >
                {tier.mostPopular ? (
                  <div className="absolute -top-3 left-1/2 -ml-20 inline-block transform rounded-full bg-primary-500 px-4 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                    Most popular
                  </div>
                ) : null}
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{tier.name}</h3>
                  {tier.mostPopular ? (
                    <p className="absolute top-0 -translate-y-1/2 transform rounded-full bg-primary-500 py-1.5 px-4 text-sm font-semibold text-white">
                      Most popular
                    </p>
                  ) : null}
                  <p className="mt-4 flex items-baseline text-gray-900 dark:text-white">
                    <span className="text-4xl font-bold tracking-tight">{tier.priceMonthly}</span>
                    {tier.name !== 'Enterprise' && <span className="ml-1 text-xl font-semibold">/month</span>}
                  </p>
                  <p className="mt-6 text-gray-500 dark:text-gray-400">{tier.description}</p>

                  {/* Feature list */}
                  <ul role="list" className="mt-6 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex">
                        <CheckIcon className="h-5 w-5 flex-shrink-0 text-green-500" aria-hidden="true" />
                        <span className="ml-3 text-gray-500 dark:text-gray-400">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <a
                  href={tier.href}
                  className={classNames(
                    tier.mostPopular
                      ? 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white'
                      : 'bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 hover:bg-primary-100 dark:hover:bg-primary-800 focus:ring-primary-500',
                    'mt-8 block w-full rounded-md border border-transparent px-6 py-3 text-center text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2'
                  )}
                >
                  {tier.name === 'Enterprise' ? 'Contact us' : 'Get started'}
                </a>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-700 p-6">
          <div className="mx-auto max-w-4xl">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Frequently asked questions</h2>
            <dl className="space-y-6 divide-y divide-gray-200 dark:divide-gray-600">
              <div className="pt-6">
                <dt className="text-lg font-medium text-gray-900 dark:text-white">
                  What happens if I exceed my monthly limit?
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  If you exceed your monthly limit, you'll need to upgrade to a higher tier or wait until the next billing cycle. We'll notify you when you're approaching your limit.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-lg font-medium text-gray-900 dark:text-white">
                  Can I cancel my subscription at any time?
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  Yes, you can cancel your subscription at any time. Your subscription will remain active until the end of the current billing period.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-lg font-medium text-gray-900 dark:text-white">
                  Do you offer refunds?
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  We offer a 7-day money-back guarantee for all new subscriptions. If you're not satisfied with our service, contact our support team within 7 days of your purchase.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-lg font-medium text-gray-900 dark:text-white">
                  What payment methods do you accept?
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  We accept all major credit cards, PayPal, and Apple Pay. For Enterprise plans, we also offer invoice-based payments.
                </dd>
              </div>
              <div className="pt-6">
                <dt className="text-lg font-medium text-gray-900 dark:text-white">
                  How do I get API access?
                </dt>
                <dd className="mt-2 text-base text-gray-500 dark:text-gray-400">
                  API access is available on the Pro and Enterprise plans. Once you've subscribed, you can generate an API key from your dashboard.
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
} 