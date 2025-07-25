import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Database, Brain, Network } from "lucide-react";

const NavBar = () => {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Database className="h-8 w-8 text-primary" />
                <Brain className="h-4 w-4 text-accent absolute -top-1 -right-1" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                DataModel AI
              </span>
            </div>
          </Link>

          <div className="flex items-center space-x-6">
            <Link to="/erobjects">
              <Button 
                variant={isActive("/erobjects") ? "default" : "ghost"}
                className="flex items-center space-x-2"
              >
                <Network className="h-4 w-4" />
                <span>ERObjects</span>
              </Button>
            </Link>
            
            <Link to="/terms">
              <Button 
                variant={isActive("/terms") ? "default" : "ghost"}
                className="flex items-center space-x-2"
              >
                <Database className="h-4 w-4" />
                <span>Terms</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;