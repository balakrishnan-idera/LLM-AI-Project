import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SideNav from "@/components/SideNav";
import RelationshipTabs from "@/components/RelationshipTabs";
import { Network, Edit, Trash2, ArrowLeft } from "lucide-react";

// Mock data - in real app this would come from API
const mockERObjects = {
  "er1": {
    id: "er1",
    name: "Customer Entity",
    description: "Represents customer information including personal details, contact information, and account status in the business domain model"
  },
  "er2": {
    id: "er2", 
    name: "Order Transaction",
    description: "Core business transaction entity linking customers to products with temporal and financial attributes"
  },
  "er3": {
    id: "er3",
    name: "Product Catalog",
    description: "Product information entity containing specifications, pricing, and inventory management data"
  }
};

const ERObjectDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");

  const erObject = id ? mockERObjects[id as keyof typeof mockERObjects] : null;

  if (!erObject) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">ERObject Not Found</h1>
          <Button onClick={() => navigate("/erobjects")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to ERObjects
          </Button>
        </div>
      </div>
    );
  }

  const handleEdit = () => {
    console.log("Edit ERObject:", erObject.id);
    // In real app, this would open an edit modal or navigate to edit page
  };

  const handleDelete = () => {
    console.log("Delete ERObject:", erObject.id);
    // In real app, this would show a confirmation dialog and delete the object
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
                onClick={() => navigate("/erobjects")}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>Back</span>
              </Button>
              
              <div className="flex items-center space-x-3">
                <Network className="h-8 w-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold">{erObject.name}</h1>
                  <p className="text-sm text-muted-foreground">ERObject ID: {erObject.id}</p>
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
                <CardDescription>Detailed information about this ERObject</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Name</h3>
                  <p className="text-muted-foreground">{erObject.name}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Description</h3>
                  <p className="text-muted-foreground leading-relaxed">{erObject.description}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Identifier</h3>
                  <p className="text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded inline-block">
                    {erObject.id}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeView === "relationships" && (
            <RelationshipTabs
              entityType="ERObject"
              entityId={erObject.id}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ERObjectDetailPage;