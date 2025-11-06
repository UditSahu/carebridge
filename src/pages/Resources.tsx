import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import SectionHeader from "@/components/SectionHeader";
import { CheckCircle2, BookOpen, Video, Headphones, FileText, Star, TrendingUp, Sparkles } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { resourceService } from "@/services/resourceService";
import { toast } from "sonner";
import MentalHealthQuestionnaire from "@/components/MentalHealthQuestionnaire";
import { 
  recommendationEngine, 
  QuestionnaireResponse, 
  AssessmentScore,
  ResourceItem,
  RecommendationResult,
  generateRecommendationSummary,
  getAssessmentSeverity
} from "@/services/recommendationService";

const Resources = () => {
  const { userRecord } = useAuth();
  const [step, setStep] = useState<"intro" | "questionnaire" | "results">("intro");
  const [recommendations, setRecommendations] = useState<RecommendationResult | null>(null);
  const [assessmentScore, setAssessmentScore] = useState<AssessmentScore | null>(null);
  const [questionnaireResponse, setQuestionnaireResponse] = useState<QuestionnaireResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'high' | 'recommended' | 'all'>('high');

  const handleQuestionnaireComplete = async (
    response: QuestionnaireResponse,
    score: AssessmentScore
  ) => {
    setLoading(true);
    try {
      // Save preferences if user is logged in
      if (userRecord?.id) {
        await resourceService.saveUserPreferences(
          userRecord.id,
          response.concerns,
          response.preferredFormats
        );
      }

      // Generate recommendations
      const result = recommendationEngine.getRecommendations(response, score);
      
      setQuestionnaireResponse(response);
      setAssessmentScore(score);
      setRecommendations(result);
      setStep('results');
      
      toast.success('Assessment complete! Here are your personalized recommendations.');
    } catch (error) {
      console.error('Error processing questionnaire:', error);
      toast.error('Failed to generate recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResource = async (resourceId: number) => {
    if (!userRecord?.id) {
      toast.error('Please sign in to save resources');
      return;
    }

    try {
      await resourceService.saveResource(userRecord.id, resourceId.toString());
      toast.success('Resource saved for later!');
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Failed to save resource');
    }
  };

  const handleRetakeAssessment = () => {
    setStep('questionnaire');
    setRecommendations(null);
    setAssessmentScore(null);
    setQuestionnaireResponse(null);
    setActiveTab('high');
  };

  const getResourceIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'video': return Video;
      case 'audio': return Headphones;
      case 'blog': return BookOpen;
      case 'article': return FileText;
      default: return FileText;
    }
  };

  const getScoreBadge = (score?: number) => {
    if (!score) return null;
    
    if (score > 80) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-primary/20 text-primary rounded">
          <Star className="w-3 h-3" /> Highly Recommended
        </span>
      );
    } else if (score >= 50) {
      return (
        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium bg-secondary/20 text-secondary rounded">
          <TrendingUp className="w-3 h-3" /> Recommended
        </span>
      );
    }
    return null;
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'minimal': return 'text-green-600';
      case 'mild': return 'text-yellow-600';
      case 'moderate': return 'text-orange-600';
      case 'severe': return 'text-red-600';
      default: return 'text-muted-foreground';
    }
  };

  const getCurrentResources = (): ResourceItem[] => {
    if (!recommendations) return [];
    
    switch (activeTab) {
      case 'high':
        return recommendations.highPriority;
      case 'recommended':
        return recommendations.recommended;
      case 'all':
        return recommendations.allResources;
      default:
        return recommendations.allResources;
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-4rem)]">
      <div className="max-w-container mx-auto px-6 py-12">
        <SectionHeader
          label="Personalized Learning"
          title="Resource Hub"
          description="Curated mental health content tailored to your needs"
        />

        {/* Intro Step */}
        {step === "intro" && (
          <div className="max-w-3xl mx-auto">
            <div className="bg-surface border-2 border-border p-8 space-y-6">
              <div className="flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-primary" />
                <h3 className="text-2xl font-semibold text-foreground">
                  Get Personalized Recommendations
                </h3>
              </div>
              
              <p className="text-muted-foreground">
                Take our comprehensive mental health assessment to receive personalized resource recommendations 
                based on your specific needs, concerns, and preferences.
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Evidence-based assessment</p>
                    <p className="text-sm text-muted-foreground">Based on validated mental health screening tools</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Personalized recommendations</p>
                    <p className="text-sm text-muted-foreground">Resources matched to your specific concerns and preferences</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-1" />
                  <div>
                    <p className="font-medium text-foreground">Curated content</p>
                    <p className="text-sm text-muted-foreground">Videos, articles, blogs, and resources from trusted sources</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button onClick={() => setStep('questionnaire')} size="lg" className="flex-1">
                  Start Assessment
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => {
                    const allResources = recommendationEngine.getAllResources();
                    setRecommendations({
                      highPriority: [],
                      recommended: [],
                      additional: allResources,
                      allResources
                    });
                    setStep('results');
                  }}
                >
                  Browse All
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center pt-4">
                This assessment takes approximately 5-7 minutes to complete
              </p>
            </div>
          </div>
        )}

        {/* Questionnaire Step */}
        {step === "questionnaire" && (
          <MentalHealthQuestionnaire
            onComplete={handleQuestionnaireComplete}
            onCancel={() => setStep('intro')}
          />
        )}

        {/* Results Step */}
        {step === "results" && recommendations && (
          <div className="space-y-6">
            {/* Assessment Summary */}
            {assessmentScore && questionnaireResponse && (
              <div className="bg-surface border-2 border-border p-6">
                <h3 className="text-xl font-semibold text-foreground mb-4">Your Assessment Summary</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div className="p-4 bg-background border border-border rounded">
                    <p className="text-sm text-muted-foreground mb-1">Anxiety</p>
                    <p className={`text-2xl font-bold ${getSeverityColor(getAssessmentSeverity(assessmentScore.anxiety || 0))}`}>
                      {assessmentScore.anxiety}%
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {getAssessmentSeverity(assessmentScore.anxiety || 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-background border border-border rounded">
                    <p className="text-sm text-muted-foreground mb-1">Depression</p>
                    <p className={`text-2xl font-bold ${getSeverityColor(getAssessmentSeverity(assessmentScore.depression || 0))}`}>
                      {assessmentScore.depression}%
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {getAssessmentSeverity(assessmentScore.depression || 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-background border border-border rounded">
                    <p className="text-sm text-muted-foreground mb-1">Stress</p>
                    <p className={`text-2xl font-bold ${getSeverityColor(getAssessmentSeverity(assessmentScore.stress || 0))}`}>
                      {assessmentScore.stress}%
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {getAssessmentSeverity(assessmentScore.stress || 0)}
                    </p>
                  </div>
                  <div className="p-4 bg-background border border-border rounded">
                    <p className="text-sm text-muted-foreground mb-1">Overall</p>
                    <p className={`text-2xl font-bold ${getSeverityColor(getAssessmentSeverity(assessmentScore.overall || 0))}`}>
                      {assessmentScore.overall}%
                    </p>
                    <p className="text-xs text-muted-foreground capitalize">
                      {getAssessmentSeverity(assessmentScore.overall || 0)}
                    </p>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground mb-4">
                  {generateRecommendationSummary(recommendations, questionnaireResponse, assessmentScore)}
                </p>

                <Button variant="outline" size="sm" onClick={handleRetakeAssessment}>
                  Retake Assessment
                </Button>
              </div>
            )}

            {/* Resource Tabs */}
            <div className="border-2 border-border">
              <div className="bg-surface border-b-2 border-border">
                <div className="flex gap-1 p-2">
                  <button
                    onClick={() => setActiveTab('high')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'high'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    High Priority ({recommendations.highPriority.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('recommended')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'recommended'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    Recommended ({recommendations.recommended.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('all')}
                    className={`px-4 py-2 text-sm font-medium transition-colors ${
                      activeTab === 'all'
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    All Resources ({recommendations.allResources.length})
                  </button>
                </div>
              </div>

              {/* Resources List */}
              <div className="divide-y-2 divide-border">
                {getCurrentResources().length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-muted-foreground">No resources found in this category.</p>
                    <Button 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => setActiveTab('all')}
                    >
                      View All Resources
                    </Button>
                  </div>
                ) : (
                  getCurrentResources().map((resource) => {
                    const Icon = getResourceIcon(resource.type);
                    return (
                      <div
                        key={resource.id}
                        className="p-6 bg-background hover:bg-surface transition-colors"
                      >
                        <div className="flex items-start gap-4">
                          <Icon className="w-6 h-6 text-secondary flex-shrink-0 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="text-xs text-muted-foreground uppercase tracking-wider">
                                {resource.type}
                              </span>
                              <span className="text-xs text-muted-foreground">•</span>
                              <span className="text-xs text-muted-foreground capitalize">
                                {resource.difficulty_level}
                              </span>
                              {getScoreBadge(resource.score)}
                            </div>
                            
                            <h4 className="text-lg font-medium text-foreground mb-2">
                              {resource.title}
                            </h4>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {resource.description}
                            </p>

                            {resource.matchedTags && resource.matchedTags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mb-3">
                                {resource.matchedTags.map((tag, idx) => (
                                  <span 
                                    key={idx}
                                    className="px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                                  >
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => window.open(resource.url, '_blank')}
                              >
                                View Resource
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleSaveResource(resource.id)}
                              >
                                Save for Later
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Resources;
