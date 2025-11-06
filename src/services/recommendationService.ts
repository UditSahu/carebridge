/**
 * Recommendation System for Resource Hub
 * 
 * This service provides intelligent resource recommendations based on:
 * 1. User questionnaire responses (concerns, preferences)
 * 2. Mental health assessment scores
 * 3. Tag-based matching from main.json data
 * 4. Difficulty level progression
 */

// Import the main.json data
import mainData from '../../data/main.json';

export interface QuestionnaireResponse {
  concerns: string[]; // e.g., ["anxiety", "stress", "depression"]
  preferredFormats: string[]; // e.g., ["video", "blog", "article"]
  ageGroup?: 'children' | 'teens' | 'college' | 'adult';
  timeAvailable?: 'short' | 'medium' | 'long'; // For duration-based filtering
}

export interface AssessmentScore {
  anxiety?: number; // 0-100
  depression?: number; // 0-100
  stress?: number; // 0-100
  overall?: number; // 0-100
}

export interface ResourceItem {
  id: number;
  title: string;
  type: string;
  url: string;
  description: string;
  tags: string[];
  difficulty_level: string;
  score?: number; // Calculated recommendation score
  matchedTags?: string[]; // Tags that matched user profile
}

export interface RecommendationResult {
  highPriority: ResourceItem[]; // Score > 80
  recommended: ResourceItem[]; // Score 50-80
  additional: ResourceItem[]; // Score < 50
  allResources: ResourceItem[]; // All resources sorted by score
}

export class RecommendationEngine {
  private resources: ResourceItem[];

  constructor() {
    this.resources = mainData as ResourceItem[];
  }

  /**
   * Main recommendation function
   * Combines questionnaire responses and assessment scores to generate recommendations
   */
  getRecommendations(
    questionnaire: QuestionnaireResponse,
    assessmentScore?: AssessmentScore
  ): RecommendationResult {
    // Calculate scores for each resource
    const scoredResources = this.resources.map(resource => ({
      ...resource,
      score: this.calculateResourceScore(resource, questionnaire, assessmentScore),
      matchedTags: this.getMatchedTags(resource, questionnaire, assessmentScore)
    }));

    // Sort by score (highest first)
    const sortedResources = scoredResources.sort((a, b) => (b.score || 0) - (a.score || 0));

    // Categorize resources by score
    const highPriority = sortedResources.filter(r => (r.score || 0) > 80);
    const recommended = sortedResources.filter(r => (r.score || 0) >= 50 && (r.score || 0) <= 80);
    const additional = sortedResources.filter(r => (r.score || 0) < 50);

    return {
      highPriority,
      recommended,
      additional,
      allResources: sortedResources
    };
  }

  /**
   * Calculate recommendation score for a resource
   * Score range: 0-100
   */
  private calculateResourceScore(
    resource: ResourceItem,
    questionnaire: QuestionnaireResponse,
    assessmentScore?: AssessmentScore
  ): number {
    let score = 0;
    const weights = {
      concernMatch: 40,
      formatMatch: 20,
      assessmentAlignment: 25,
      difficultyLevel: 10,
      ageGroup: 5
    };

    // 1. Concern/Tag Matching (40 points)
    const concernScore = this.calculateConcernMatch(resource, questionnaire.concerns);
    score += concernScore * weights.concernMatch;

    // 2. Format Preference Matching (20 points)
    const formatScore = this.calculateFormatMatch(resource, questionnaire.preferredFormats);
    score += formatScore * weights.formatMatch;

    // 3. Assessment Score Alignment (25 points)
    if (assessmentScore) {
      const assessmentAlignmentScore = this.calculateAssessmentAlignment(
        resource,
        assessmentScore
      );
      score += assessmentAlignmentScore * weights.assessmentAlignment;
    } else {
      // Redistribute weight if no assessment
      score += concernScore * weights.assessmentAlignment;
    }

    // 4. Difficulty Level Appropriateness (10 points)
    const difficultyScore = this.calculateDifficultyScore(
      resource,
      assessmentScore
    );
    score += difficultyScore * weights.difficultyLevel;

    // 5. Age Group Relevance (5 points)
    if (questionnaire.ageGroup) {
      const ageScore = this.calculateAgeRelevance(resource, questionnaire.ageGroup);
      score += ageScore * weights.ageGroup;
    }

    return Math.min(100, Math.round(score));
  }

