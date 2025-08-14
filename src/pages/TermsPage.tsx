import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import SearchBar from "@/components/SearchBar";
import UploadCsv from "@/components/ui/upload-csv";
import { Database, Eye, Edit, Trash2 } from "lucide-react";
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

const TermsPage = () => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [termsData, setTermsData] = useState<Term[]>([]);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true); // Add loading state
  const navigate = useNavigate();



useEffect(() => {
    const fetchTerms = async () => {
      try {
        setLoading(true);
        const response = await axios.get("http://localhost:8000/api/fetch-term");
        setTermsData(response.data.results);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "An error occurred while fetching terms.");
      } finally {
        setLoading(false);
      }
    };

    fetchTerms();
  }, []); // Empty dependency array ensures this runs only on mount

 // Handle term deletion
  const handleDelete = async (id: string) => {
    // Optional: Add confirmation prompt
    if (!window.confirm(`Are you sure you want to delete the term with ID: ${id}?`)) {
      return;
    }

    try {
      await axios.delete(`http://localhost:8000/api/delete-term/${id}`);
      // Update state to remove the deleted term
      setTermsData(termsData.filter((term) => term.id !== id));
      // Optional: Show success message
      alert("Term deleted successfully!");
    } catch (err) {
      console.error("Delete error:", err);
      setError(err instanceof Error ? err.message : "An error occurred while deleting the term.");
    }
  };

// Filter terms based on name or definition
  const filteredTerms = termsData.filter((term) =>
    term.name.toLowerCase().includes(searchTerm.toLowerCase()) 

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

        <UploadCsv></UploadCsv>
        {/* Search */}
        <SearchBar
          value={searchTerm}
          onChange={setSearchTerm}
          placeholder="Search terms by name or description..."
          className="max-w-md"
        />
       {/* Error Message */}
        {error && (
          <div className="text-center py-4 text-destructive">
            <p>{error}</p>
          </div>
        )}
        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading terms...</p>
          </div>
        )}

        {/* Terms Grid */}
        {!loading && (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTerms.map((term) => (
              <Card
                key={term.id}
                className="group cursor-pointer border-border bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300 hover:border-primary/50"
                
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
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4 min-h-[3.5rem]">
                    {term.definition
                      ? term.definition.length > 100
                        ? `${term.definition.slice(0, 100)}...`
                        : term.definition
                      : ""}
                  </p>
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
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(term.id);
                      }}
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
        )}

        {!loading && filteredTerms.length === 0 && (
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