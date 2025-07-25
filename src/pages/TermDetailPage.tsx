import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SideNav from "@/components/SideNav";
import RelationshipTabs from "@/components/RelationshipTabs";
import { Database, Edit, Trash2, ArrowLeft } from "lucide-react";

// Mock data - in real app this would come from API
const mockTerms = {
  "term1": {
    id: "term1",
    name: "Customer ID",
    description: "Unique identifier for customer records in the system, used as primary key for customer entity"
  },
  "term2": {
    id: "term2",
    name: "Order Date",
    description: "Timestamp indicating when an order was placed by the customer, stored in ISO 8601 format"
  },
  "term3": {
    id: "term3",
    name: "Product SKU",
    description: "Stock Keeping Unit identifier for product catalog items, alphanumeric format with vendor codes"
  },
  "term4": {
    id: "term4",
    name: "Payment Status",
    description: "Enumerated field indicating transaction state: pending, authorized, captured, failed, refunded"
  }
};

const TermDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");

  const term = id ? mockTerms[id as keyof typeof mockTerms] : null;

  if (!term) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Term Not Found</h1>
          <Button onClick={() => navigate("/terms")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Terms
          </Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    console.log("Edit Term:", term.id);
    // In real app, this would open an edit modal or navigate to edit page
  };

  const handleDelete = () => {
    console.log("Delete Term:", term.id);
    // In real app, this would show a confirmation dialog and delete the term
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card/50 backdrop-blur">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/terms")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <Database className="h-8 w-8 text-accent" />
                <div>
                  <h1 className="text-2xl font-bold">{term.name}</h1>
                  <p className="text-sm text-muted-foreground">Term ID: {term.id}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
              <Button variant="outline" onClick={handleDelete} className="text-destructive hover:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex">
        {/* Side Navigation */}
        <SideNav
          activeItem={activeView}
          onItemClick={setActiveView}
        />

        {/* Main Content */}
        <div className="flex-1 p-6">
          {activeView === "overview" && (
            <Card>
              <CardHeader>
                <CardTitle>Overview</CardTitle>
                <CardDescription>Detailed information about this term</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Name</h3>
                  <p className="text-muted-foreground">{term.name}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{term.description}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Identifier</h3>
                  <p className="text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded inline-block">
                    {term.id}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeView === "relationships" && (
            <RelationshipTabs
              entityType="Term"
              entityId={term.id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TermDetailPage;