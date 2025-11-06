import SectionHeader from "@/components/SectionHeader";

const Privacy = () => {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)]">
      <div className="max-w-container mx-auto px-6 py-12">
        <SectionHeader title="Privacy Policy" description="Last updated: January 2025" />

        <div className="bg-surface border-2 border-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We collect information that you provide directly to us, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Account information (email, username)</li>
              <li>Chat conversations and session data</li>
              <li>Questionnaire responses and preferences</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide personalized mental health support and resources</li>
              <li>Improve our AI models and service quality</li>
              <li>Communicate with you about your account and our services</li>
              <li>Ensure safety and prevent misuse of our platform</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We implement industry-standard security measures to protect your data, including
              encryption in transit and at rest, secure data storage, and regular security audits.
              We are HIPAA-compliant and follow best practices for handling sensitive health
              information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do not sell your personal information. We may share your data only in the
              following circumstances:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4 mt-4">
              <li>With your explicit consent</li>
              <li>To comply with legal obligations</li>
              <li>With service providers who assist in operating our platform (under strict confidentiality agreements)</li>
              <li>In anonymized, aggregated form for research purposes</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Access your personal data</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of certain data collection</li>
              <li>Export your data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have questions about this Privacy Policy or our data practices, please contact
              us at privacy@carebridge.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
