import Link from 'next/link';

export default function PrivacyPolicyPage() {
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
          <h1 className="text-4xl font-bold text-white mb-8">Privacy Policy</h1>
          
          <div className="space-y-8 text-gray-300">
            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">1. Introduction</h2>
              <p className="mb-4">
                At picluxe ("we," "our," or "us"), we are committed to protecting your privacy and personal information. This Privacy Policy explains how we collect, use, and safeguard your data when you use our AI-powered image upscaling service.
              </p>
              <p className="mb-4">
                picluxe is operated by Upscaloro Technologies Inc., registered at 123 AI Avenue, San Francisco, CA 94107, United States.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">2. Information Collected</h2>
              <div className="space-y-4">
                <h3 className="text-xl font-medium text-white">2.1 Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name and email address</li>
                  <li>Billing information and payment details</li>
                  <li>Account credentials</li>
                  <li>Communication preferences</li>
                </ul>

                <h3 className="text-xl font-medium text-white">2.2 Non-Personal Information</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>IP addresses and device identifiers</li>
                  <li>Browser type and version</li>
                  <li>Operating system information</li>
                  <li>Device specifications</li>
                </ul>

                <h3 className="text-xl font-medium text-white">2.3 Usage Data</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Service usage statistics</li>
                  <li>Feature interaction data</li>
                  <li>Performance metrics</li>
                  <li>Error logs and crash reports</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">3. How Data is Collected</h2>
              <div className="space-y-4">
                <p>We collect information through:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Direct user input during registration and service use</li>
                  <li>Automated tracking via cookies and similar technologies</li>
                  <li>Third-party services (payment processors, analytics providers)</li>
                  <li>API integrations and platform interactions</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">4. Purpose of Data Collection</h2>
              <div className="space-y-4">
                <ul className="list-disc pl-6 space-y-2">
                  <li>To provide and maintain our Service</li>
                  <li>To process your transactions and manage your account</li>
                  <li>To improve our Service based on usage patterns</li>
                  <li>To send you important updates and marketing communications</li>
                  <li>To detect and prevent fraud or abuse</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">5. Legal Basis for Processing</h2>
              <div className="space-y-4">
                <p>We process your data based on:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your consent (e.g., for marketing communications)</li>
                  <li>Contractual necessity (to provide our services)</li>
                  <li>Legal obligations (tax and regulatory requirements)</li>
                  <li>Legitimate interests (service improvement and security)</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">6. Data Sharing and Disclosure</h2>
              <div className="space-y-4">
                <p>We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Service providers (hosting, payment processing)</li>
                  <li>Analytics and monitoring services</li>
                  <li>Legal authorities when required by law</li>
                  <li>Business partners during corporate transactions</li>
                </ul>
                <p>
                  For more details about our third-party service providers, please review our{' '}
                  <Link href="/terms" className="text-orange-400 hover:text-orange-300">
                    Terms of Service
                  </Link>.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">7. Data Retention</h2>
              <div className="space-y-4">
                <p>We retain your data for as long as:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your account remains active</li>
                  <li>Necessary to provide our services</li>
                  <li>Required by law</li>
                  <li>Needed for legitimate business purposes</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">8. User Rights</h2>
              <div className="space-y-4">
                <p>You have the right to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate data</li>
                  <li>Request data deletion</li>
                  <li>Object to data processing</li>
                  <li>Export your data</li>
                  <li>Withdraw consent</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">9. Data Security</h2>
              <div className="space-y-4">
                <p>We protect your data through:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>End-to-end encryption</li>
                  <li>Regular security audits</li>
                  <li>Access controls and authentication</li>
                  <li>Secure data centers</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">10. Cookies and Tracking</h2>
              <div className="space-y-4">
                <p>We use cookies for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Essential service functionality</li>
                  <li>Performance monitoring</li>
                  <li>User preference storage</li>
                  <li>Analytics and improvements</li>
                </ul>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">11. International Transfers</h2>
              <p className="mb-4">
                Your data may be transferred to and processed in countries outside your residence. We ensure appropriate safeguards through:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Standard Contractual Clauses (SCCs)</li>
                <li>Data Processing Agreements</li>
                <li>Privacy Shield certification (where applicable)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">12. Children's Privacy</h2>
              <p className="mb-4">
                Our Service is not intended for users under 16 years of age. We do not knowingly collect personal information from children. If you believe we have collected data from a child, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">13. Changes to Privacy Policy</h2>
              <p className="mb-4">
                We may update this Privacy Policy periodically. We will notify you of any material changes through:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Email notifications</li>
                <li>Service announcements</li>
                <li>Website notifications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-white mb-4">14. Contact Information</h2>
              <p className="mb-4">
                For privacy-related inquiries or to exercise your rights, please contact us:
              </p>
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
                <p className="mb-2">Data Protection Officer</p>
                <p className="mb-2">Email: <a href="mailto:privacy@upscaloro.com" className="text-orange-400 hover:text-orange-300">privacy@upscaloro.com</a></p>
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