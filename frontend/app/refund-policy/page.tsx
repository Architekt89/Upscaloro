import Link from 'next/link';

export default function RefundPolicyPage() {
  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-gray-950 to-black">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-orange-500/5 rounded-full blur-[150px]"></div>
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px]"></div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-10">
        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-gray-800/50 shadow-xl">
          <h1 className="text-4xl font-bold text-white mb-8">Refund Policy</h1>
          
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Overview</h2>
              <p className="mb-4">
                We want you to be completely satisfied with our services. This refund policy outlines when and how you can request a refund for your Upscaloro subscription or purchases.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Eligibility for Refunds</h2>
              <div className="space-y-4">
                <p>You may be eligible for a refund in the following cases:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Technical issues preventing service usage within the first 24 hours of purchase</li>
                  <li>Duplicate charges or billing errors</li>
                  <li>Cancellation of Pro subscription within 14 days of initial purchase</li>
                  <li>Unused API credits within 30 days of purchase</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. Non-Refundable Items</h2>
              <div className="space-y-4">
                <p>The following items are non-refundable:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Used API credits or processed images</li>
                  <li>Subscription fees after the 14-day cooling-off period</li>
                  <li>Custom enterprise solutions after deployment</li>
                  <li>Partial months of service usage</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. How to Request a Refund</h2>
              <div className="space-y-4">
                <p>To request a refund:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Contact our support team through the <Link href="/contact" className="text-orange-400 hover:text-orange-300">contact form</Link></li>
                  <li>Provide your order number or subscription details</li>
                  <li>Explain the reason for your refund request</li>
                  <li>Include any relevant screenshots or documentation</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Processing Time</h2>
              <p className="mb-4">
                Refund requests are typically processed within 5-7 business days. Once approved, please allow 5-10 business days for the refund to appear in your account, depending on your payment method and financial institution.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Contact Us</h2>
              <p className="mb-4">
                If you have any questions about our refund policy, please contact our support team:
              </p>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <p className="mb-2">Email: <a href="mailto:support@upscaloro.com" className="text-orange-400 hover:text-orange-300">support@upscaloro.com</a></p>
                <p>Phone: +1 (555) 123-4567</p>
              </div>
            </section>

            <section>
              <p className="text-sm text-gray-400 mt-8">
                Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 