import SectionHeader from "@/components/SectionHeader";
import { Shield, Heart, Users, Lightbulb } from "lucide-react";

const About = () => {
  const values = [
    {
      icon: Shield,
      title: "Privacy & Safety",
      description:
        "Your data is encrypted and never shared. All conversations are confidential and HIPAA-compliant.",
    },
    {
      icon: Heart,
      title: "Evidence-Based Care",
      description:
        "Our resources and AI are built on peer-reviewed research and clinical best practices.",
    },
    {
      icon: Users,
      title: "Human-Centered",
      description:
        "Technology supports, not replaces, human connection. Professional help is always available.",
    },
    {
      icon: Lightbulb,
      title: "Accessible Support",
      description:
        "Mental health care should be available to everyone, anytime, without barriers.",
    },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)]">
      <div className="max-w-container mx-auto px-6 py-12">
        <SectionHeader
          label="Our Mission"
          title="Making Mental Health Support Accessible"
          description="CareBridge combines evidence-based practices with modern technology to provide immediate, compassionate mental health support"
        />

        {/* Mission Statement */}
        <div className="bg-surface border-2 border-border p-12 mb-12">
          <p className="text-lg text-foreground leading-relaxed mb-6">
            We believe everyone deserves access to quality mental health support, regardless of
            time, location, or financial constraints. CareBridge was created to bridge the gap
            between those seeking help and the resources available to them.
          </p>
          <p className="text-lg text-foreground leading-relaxed">
            Our platform combines AI-powered tools with connections to licensed professionals,
            creating a comprehensive ecosystem of support that meets people where they are in their
            mental health journey.
          </p>
        </div>

        {/* Values Grid */}
        <div className="mb-12">
          <h3 className="text-2xl font-semibold text-foreground mb-8">Our Values</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-1 bg-border">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="bg-background p-8">
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h4 className="text-xl font-semibold text-foreground mb-3">{value.title}</h4>
                  <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Important Disclaimer */}
        <div className="bg-warning/10 border-2 border-warning p-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">Important Information</h3>
          <div className="space-y-4 text-foreground">
            <p>
              <strong>Not a Substitute for Professional Care:</strong> CareBridge is designed to
              provide support and resources, but it is not a replacement for professional medical
              advice, diagnosis, or treatment.
            </p>
            <p>
              <strong>In Case of Emergency:</strong> If you are experiencing a mental health
              crisis or are in immediate danger, please call 988 (Suicide & Crisis Lifeline) or
              911, or visit your nearest emergency room.
            </p>
            <p>
              <strong>AI Limitations:</strong> Our AI chatbot and voice counselor are tools to
              provide information and support based on evidence-based practices, but they cannot
              replace the expertise of a licensed mental health professional.
            </p>
            <p>
              <strong>Privacy:</strong> We take your privacy seriously and comply with all
              applicable regulations including HIPAA. Your conversations and data are encrypted and
              confidential.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