  /**
   * Calculate how well resource tags match user concerns
   */
  private calculateConcernMatch(resource: ResourceItem, concerns: string[]): number {
    if (!concerns || concerns.length === 0) return 0.5; // Default score

    const normalizedConcerns = concerns.map(c => c.toLowerCase());
    const normalizedTags = resource.tags.map(t => t.toLowerCase());

    let matchCount = 0;
    let partialMatchCount = 0;

    normalizedConcerns.forEach(concern => {
      // Exact match
      if (normalizedTags.includes(concern)) {
        matchCount++;
      } else {
        // Partial match (concern is substring of tag or vice versa)
        const hasPartialMatch = normalizedTags.some(tag => 
          tag.includes(concern) || concern.includes(tag)
        );
        if (hasPartialMatch) {
          partialMatchCount++;
        }
      }
    });

    // Calculate score: exact matches worth more than partial
    const exactMatchScore = matchCount / normalizedConcerns.length;
    const partialMatchScore = (partialMatchCount / normalizedConcerns.length) * 0.5;

    return Math.min(1, exactMatchScore + partialMatchScore);
  }

  /**
   * Calculate format preference match
   */
  private calculateFormatMatch(resource: ResourceItem, preferredFormats: string[]): number {
    if (!preferredFormats || preferredFormats.length === 0) return 0.5;

    const normalizedFormats = preferredFormats.map(f => f.toLowerCase());
    const resourceType = resource.type.toLowerCase();

    // Direct match
    if (normalizedFormats.includes(resourceType)) {
      return 1;
    }

    // Partial match (e.g., "articles" matches "article", "videos" matches "video")
    const hasPartialMatch = normalizedFormats.some(format => 
      format.includes(resourceType) || resourceType.includes(format)
    );

    return hasPartialMatch ? 0.7 : 0.3;
  }

  /**
   * Calculate alignment with assessment scores
   * Higher scores indicate more severe issues, so prioritize relevant resources
   */
  private calculateAssessmentAlignment(
    resource: ResourceItem,
    assessmentScore: AssessmentScore
  ): number {
    const normalizedTags = resource.tags.map(t => t.toLowerCase());
    let alignmentScore = 0;
    let scoreCount = 0;

    // Map assessment scores to relevant tags
    const scoreTagMap: { [key: string]: string[] } = {
      anxiety: ['anxiety', 'stress', 'worry', 'panic', 'calm', 'relaxation', 'breathing'],
      depression: ['depression', 'mood', 'sadness', 'motivation', 'happiness'],
      stress: ['stress', 'burnout', 'overwhelm', 'pressure', 'coping', 'relaxation']
    };

    // Check each assessment score
    Object.entries(assessmentScore).forEach(([key, value]) => {
      if (key === 'overall' || value === undefined) return;

      const relevantTags = scoreTagMap[key] || [];
      const hasRelevantTag = normalizedTags.some(tag => 
        relevantTags.some(relevantTag => 
          tag.includes(relevantTag) || relevantTag.includes(tag)
        )
      );

      if (hasRelevantTag) {
        // Higher assessment scores increase the alignment score
        alignmentScore += value / 100;
        scoreCount++;
      }
    });

    return scoreCount > 0 ? alignmentScore / scoreCount : 0.5;
  }

  /**
   * Calculate difficulty level appropriateness
   * Match difficulty to assessment severity
   */
  private calculateDifficultyScore(
    resource: ResourceItem,
    assessmentScore?: AssessmentScore
  ): number {
    const difficultyLevel = resource.difficulty_level.toLowerCase();

    if (!assessmentScore || !assessmentScore.overall) {
      // Default: prefer beginner resources
      return difficultyLevel === 'beginner' ? 1 : 0.5;
    }

    const overallScore = assessmentScore.overall;

    // Low scores (0-33): Start with beginner content
    if (overallScore <= 33) {
      if (difficultyLevel === 'beginner') return 1;
      if (difficultyLevel === 'intermediate') return 0.5;
      return 0.3;
    }

    // Medium scores (34-66): Mix of beginner and intermediate
    if (overallScore <= 66) {
      if (difficultyLevel === 'intermediate') return 1;
      if (difficultyLevel === 'beginner') return 0.8;
      return 0.5;
    }

    // High scores (67-100): All levels, prioritize intermediate/advanced
    if (difficultyLevel === 'intermediate') return 1;
    if (difficultyLevel === 'advanced') return 0.9;
    return 0.7;
  }

