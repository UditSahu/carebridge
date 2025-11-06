import SectionHeader from "@/components/SectionHeader";

const Terms = () => {
  return (
    <div className="w-full min-h-[calc(100vh-4rem)]">
      <div className="max-w-container mx-auto px-6 py-12">
        <SectionHeader title="Terms of Service" description="Last updated: January 2025" />

        <div className="bg-surface border-2 border-border p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using CareBridge, you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to these terms, please do not use
              our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Service Description</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              CareBridge provides mental health support resources, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>AI-powered chatbot for mental health information</li>
              <li>Connection to licensed mental health professionals</li>
              <li>Curated educational resources</li>
              <li>Anonymous peer support community</li>
              <li>Crisis resource directory</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Not Medical Advice</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">IMPORTANT:</strong> CareBridge is not a
              substitute for professional medical advice, diagnosis, or treatment. Our AI tools and
              resources are designed to provide information and support, but they cannot replace
              the expertise of a licensed mental health professional. Always seek the advice of a
              qualified health provider with any questions you may have regarding a medical
              condition.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Emergency Situations</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are experiencing a mental health crisis or emergency, do not rely solely on
              CareBridge. Call 988 (Suicide & Crisis Lifeline), 911, or go to your nearest
              emergency room immediately.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. User Responsibilities</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              You agree to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground space-y-2 ml-4">
              <li>Provide accurate information when using our services</li>
              <li>Maintain the confidentiality of your account</li>
              <li>Use the service in compliance with all applicable laws</li>
              <li>Respect other users in community spaces</li>
              <li>Not misuse or attempt to circumvent our security measures</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Content Moderation</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to remove content or suspend accounts that violate our community
              guidelines, including content that is harmful, abusive, or promotes self-harm.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              CareBridge and its affiliates shall not be liable for any indirect, incidental,
              special, consequential, or punitive damages resulting from your use or inability to
              use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Changes to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may modify these terms at any time. Continued use of the service after changes
              constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact Information</h2>
            <p className="text-muted-foreground leading-relaxed">
              For questions about these Terms of Service, please contact us at legal@carebridge.com
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Terms;
