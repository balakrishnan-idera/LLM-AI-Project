import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { GitBranch } from "lucide-react";

interface SideNavProps {
  activeItem: string;
  onItemClick: (item: string) => void;
}

const SideNav = ({ activeItem, onItemClick }: SideNavProps) => {
  const navItems = [
    {
      id: "relationships",
      label: "Relationships",
      icon: GitBranch
    }
  ];

  return (
    <nav className="w-64 bg-card border-r border-border p-4">
      <div className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Button
              key={item.id}
              variant={activeItem === item.id ? "default" : "ghost"}
              className={cn(
                "w-full justify-start",
                activeItem === item.id && "bg-primary text-primary-foreground"
              )}
              onClick={() => onItemClick(item.id)}
            >
              <Icon className="mr-2 h-4 w-4" />
              {item.label}
            </Button>
          );
        })}
      </div>
    </nav>
  );
};

export default SideNav;