import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import SideNav from "@/components/SideNav";
import RelationshipTabs from "@/components/RelationshipTabs";
import { Database, Edit, Trash2, ArrowLeft } from "lucide-react";
import axios from 'axios';


// Define TypeScript interface for term data
interface Term {
  id: string;
  name: string;
  definition: string;
  abbreviations: string;
  additional_notes: string;
  aliases: string;
  key: string;
  parent_glossary: string;
  related_glossaries: string;
  status: string;
  stewards: string;
  term_entity_type: string;
  text: string;
}
// Mock data - in real app this would come from API


const TermDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState("overview");
  const [term, setTerm] = useState<Term | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchTerm = async () => {
      if (!id) {
        setError("No term ID provided");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8000/api/vectors/${id}`);
        setTerm(response.data); // Assuming the API returns the term object directly
      } catch (err) {
        console.error("Fetch term error:", err);
        setError(err instanceof Error ? err.message : "An error occurred while fetching the term.");
      } finally {
        setLoading(false);
      }
    };

    fetchTerm();
  }, [id]);

  

  const handleEdit = () => {
    console.log("Edit Term:", id);
    // In real app, this would open an edit modal or navigate to edit page
  };

  const handleDelete = async () => {
    if (!id || !window.confirm(`Are you sure you want to delete the term with ID: ${id}?`)) {
      return;
    }
    try {
      await axios.delete(`http://localhost:8000/api/vectors/delete/${id}`);
      alert("Term deleted successfully!");
      navigate("/terms"); // Navigate back to terms list after deletion
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "An error occurred while deleting the term.");
    }
  };
if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-muted-foreground">Loading term details...</p>
        </div>
      </div>
    );
  }

  if (error || !term) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">{error || "Term Not Found"}</h1>
          <Button onClick={() => navigate("/terms")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Terms
          </Button>
        </div>
      </div>
    );
  }
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
                  <h1 className="text-xl font-bold">{term.name}</h1>
                  {/* <p className="text-sm text-muted-foreground">Term ID: {term.id}</p> */}
                  <p className="text-sm text-muted-foreground">{term.definition}</p>
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
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Name</h3>
                  <p className="text-muted-foreground">{term.name}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Definition</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {term.definition || "No definition available"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Identifier</h3>
                  <p className="text-muted-foreground font-mono bg-muted/50 px-2 py-1 rounded inline-block">
                    {term.id}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Abbreviations</h3>
                  <p className="text-muted-foreground">{term.abbreviations || "None"}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Additional Notes</h3>
                  <p className="text-muted-foreground">{term.additional_notes || "None"}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Aliases</h3>
                  <p className="text-muted-foreground">{term.aliases || "None"}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Key</h3>
                  <p className="text-muted-foreground">{term.key || "None"}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Parent Glossary</h3>
                  <p className="text-muted-foreground">{term.parent_glossary || "None"}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Related Glossaries</h3>
                  <p className="text-muted-foreground">{term.related_glossaries || "None"}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Status</h3>
                  <p className="text-muted-foreground">{term.status || "None"}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Stewards</h3>
                  <p className="text-muted-foreground">{term.stewards || "None"}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Term Entity Type</h3>
                  <p className="text-muted-foreground">{term.term_entity_type || "None"}</p>
                </div>
                <div>
                  <h3 className="font-medium mb-2">Text</h3>
                  <p className="text-muted-foreground">{term.text || "None"}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeView === "relationships" && (
            <RelationshipTabs
              entityType="Term"
              entityId={term.id}
              name={term.name}
              definition={term.definition}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default TermDetailPage;