import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import { Network, Eye, Edit, Trash2 } from "lucide-react";

// Mock data - in real app this would come from API
const mockERObjects = [
  {
    id: "er1",
    name: "Customer Entity",
    description: "Represents customer information including personal details, contact information, and account status"
  },
  {
    id: "er2", 
    name: "Order Transaction",
    description: "Core business transaction entity linking customers to products with temporal and financial attributes"
  },
  {
    id: "er3",
    name: "Product Catalog",
    description: "Product information entity containing specifications, pricing, and inventory management data"
  },
  {
    id: "er4",
    name: "Payment Method",
    description: "Financial instrument entity for processing customer transactions and billing operations"
  },
  {
    id: "er5",
    name: "Shipping Address",
    description: "Geographical location entity for order fulfillment and delivery tracking purposes"
  }
];

const ERObjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredObjects = mockERObjects.filter(obj =>
    obj.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    obj.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleObjectClick = (id: string) => {
    navigate(`/erobjects/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Network className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">ERObjects</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Entity-Relationship Objects represent the core entities in your data model. 
            Each ERObject defines business concepts with their attributes and relationships.
          </p>
        </div>

        {/* Search */}
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search ERObjects by name or description..."
          className="max-w-md"
        />

        {/* ERObjects Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredObjects.map((obj) => (
            <Card 
              key={obj.id} 
              className="group cursor-pointer border-border bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300 hover:border-primary/50"
              onClick={() => handleObjectClick(obj.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {obj.name}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                      ID: {obj.id}
                    </div>
                  </div>
                  <Network className="h-5 w-5 text-primary/70 group-hover:text-primary transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed mb-4">
                  {obj.description}
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleObjectClick(obj.id);
                    }}
                    className="flex items-center space-x-1"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-1"
                  >
                    <Edit className="h-3 w-3" />
                    <span>Edit</span>
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center space-x-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                    <span>Delete</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredObjects.length === 0 && (
          <div className="text-center py-12">
            <Network className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No ERObjects found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "No ERObjects available yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ERObjectsPage;