import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquare, Users, BookOpen, Phone, Shield, Clock } from "lucide-react";

const Index = () => {
  const features = [
    {
      icon: MessageSquare,
      title: "RAG Chatbot",
      description: "Evidence-based responses with cited sources",
      href: "/chatbot",
    },
    {
      icon: Users,
      title: "Professional Counseling",
      description: "Connect with licensed therapists or AI voice counselor",
      href: "/counseling",
    },
    {
      icon: BookOpen,
      title: "Personalized Resources",
      description: "Curated content based on your needs",
      href: "/resources",
    },
    {
      icon: Users,
      title: "Anonymous Community",
      description: "Safe peer support space",
      href: "/community",
    },
    {
      icon: Phone,
      title: "Emergency Support",
      description: "Immediate crisis resources",
      href: "/emergency",
    },
  ];

  const trustItems = [
    { icon: Shield, text: "HIPAA-compliant and encrypted" },
    { icon: Clock, text: "Available 24/7" },
    { icon: Users, text: "Licensed professionals on staff" },
  ];

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="w-full bg-background border-b border-border">
        <div className="max-w-container mx-auto px-6 py-24">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left: Content */}
            <div>
              <h1 className="text-5xl lg:text-6xl font-semibold text-foreground mb-6 leading-tight">
                Evidence-aware support, instantly.
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Get mental health guidance backed by research, available whenever you need it. Connect with AI assistance or licensed professionals.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" variant="default">
                  <Link to="/chatbot">Start a conversation</Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link to="/resources">Explore resources</Link>
                </Button>
              </div>
              <p className="mt-6 text-sm text-muted-foreground">
                Not a substitute for professional diagnosis or treatment
              </p>
            </div>

            {/* Right: Chatbot Preview */}
            <div className="bg-surface border-2 border-border p-6">
              <div className="flex items-center gap-3 pb-4 border-b border-border">
                <div className="w-2 h-2 bg-success"></div>
                <span className="text-sm text-muted-foreground">AI Assistant Active</span>
              </div>
              <div className="mt-6 space-y-4">
                <div className="bg-muted p-4 text-sm text-foreground">
                  I'm feeling overwhelmed with work stress lately...
                </div>
                <div className="bg-primary/10 border-l-4 border-primary p-4 text-sm text-foreground">
                  I understand work stress can be challenging. Research shows that breaking tasks into smaller steps and setting boundaries can help. Would you like to explore some evidence-based coping strategies?
                  <span className="inline-block ml-2 text-xs text-secondary">[1]</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="w-full bg-surface">
        <div className="max-w-container mx-auto px-6 py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-1 bg-border">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Link
                  key={index}
                  to={feature.href}
                  className="group bg-surface p-8 hover:bg-background transition-colors"
                >
                  <Icon className="w-8 h-8 text-primary mb-4" />
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-primary transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="w-full bg-background border-y border-border">
        <div className="max-w-container mx-auto px-6 py-16">
          <h2 className="text-2xl font-semibold text-foreground mb-8">Trust & Safety</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-1 bg-border">
            {trustItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={index} className="bg-background p-6 flex items-center gap-4">
                  <Icon className="w-6 h-6 text-secondary flex-shrink-0" />
                  <span className="text-foreground">{item.text}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Band */}
      <section className="w-full bg-primary">
        <div className="max-w-container mx-auto px-6 py-12 text-center">
          <h2 className="text-2xl font-semibold text-primary-foreground mb-4">
            Not sure where to begin?
          </h2>
          <p className="text-primary-foreground/80 mb-6">
            Take the 2-minute check-in to get personalized recommendations
          </p>
          <Button asChild variant="outline" size="lg">
            <Link to="/resources">Start Assessment</Link>
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;
