import Link from 'next/link';

export default function TermsPage() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Terms of Service</h1>
          
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Acceptance of Terms</h2>
              <p className="mb-4">
                By accessing and using picluxe ("the Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Description of Service</h2>
              <p className="mb-4">
                picluxe provides AI-powered image upscaling services through its web interface and API. The Service includes:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Image upscaling and enhancement</li>
                <li>Multiple AI models for different use cases</li>
                <li>API access for developers</li>
                <li>Cloud storage for processed images</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. User Accounts</h2>
              <div className="space-y-4">
                <p>By creating an account, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate and complete information</li>
                  <li>Maintain the security of your account credentials</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of any unauthorized access</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Subscription and Payments</h2>
              <div className="space-y-4">
                <p>
                  Subscription terms and payment details are outlined in our pricing page. For refund information, please refer to our{' '}
                  <Link href="/refund-policy" className="text-orange-400 hover:text-orange-300">
                    Refund Policy
                  </Link>.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Subscriptions are billed in advance on a monthly or annual basis</li>
                  <li>You may cancel your subscription at any time</li>
                  <li>Some features require a paid subscription</li>
                  <li>Enterprise pricing is available upon request</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Acceptable Use</h2>
              <div className="space-y-4">
                <p>You agree not to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Upload content that infringes on intellectual property rights</li>
                  <li>Use the Service for illegal purposes</li>
                  <li>Attempt to circumvent any service limitations</li>
                  <li>Share your account credentials with others</li>
                  <li>Reverse engineer or decompile the Service</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Intellectual Property</h2>
              <div className="space-y-4">
                <p>
                  You retain all rights to your original content. By using the Service, you grant us a license to process and store your images as necessary to provide the Service.
                </p>
                <p>
                  The Service, including its original content and features, is owned by picluxe and is protected by international copyright, trademark, and other intellectual property laws.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Privacy and Data Protection</h2>
              <p className="mb-4">
                Your privacy is important to us. Our use of your personal information is governed by our{' '}
                <Link href="/privacy-policy" className="text-orange-400 hover:text-orange-300">
                  Privacy Policy
                </Link>.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. Limitation of Liability</h2>
              <p className="mb-4">
                The Service is provided "as is" without warranties of any kind. We are not liable for any damages arising from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Changes to Terms</h2>
              <p className="mb-4">
                We reserve the right to modify these terms at any time. We will notify users of any material changes via email or through the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Contact Information</h2>
              <p className="mb-4">
                For questions about these Terms, please contact us:
              </p>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <p className="mb-2">Email: <a href="mailto:legal@upscaloro.com" className="text-orange-400 hover:text-orange-300">legal@upscaloro.com</a></p>
                <p className="mb-2">
                  Contact Form: <Link href="/contact" className="text-orange-400 hover:text-orange-300">Contact Us</Link>
                </p>
                <p>Address: 123 AI Avenue, San Francisco, CA 94107, United States</p>
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