import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import SearchBar from "@/components/SearchBar";
import SearchValue from "@/components/ui/search-value"
import { Link, Unlink, Brain, Star } from "lucide-react";
import axios from "axios";

const API_BASE = "http://localhost:8000";
// Mock data for terms
const mockAllTerms = [
  { id: "term1", name: "Customer ID", description: "Unique identifier for customer records" },
  { id: "term2", name: "Order Date", description: "Timestamp indicating when an order was placed" },
  { id: "term3", name: "Product SKU", description: "Stock Keeping Unit identifier for products" },
  { id: "term4", name: "Payment Status", description: "Enumerated field indicating transaction state" },
  { id: "term5", name: "Shipping Method", description: "Delivery option selected by customer" },
  { id: "term6", name: "Tax Rate", description: "Decimal percentage applied to order total" },
  { id: "term7", name: "Inventory Count", description: "Current available quantity for products" },
  { id: "term8", name: "Credit Score", description: "Numerical assessment of customer creditworthiness" }
];

// Mock related terms (for demonstration)
const mockRelatedTerms = ["term1", "term2", "term3"];

// Mock AI recommendations
// const mockAiRecommendations = [
//   { id: "term4", score: 0.92, reason: "Payment information commonly associated with customer entities" },
//   { id: "term6", score: 0.87, reason: "Tax calculations required for customer transactions" },
//   { id: "term8", score: 0.73, reason: "Credit scoring often linked to customer profiles" }
// ];

interface RelationshipTabsProps {
  entityType: "ERObject" | "Term";
  entityId: string;
  name: string
}

interface SearchRequest {
  query: string
}

