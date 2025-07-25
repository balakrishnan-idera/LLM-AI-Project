import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import { Database, Eye, Edit, Trash2 } from "lucide-react";

// Mock data - in real app this would come from API
const mockTerms = [
  {
    id: "term1",
    name: "Customer ID",
    description: "Unique identifier for customer records in the system, used as primary key for customer entity"
  },
  {
    id: "term2",
    name: "Order Date",
    description: "Timestamp indicating when an order was placed by the customer, stored in ISO 8601 format"
  },
  {
    id: "term3",
    name: "Product SKU",
    description: "Stock Keeping Unit identifier for product catalog items, alphanumeric format with vendor codes"
  },
  {
    id: "term4",
    name: "Payment Status",
    description: "Enumerated field indicating transaction state: pending, authorized, captured, failed, refunded"
  },
  {
    id: "term5",
    name: "Shipping Method",
    description: "Delivery option selected by customer: standard, expedited, overnight, pickup, digital delivery"
  },
  {
    id: "term6",
    name: "Tax Rate",
    description: "Decimal percentage applied to order total based on shipping address and local tax regulations"
  },
  {
    id: "term7",
    name: "Inventory Count",
    description: "Current available quantity for product items, updated in real-time with order processing"
  },
  {
    id: "term8",
    name: "Credit Score",
    description: "Numerical assessment of customer creditworthiness, range 300-850, used for payment validation"
  }
];

const TermsPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const filteredTerms = mockTerms.filter(term =>
    term.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    term.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTermClick = (id: string) => {
    navigate(`/terms/${id}`);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <Database className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Terms</h1>
          </div>
          <p className="text-muted-foreground max-w-2xl">
            Terms define the specific attributes, fields, and data elements that comprise your ERObjects. 
            Each term represents a discrete piece of information with defined meaning and constraints.
          </p>
        </div>

        {/* Search */}
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search terms by name or description..."
          className="max-w-md"
        />

        {/* Terms Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTerms.map((term) => (
            <Card 
              key={term.id} 
              className="group cursor-pointer border-border bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300 hover:border-primary/50"
              onClick={() => handleTermClick(term.id)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <CardTitle className="text-lg group-hover:text-primary transition-colors">
                      {term.name}
                    </CardTitle>
                    <div className="text-xs text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded">
                      ID: {term.id}
                    </div>
                  </div>
                  <Database className="h-5 w-5 text-accent/70 group-hover:text-accent transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm leading-relaxed mb-4">
                  {term.description}
                </CardDescription>
                <div className="flex items-center space-x-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleTermClick(term.id);
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

        {filteredTerms.length === 0 && (
          <div className="text-center py-12">
            <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Terms found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? "Try adjusting your search terms" : "No terms available yet"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TermsPage;