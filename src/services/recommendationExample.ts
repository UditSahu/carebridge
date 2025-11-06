/**
 * Example Usage of the Recommendation System
 * 
 * This file demonstrates how to use the recommendation engine
 * with different user profiles and scenarios.
 */

import { 
  recommendationEngine, 
  QuestionnaireResponse, 
  AssessmentScore,
  getAssessmentSeverity,
  generateRecommendationSummary
} from './recommendationService';

// Example 1: High Anxiety College Student
export function exampleHighAnxietyStudent() {
  const questionnaire: QuestionnaireResponse = {
    concerns: ['anxiety', 'stress', 'academic pressure'],
    preferredFormats: ['video', 'blog'],
    ageGroup: 'college',
    timeAvailable: 'medium'
  };

  const assessment: AssessmentScore = {
    anxiety: 75,
    depression: 30,
    stress: 65,
    overall: 57
  };

  const recommendations = recommendationEngine.getRecommendations(questionnaire, assessment);
  
  console.log('=== High Anxiety College Student ===');
  console.log(`Total Resources: ${recommendations.allResources.length}`);
  console.log(`High Priority: ${recommendations.highPriority.length}`);
  console.log(`Recommended: ${recommendations.recommended.length}`);
  console.log('\nTop 5 Recommendations:');
  recommendations.allResources.slice(0, 5).forEach((resource, idx) => {
    console.log(`${idx + 1}. ${resource.title} (Score: ${resource.score})`);
    console.log(`   Type: ${resource.type} | Difficulty: ${resource.difficulty_level}`);
    console.log(`   Matched Tags: ${resource.matchedTags?.join(', ')}`);
  });
  
  return recommendations;
}

// Example 2: Mild Depression Adult
export function exampleMildDepressionAdult() {
  const questionnaire: QuestionnaireResponse = {
    concerns: ['depression', 'motivation', 'self-esteem'],
    preferredFormats: ['article', 'blog'],
    ageGroup: 'adult',
    timeAvailable: 'short'
  };

  const assessment: AssessmentScore = {
    anxiety: 20,
    depression: 45,
    stress: 25,
    overall: 30
  };

  const recommendations = recommendationEngine.getRecommendations(questionnaire, assessment);
  
  console.log('\n=== Mild Depression Adult ===');
  console.log(`Severity: ${getAssessmentSeverity(assessment.overall)}`);
  console.log(`Summary: ${generateRecommendationSummary(recommendations, questionnaire, assessment)}`);
  console.log('\nHigh Priority Resources:');
  recommendations.highPriority.forEach((resource, idx) => {
    console.log(`${idx + 1}. ${resource.title} (Score: ${resource.score})`);
  });
  
  return recommendations;
}

// Example 3: Moderate Stress Teen
export function exampleModerateStressTeen() {
  const questionnaire: QuestionnaireResponse = {
    concerns: ['stress', 'sleep', 'relationships'],
    preferredFormats: ['video'],
    ageGroup: 'teens',
    timeAvailable: 'medium'
  };

  const assessment: AssessmentScore = {
    anxiety: 40,
    depression: 35,
    stress: 55,
    overall: 43
  };

  const recommendations = recommendationEngine.getRecommendations(questionnaire, assessment);
  
  console.log('\n=== Moderate Stress Teen ===');
  console.log('Assessment Breakdown:');
  console.log(`- Anxiety: ${assessment.anxiety}% (${getAssessmentSeverity(assessment.anxiety)})`);
  console.log(`- Depression: ${assessment.depression}% (${getAssessmentSeverity(assessment.depression)})`);
  console.log(`- Stress: ${assessment.stress}% (${getAssessmentSeverity(assessment.stress)})`);
  console.log(`- Overall: ${assessment.overall}% (${getAssessmentSeverity(assessment.overall)})`);
  
  console.log('\nRecommended Resources:');
  recommendations.recommended.slice(0, 5).forEach((resource, idx) => {
    console.log(`${idx + 1}. ${resource.title}`);
    console.log(`   ${resource.description.substring(0, 80)}...`);
  });
  
  return recommendations;
}

