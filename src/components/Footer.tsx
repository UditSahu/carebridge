import { Link } from "react-router-dom";
import { Input } from "./ui/input";
import { Button } from "./ui/button";

const Footer = () => {
  return (
    <footer className="w-full border-t border-border bg-surface">
      <div className="max-w-container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">CareBridge</h3>
            <p className="text-sm text-muted-foreground">
              Evidence-aware mental health support, available 24/7
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/chatbot" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Chatbot
                </Link>
              </li>
              <li>
                <Link to="/counseling" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Counseling
                </Link>
              </li>
              <li>
                <Link to="/resources" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Resources
                </Link>
              </li>
              <li>
                <Link to="/community" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Community
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/emergency" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Emergency
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Privacy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                  Terms
                </Link>
              </li>
            </ul>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-4">Stay Updated</h4>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Your email"
                className="flex-1"
              />
              <Button variant="secondary" size="sm">
                Subscribe
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} CareBridge. This platform is not a substitute for professional medical advice, diagnosis, or treatment.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
