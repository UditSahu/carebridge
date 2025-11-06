import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/SectionHeader";
import { Phone, MapPin, ExternalLink, AlertCircle } from "lucide-react";

const Emergency = () => {
  const hotlines = [
    {
      name: "National Suicide Prevention Lifeline",
      phone: "988",
      description: "24/7 crisis support",
      location: "USA",
    },
    {
      name: "Crisis Text Line",
      phone: "Text HOME to 741741",
      description: "Text-based crisis support",
      location: "USA, Canada, UK",
    },
    {
      name: "SAMHSA National Helpline",
      phone: "1-800-662-4357",
      description: "Substance abuse and mental health",
      location: "USA",
    },
    {
      name: "Veterans Crisis Line",
      phone: "988 (Press 1)",
      description: "Support for veterans and their families",
      location: "USA",
    },
    {
      name: "The Trevor Project",
      phone: "1-866-488-7386",
      description: "LGBTQ+ youth crisis support",
      location: "USA",
    },
  ];

  const actions = [
    {
      title: "Call Emergency Services",
      description: "If you or someone else is in immediate danger",
      phone: "911",
      variant: "destructive" as const,
    },
    {
      title: "Call Crisis Hotline",
      description: "24/7 support from trained counselors",
      phone: "988",
      variant: "default" as const,
    },
    {
      title: "Find Nearest Therapist",
      description: "Connect with a local mental health professional",
      phone: null,
      variant: "secondary" as const,
    },
  ];

  return (
    <div className="w-full min-h-[calc(100vh-4rem)]">
      {/* Alert Banner */}
      <div className="w-full bg-destructive border-b-2 border-border">
        <div className="max-w-container mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-6 h-6 text-destructive-foreground flex-shrink-0" />
            <p className="text-destructive-foreground font-medium">
              If you are in immediate danger, please call emergency services (911) or go to your
              nearest emergency room.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-container mx-auto px-6 py-12">
        <SectionHeader
          label="Crisis Support"
          title="Emergency Resources"
          description="Immediate help when you need it most"
        />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
          {actions.map((action, index) => (
            <Button
              key={index}
              variant={action.variant}
              className="h-auto p-8 flex flex-col items-start gap-3"
              asChild={!!action.phone}
            >
              {action.phone ? (
                <a href={`tel:${action.phone.replace(/\D/g, "")}`}>
                  <Phone className="w-8 h-8" />
                  <div className="text-left">
                    <div className="font-semibold text-lg mb-1">{action.title}</div>
                    <div className="text-sm opacity-90 mb-2">{action.description}</div>
                    <div className="text-2xl font-bold">{action.phone}</div>
                  </div>
                </a>
              ) : (
                <div>
                  <MapPin className="w-8 h-8" />
                  <div className="text-left">
                    <div className="font-semibold text-lg mb-1">{action.title}</div>
                    <div className="text-sm opacity-90">{action.description}</div>
                  </div>
                </div>
              )}
            </Button>
          ))}
        </div>

        {/* Hotline List */}
        <div className="bg-surface border-2 border-border">
          <div className="p-6 border-b-2 border-border">
            <h3 className="text-xl font-semibold text-foreground">Crisis Hotlines</h3>
          </div>
          <div className="divide-y-2 divide-border">
            {hotlines.map((hotline, index) => (
              <div key={index} className="p-6 bg-background hover:bg-surface transition-colors">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <h4 className="text-lg font-semibold text-foreground mb-1">
                      {hotline.name}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-2">{hotline.description}</p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="w-4 h-4" />
                      <span>{hotline.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl font-semibold text-foreground">
                      {hotline.phone}
                    </span>
                    <Button
                      variant="default"
                      size="sm"
                      asChild
                    >
                      <a href={`tel:${hotline.phone.replace(/\D/g, "")}`}>
                        <Phone className="w-4 h-4 mr-2" />
                        Call Now
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 bg-muted border-2 border-border p-8">
          <h3 className="text-xl font-semibold text-foreground mb-4">Additional Resources</h3>
          <ul className="space-y-3">
            <li>
              <a
                href="https://www.samhsa.gov/find-help/national-helpline"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:underline inline-flex items-center gap-2"
              >
                SAMHSA Treatment Locator
                <ExternalLink className="w-4 h-4" />
              </a>
            </li>
            <li>
              <a
                href="https://www.nami.org/help"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:underline inline-flex items-center gap-2"
              >
                NAMI HelpLine
                <ExternalLink className="w-4 h-4" />
              </a>
            </li>
            <li>
              <a
                href="https://findtreatment.gov/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-secondary hover:underline inline-flex items-center gap-2"
              >
                FindTreatment.gov
                <ExternalLink className="w-4 h-4" />
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Emergency;