// Example 4: No Assessment (Browse Mode)
export function exampleBrowseMode() {
  const questionnaire: QuestionnaireResponse = {
    concerns: ['mental health', 'wellness'],
    preferredFormats: ['video', 'blog', 'article'],
    ageGroup: 'college',
    timeAvailable: 'long'
  };

  // No assessment score provided
  const recommendations = recommendationEngine.getRecommendations(questionnaire);
  
  console.log('\n=== Browse Mode (No Assessment) ===');
  console.log('User is browsing without taking assessment');
  console.log(`Total Resources Available: ${recommendations.allResources.length}`);
  
  // Group by type
  const byType = recommendations.allResources.reduce((acc, resource) => {
    acc[resource.type] = (acc[resource.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\nResources by Type:');
  Object.entries(byType).forEach(([type, count]) => {
    console.log(`- ${type}: ${count}`);
  });
  
  return recommendations;
}

// Example 5: Search by Tags
export function exampleSearchByTags() {
  console.log('\n=== Search by Tags ===');
  
  // Search for anxiety resources
  const anxietyResources = recommendationEngine.getResourcesByTags(['anxiety'], 5);
  console.log('\nTop 5 Anxiety Resources:');
  anxietyResources.forEach((resource, idx) => {
    console.log(`${idx + 1}. ${resource.title}`);
    console.log(`   Tags: ${resource.tags.join(', ')}`);
  });
  
  // Search for stress and coping
  const stressCopingResources = recommendationEngine.getResourcesByTags(['stress', 'coping'], 5);
  console.log('\nTop 5 Stress & Coping Resources:');
  stressCopingResources.forEach((resource, idx) => {
    console.log(`${idx + 1}. ${resource.title}`);
  });
  
  return { anxietyResources, stressCopingResources };
}

// Example 6: Search by Keyword
export function exampleSearchByKeyword() {
  console.log('\n=== Search by Keyword ===');
  
  const results = recommendationEngine.searchResources('mindfulness');
  console.log(`Found ${results.length} resources matching "mindfulness"`);
  results.forEach((resource, idx) => {
    console.log(`${idx + 1}. ${resource.title} (${resource.type})`);
  });
  
  return results;
}

// Example 7: Filter by Type and Difficulty
export function exampleFilterByTypeAndDifficulty() {
  console.log('\n=== Filter by Type and Difficulty ===');
  
  const videos = recommendationEngine.getResourcesByType('video');
  console.log(`Total Video Resources: ${videos.length}`);
  
  const beginnerResources = recommendationEngine.getResourcesByDifficulty('beginner');
  console.log(`Total Beginner Resources: ${beginnerResources.length}`);
  
  // Combine filters
  const beginnerVideos = videos.filter(r => r.difficulty_level === 'beginner');
  console.log(`Beginner Videos: ${beginnerVideos.length}`);
  
  console.log('\nSample Beginner Videos:');
  beginnerVideos.slice(0, 3).forEach((resource, idx) => {
    console.log(`${idx + 1}. ${resource.title}`);
  });
  
  return { videos, beginnerResources, beginnerVideos };
}

// Example 8: Severe Case (Crisis Detection)
export function exampleSevereCase() {
  const questionnaire: QuestionnaireResponse = {
    concerns: ['depression', 'anxiety', 'self-harm'],
    preferredFormats: ['article', 'video'],
    ageGroup: 'adult',
    timeAvailable: 'short'
  };

  const assessment: AssessmentScore = {
    anxiety: 85,
    depression: 90,
    stress: 80,
    overall: 85
  };

  const recommendations = recommendationEngine.getRecommendations(questionnaire, assessment);
  
  console.log('\n=== SEVERE CASE - Crisis Detection ===');
  console.log('⚠️  WARNING: High severity scores detected');
  console.log(`Overall Score: ${assessment.overall}% (${getAssessmentSeverity(assessment.overall)})`);
  console.log('\n🚨 RECOMMENDED ACTIONS:');
  console.log('1. Immediate professional help recommended');
  console.log('2. Contact crisis hotline: 988 (US)');
  console.log('3. Reach out to emergency services if in immediate danger');
  
  console.log('\nSupportive Resources:');
  recommendations.highPriority.slice(0, 3).forEach((resource, idx) => {
    console.log(`${idx + 1}. ${resource.title}`);
  });
  
  return recommendations;
}

// Run all examples
export function runAllExamples() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║     RECOMMENDATION SYSTEM - USAGE EXAMPLES                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
  
  exampleHighAnxietyStudent();
  exampleMildDepressionAdult();
  exampleModerateStressTeen();
  exampleBrowseMode();
  exampleSearchByTags();
  exampleSearchByKeyword();
  exampleFilterByTypeAndDifficulty();
  exampleSevereCase();
  
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     ALL EXAMPLES COMPLETED                                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝\n');
}

// Export for testing
export const examples = {
  highAnxietyStudent: exampleHighAnxietyStudent,
  mildDepressionAdult: exampleMildDepressionAdult,
  moderateStressTeen: exampleModerateStressTeen,
  browseMode: exampleBrowseMode,
  searchByTags: exampleSearchByTags,
  searchByKeyword: exampleSearchByKeyword,
  filterByTypeAndDifficulty: exampleFilterByTypeAndDifficulty,
  severeCase: exampleSevereCase,
  runAll: runAllExamples
};