  /**
   * Calculate age group relevance
   */
  private calculateAgeRelevance(resource: ResourceItem, ageGroup: string): number {
    const normalizedTags = resource.tags.map(t => t.toLowerCase());
    const ageGroupLower = ageGroup.toLowerCase();

    // Age-specific tags
    const ageTagMap: { [key: string]: string[] } = {
      children: ['children', 'child', 'kids', 'young'],
      teens: ['teens', 'teenager', 'adolescent', 'youth'],
      college: ['college', 'university', 'student', 'campus'],
      adult: ['adult', 'professional', 'workplace', 'work-life']
    };

    const relevantTags = ageTagMap[ageGroupLower] || [];
    const hasRelevantTag = normalizedTags.some(tag => 
      relevantTags.some(ageTag => tag.includes(ageTag) || ageTag.includes(tag))
    );

    return hasRelevantTag ? 1 : 0.5;
  }

  /**
   * Get tags that matched the user's profile
   */
  private getMatchedTags(
    resource: ResourceItem,
    questionnaire: QuestionnaireResponse,
    assessmentScore?: AssessmentScore
  ): string[] {
    const matchedTags: Set<string> = new Set();
    const normalizedTags = resource.tags.map(t => t.toLowerCase());

    // Match concerns
    questionnaire.concerns.forEach(concern => {
      const concernLower = concern.toLowerCase();
      resource.tags.forEach(tag => {
        if (tag.toLowerCase().includes(concernLower) || concernLower.includes(tag.toLowerCase())) {
          matchedTags.add(tag);
        }
      });
    });

    // Match assessment-related tags
    if (assessmentScore) {
      const assessmentTags = ['anxiety', 'depression', 'stress', 'mental health'];
      resource.tags.forEach(tag => {
        if (assessmentTags.some(at => tag.toLowerCase().includes(at))) {
          matchedTags.add(tag);
        }
      });
    }

    return Array.from(matchedTags);
  }

  /**
   * Get resources by specific tags
   */
  getResourcesByTags(tags: string[], limit?: number): ResourceItem[] {
    const normalizedTags = tags.map(t => t.toLowerCase());
    
    const matchedResources = this.resources
      .map(resource => {
        const matchCount = resource.tags.filter(tag => 
          normalizedTags.some(searchTag => 
            tag.toLowerCase().includes(searchTag) || searchTag.includes(tag.toLowerCase())
          )
        ).length;

        return {
          ...resource,
          score: (matchCount / tags.length) * 100
        };
      })
      .filter(r => (r.score || 0) > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0));

    return limit ? matchedResources.slice(0, limit) : matchedResources;
  }

  /**
   * Get resources by type
   */
  getResourcesByType(type: string): ResourceItem[] {
    return this.resources.filter(r => 
      r.type.toLowerCase() === type.toLowerCase()
    );
  }

  /**
   * Get resources by difficulty level
   */
  getResourcesByDifficulty(level: string): ResourceItem[] {
    return this.resources.filter(r => 
      r.difficulty_level.toLowerCase() === level.toLowerCase()
    );
  }

  /**
   * Search resources by keyword
   */
  searchResources(keyword: string): ResourceItem[] {
    const keywordLower = keyword.toLowerCase();
    
    return this.resources.filter(resource => 
      resource.title.toLowerCase().includes(keywordLower) ||
      resource.description.toLowerCase().includes(keywordLower) ||
      resource.tags.some(tag => tag.toLowerCase().includes(keywordLower))
    );
  }

  /**
   * Get all resources
   */
  getAllResources(): ResourceItem[] {
    return this.resources;
  }
}

// Export singleton instance
export const recommendationEngine = new RecommendationEngine();

// Helper function to map assessment scores to severity levels
export function getAssessmentSeverity(score: number): 'minimal' | 'mild' | 'moderate' | 'severe' {
  if (score < 25) return 'minimal';
  if (score < 50) return 'mild';
  if (score < 75) return 'moderate';
  return 'severe';
}

// Helper function to generate user-friendly recommendations summary
export function generateRecommendationSummary(
  result: RecommendationResult,
  questionnaire: QuestionnaireResponse,
  assessmentScore?: AssessmentScore
): string {
  const concernsText = questionnaire.concerns.join(', ');
  const totalResources = result.allResources.length;
  const highPriorityCount = result.highPriority.length;

  let summary = `Based on your concerns (${concernsText}), we found ${totalResources} resources for you. `;
  
  if (highPriorityCount > 0) {
    summary += `${highPriorityCount} are highly recommended and match your needs closely. `;
  }

  if (assessmentScore?.overall) {
    const severity = getAssessmentSeverity(assessmentScore.overall);
    summary += `Your assessment indicates ${severity} symptoms. `;
    
    if (severity === 'moderate' || severity === 'severe') {
      summary += `We recommend starting with professional support resources and beginner-level content. `;
    }
  }

  return summary;
}