const RelationshipTabs = ({ entityType, entityId, name }: RelationshipTabsProps) => {

  const [relatedSearchTerm, setRelatedSearchTerm] = useState("");
  const [unrelatedSearchTerm, setUnrelatedSearchTerm] = useState("");
  // const [showRecommendations, setShowRecommendations] = useState(false);
  const [activeTab, setActiveTab] = useState("related");
  const [aiRecommended, setAIRecommended] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {

    const request: SearchRequest = { query: name }

    setLoading(true); // 🔹 start loading
    console.log(loading);
    const res = axios.post(`${API_BASE}/api/search`, request, {
      headers: { "Content-Type": "application/json" },
    }).then(res => setAIRecommended(res.data.results))
      .catch(err => console.error(err))
      .finally(() => {
        setLoading(false);
      });
    // console.log(name);
    // if (name != null && name.length > 0) {
    //   const res = fetch("http://localhost:8000/api/search", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({ "text": name,
    //     top_k: 4 })
    //   }).then(res => res.json())
    //     .then(data => console.log(data))
    //     .catch(err => console.error(err));

    //   console.log(res);
    // }
  }, []);

  const relatedTerms = mockAllTerms.filter(term => mockRelatedTerms.includes(term.id));
  // const unrelatedTerms = aiRecommended;

  const filteredRelatedTerms = relatedTerms?.filter((term) => {
    if (!relatedSearchTerm) return true; // show all if empty
    return term?.name?.toLowerCase().includes(relatedSearchTerm.toLowerCase()) ||
      term?.description?.toLowerCase().includes(relatedSearchTerm.toLowerCase());
  });

  // const filteredUnrelatedTerms = aiRecommended.filter(term =>
  //   term.name.toLowerCase().includes(unrelatedSearchTerm.toLowerCase()) ||
  //   term.description.toLowerCase().includes(unrelatedSearchTerm.toLowerCase())
  // );

  // const aiRecommendedTerms = showRecommendations 
  //   ? filteredUnrelatedTerms.filter(term => 
  //       mockAiRecommendations.some(rec => rec.id === term.id)
  //     ).sort((a, b) => {
  //       const aRec = mockAiRecommendations.find(rec => rec.id === a.id);
  //       const bRec = mockAiRecommendations.find(rec => rec.id === b.id);
  //       return (bRec?.confidence || 0) - (aRec?.confidence || 0);
  //     })
  //   : [];

  const displayUnrelatedTerms = aiRecommended.filter(term => {
    if (!unrelatedSearchTerm) return true;
    return term?.name?.toLowerCase().includes(unrelatedSearchTerm.toLowerCase()) ||
      term?.description?.toLowerCase().includes(unrelatedSearchTerm.toLowerCase())
  }
  );

  const handleUnrelate = (termId: string) => {
    console.log(`Unrelating term ${termId} from ${entityType} ${entityId}`);
    // In real app, this would make an API call
  };

  const handleRelate = (termId: string) => {
    console.log(`Relating term ${termId} to ${entityType} ${entityId}`);
    // In real app, this would make an API call
  };

  // const getRecommendationData = (termId: string) => {
  //   return mockAiRecommendations.find(rec => rec.id === termId);
  // };

  return (
    <div className="w-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="related" className="flex items-center space-x-2">
            <Link className="h-4 w-4" />
            <span>Related Terms</span>
          </TabsTrigger>
          <TabsTrigger value="unrelated" className="flex items-center space-x-2">
            <Brain className="h-4 w-4 text-accent" />
            <span>AI Recommendation</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="related" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Link className="h-5 w-5" />
                <span>Currently Related Terms</span>
                <Badge variant="secondary">{relatedTerms.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <SearchBar
                value={relatedSearchTerm}
                onChange={setRelatedSearchTerm}
                placeholder="Search related terms..."
              />

              <div className="space-y-3">
                {filteredRelatedTerms.map((term) => (
                  <div key={term.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-muted/30">
                    <div className="flex-1">
                      <h4 className="font-medium">{term.name}</h4>
                      <p className="text-sm text-muted-foreground">{term.description}</p>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUnrelate(term.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Unlink className="h-4 w-4 mr-1" />
                      Unrelate
                    </Button>
                  </div>
                ))}

                {filteredRelatedTerms.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Link className="h-8 w-8 mx-auto mb-2" />
                    <p>No related terms found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="unrelated" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center space-x-2">
                  <Unlink className="h-5 w-5" />
                  <span>Available Terms to Relate</span>
                  <Badge variant="secondary">{aiRecommended.length}</Badge>
                </CardTitle>
                {/* <div className="flex items-center space-x-2">
                  <Checkbox
                    id="show-recommendations"
                    checked={showRecommendations}
                    onCheckedChange={(checked) => setShowRecommendations(checked === true)}
                  />
                  <label htmlFor="show-recommendations" className="text-sm font-medium flex items-center space-x-1">
                    <Brain className="h-4 w-4 text-accent" />
                    <span>Show AI Recommendations</span>
                  </label>
                </div> */}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <SearchBar
                value={unrelatedSearchTerm}
                onChange={setUnrelatedSearchTerm}
                placeholder="Search available terms..."
              />

              {/* {showRecommendations && aiRecommendedTerms.length > 0 && (
                <div className="bg-accent/10 border border-accent/20 rounded-lg p-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <Brain className="h-4 w-4 text-accent" />
                    <span className="text-sm font-medium">AI Recommendations</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Terms are sorted by confidence score based on ML analysis
                  </p>
                </div>
              )} */}
              {loading ? (
                <div className="flex items-center justify-center p-4">
                  {/* Tailwind spinner example */}
                  <svg
                    className="animate-spin h-6 w-6 text-blue-500"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                    ></path>
                  </svg>
                  <span className="ml-2">Loading...</span>
                </div>
              ) : (
                <div className="space-y-3">
                  {displayUnrelatedTerms.map((term) => {
                    // const recommendation = getRecommendationData(term.id);
                    return (
                      <div key={term.id} className="flex items-center justify-between p-3 border border-border rounded-lg bg-card">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium">{term.name}</h4>
                            {term.aliases && term.aliases.toLowerCase() !== "nan" && (
                            <p className="text-sm text-muted-foreground">Aliases: ({term.aliases})</p>
                            )}
                            <div className="flex items-center space-x-1">
                              <Star className="h-4 w-4 text-warning fill-current" />
                              <Badge variant="outline" className="text-xs">
                                {Math.round(term.score * 100)}% confidence
                              </Badge>
                            </div>
                          </div>
                          {term.definition && term.definition.toLowerCase() !== "nan" && (
                          <p className="text-sm text-muted-foreground">{term.definition}</p>
                          )}
                          {term.definition && term.definition.toLowerCase() == "nan" && (
                          <p className="text-sm text-muted-foreground">Definition not available</p>
                          )}
                          <p className="text-xs text-accent mt-1">{term.reason}</p>

                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleRelate(term.id)}
                          className="bg-primary hover:bg-primary/90"
                        >
                          <Link className="h-4 w-4 mr-1" />
                          Relate
                        </Button>
                      </div>
                    );
                  })}

                  {displayUnrelatedTerms.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Unlink className="h-8 w-8 mx-auto mb-2" />
                      <p>"No AI recommendations available"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RelationshipTabs;