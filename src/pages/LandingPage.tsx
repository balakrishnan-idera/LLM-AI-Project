import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Brain, Network, GitBranch, Zap, Target } from "lucide-react";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-16">
        <div className="text-center space-y-8">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 blur-3xl rounded-full"></div>
            <div className="relative flex items-center justify-center space-x-4">
              <Database className="h-16 w-16 text-primary" />
              <Brain className="h-12 w-12 text-accent" />
              <Network className="h-14 w-14 text-ai-accent" />
            </div>
          </div>
          
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-ai-accent bg-clip-text text-transparent">
              DataModel AI
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Intelligent Entity-Relationship modeling with AI-powered recommendations for logical and physical data structures
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/erobjects">
              <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-primary-foreground">
                <Network className="mr-2 h-5 w-5" />
                Explore ERObjects
              </Button>
            </Link>
            <Link to="/terms">
              <Button size="lg" variant="outline" className="border-primary text-primary hover:bg-primary/10">
                <Database className="mr-2 h-5 w-5" />
                Browse Terms
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Intelligent Data Modeling</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Leverage AI-driven insights to build robust entity-relationship models with intelligent term associations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <Card className="border-border bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center mb-4">
                <GitBranch className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Entity Relationships</CardTitle>
              <CardDescription>
                Define and manage complex relationships between ERObjects with intuitive visual tools
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Build comprehensive data models with linked entities, attributes, and relationship constraints
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-accent to-ai-accent rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-accent-foreground" />
              </div>
              <CardTitle>AI Recommendations</CardTitle>
              <CardDescription>
                Get intelligent suggestions for term associations based on confidence scoring
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Machine learning algorithms analyze patterns to suggest optimal term relationships
              </p>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 backdrop-blur hover:shadow-lg transition-all duration-300">
            <CardHeader>
              <div className="w-12 h-12 bg-gradient-to-br from-ai-accent to-primary rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-primary-foreground" />
              </div>
              <CardTitle>Logical & Physical Models</CardTitle>
              <CardDescription>
                Bridge conceptual designs with implementation-ready physical structures
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Transform logical models into optimized physical database schemas seamlessly
              </p>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;