import { Sparkles } from "lucide-react";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-background border-t pt-16 pb-8 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center hover-scale shadow-soft">
                <Sparkles className="text-primary-foreground w-5 h-5 animate-pulse-glow" />
              </div>
              <span className="text-2xl font-bold text-foreground">
                Tech Ora
              </span>
            </div>
            <p className="text-muted-foreground mb-6">
              Your trusted tech partner in Nepal
            </p>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4 text-lg">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/products"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Products
                </Link>
              </li>
              <li>
                <Link
                  href="/categories"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Categories
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4 text-lg">
              Customer Service
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Shipping Info
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-muted-foreground hover:text-primary transition-all duration-300 hover:translate-x-1 inline-block"
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-foreground font-semibold mb-4 text-lg">Contact Info</h3>
            <ul className="space-y-2 text-muted-foreground">
              <li>Phone: +9779808308797</li>
              <li>Email: techorabytivra@gmail.com</li>
              <li>Address: Bafal Kathmandu, Nepal</li>
              <li>Hours: 10AM - 8PM</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/50 mt-12 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            &copy; 2025 Tech Ora. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
