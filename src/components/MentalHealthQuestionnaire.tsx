/**
 * Mental Health Assessment Questionnaire
 * 
 * This component provides a comprehensive questionnaire to assess:
 * - Anxiety levels
 * - Depression symptoms
 * - Stress levels
 * - User preferences and concerns
 * 
 * Scores are calculated and used for personalized recommendations
 */

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import { AssessmentScore, QuestionnaireResponse } from '@/services/recommendationService';

interface Question {
  id: string;
  category: 'anxiety' | 'depression' | 'stress' | 'preference';
  question: string;
  options: {
    text: string;
    value: number; // 0-3 for severity questions, or just selection for preferences
  }[];
  multiSelect?: boolean;
}

interface QuestionnaireProps {
  onComplete: (response: QuestionnaireResponse, score: AssessmentScore) => void;
  onCancel?: () => void;
}

const MentalHealthQuestionnaire = ({ onComplete, onCancel }: QuestionnaireProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<{ [key: string]: number | string[] }>({});
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [ageGroup, setAgeGroup] = useState<string>('');

  // Comprehensive questionnaire based on validated mental health scales
  const questions: Question[] = [
    // Anxiety Assessment (GAD-7 inspired)
    {
      id: 'anxiety_1',
      category: 'anxiety',
      question: 'Over the last 2 weeks, how often have you felt nervous, anxious, or on edge?',
      options: [
        { text: 'Not at all', value: 0 },
        { text: 'Several days', value: 1 },
        { text: 'More than half the days', value: 2 },
        { text: 'Nearly every day', value: 3 }
      ]
    },
    {
      id: 'anxiety_2',
      category: 'anxiety',
      question: 'Over the last 2 weeks, how often have you been unable to stop or control worrying?',
      options: [
        { text: 'Not at all', value: 0 },
        { text: 'Several days', value: 1 },
        { text: 'More than half the days', value: 2 },
        { text: 'Nearly every day', value: 3 }
      ]
    },
    {
      id: 'anxiety_3',
      category: 'anxiety',
      question: 'Over the last 2 weeks, how often have you worried too much about different things?',
      options: [
        { text: 'Not at all', value: 0 },
        { text: 'Several days', value: 1 },
        { text: 'More than half the days', value: 2 },
        { text: 'Nearly every day', value: 3 }
      ]
    },
    {
      id: 'anxiety_4',
      category: 'anxiety',
      question: 'Over the last 2 weeks, how often have you had trouble relaxing?',
      options: [
        { text: 'Not at all', value: 0 },
        { text: 'Several days', value: 1 },
        { text: 'More than half the days', value: 2 },
        { text: 'Nearly every day', value: 3 }
      ]
    },

    // Depression Assessment (PHQ-9 inspired)
    {
      id: 'depression_1',
      category: 'depression',
      question: 'Over the last 2 weeks, how often have you had little interest or pleasure in doing things?',
      options: [
        { text: 'Not at all', value: 0 },
        { text: 'Several days', value: 1 },
        { text: 'More than half the days', value: 2 },
        { text: 'Nearly every day', value: 3 }
      ]
    },
    {
      id: 'depression_2',
      category: 'depression',
      question: 'Over the last 2 weeks, how often have you felt down, depressed, or hopeless?',
      options: [
        { text: 'Not at all', value: 0 },
        { text: 'Several days', value: 1 },
        { text: 'More than half the days', value: 2 },
        { text: 'Nearly every day', value: 3 }
      ]
    },
    {
      id: 'depression_3',
      category: 'depression',
      question: 'Over the last 2 weeks, how often have you had trouble falling or staying asleep, or sleeping too much?',
      options: [
        { text: 'Not at all', value: 0 },
        { text: 'Several days', value: 1 },
        { text: 'More than half the days', value: 2 },
        { text: 'Nearly every day', value: 3 }
      ]
    },
    {
      id: 'depression_4',
      category: 'depression',
      question: 'Over the last 2 weeks, how often have you felt tired or had little energy?',
      options: [
        { text: 'Not at all', value: 0 },
        { text: 'Several days', value: 1 },
        { text: 'More than half the days', value: 2 },
        { text: 'Nearly every day', value: 3 }
      ]
    },

    // Stress Assessment (PSS inspired)
    {
      id: 'stress_1',
      category: 'stress',
      question: 'In the last month, how often have you felt that you were unable to control important things in your life?',
      options: [
        { text: 'Never', value: 0 },
        { text: 'Almost never', value: 1 },
        { text: 'Sometimes', value: 2 },
        { text: 'Fairly often', value: 3 }
      ]
    },
    {
      id: 'stress_2',
      category: 'stress',
      question: 'In the last month, how often have you felt confident about your ability to handle personal problems?',
      options: [
        { text: 'Very often', value: 0 },
        { text: 'Fairly often', value: 1 },
        { text: 'Sometimes', value: 2 },
        { text: 'Never', value: 3 }
      ]
    },
    {
      id: 'stress_3',
      category: 'stress',
      question: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?',
      options: [
        { text: 'Never', value: 0 },
        { text: 'Almost never', value: 1 },
        { text: 'Sometimes', value: 2 },
        { text: 'Fairly often', value: 3 }
      ]
    },
    {
      id: 'stress_4',
      category: 'stress',
      question: 'In the last month, how often have you been angered because of things outside of your control?',
      options: [
        { text: 'Never', value: 0 },
        { text: 'Almost never', value: 1 },
        { text: 'Sometimes', value: 2 },
        { text: 'Fairly often', value: 3 }
      ]
    }
  ];

  const totalSteps = questions.length + 3; // Questions + preferences steps
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const toggleConcern = (concern: string) => {
    setSelectedConcerns(prev =>
      prev.includes(concern) ? prev.filter(c => c !== concern) : [...prev, concern]
    );
  };

  const toggleFormat = (format: string) => {
    setSelectedFormats(prev =>
      prev.includes(format) ? prev.filter(f => f !== format) : [...prev, format]
    );
  };

  const calculateScores = (): AssessmentScore => {
    const anxietyQuestions = questions.filter(q => q.category === 'anxiety');
    const depressionQuestions = questions.filter(q => q.category === 'depression');
    const stressQuestions = questions.filter(q => q.category === 'stress');

    const anxietyScore = anxietyQuestions.reduce((sum, q) => {
      return sum + ((answers[q.id] as number) || 0);
    }, 0);

    const depressionScore = depressionQuestions.reduce((sum, q) => {
      return sum + ((answers[q.id] as number) || 0);
    }, 0);

    const stressScore = stressQuestions.reduce((sum, q) => {
      return sum + ((answers[q.id] as number) || 0);
    }, 0);

    // Normalize scores to 0-100 scale
    const maxAnxietyScore = anxietyQuestions.length * 3;
    const maxDepressionScore = depressionQuestions.length * 3;
    const maxStressScore = stressQuestions.length * 3;

    const normalizedAnxiety = (anxietyScore / maxAnxietyScore) * 100;
    const normalizedDepression = (depressionScore / maxDepressionScore) * 100;
    const normalizedStress = (stressScore / maxStressScore) * 100;

    const overall = (normalizedAnxiety + normalizedDepression + normalizedStress) / 3;

    return {
      anxiety: Math.round(normalizedAnxiety),
      depression: Math.round(normalizedDepression),
      stress: Math.round(normalizedStress),
      overall: Math.round(overall)
    };
  };

  const handleComplete = () => {
    const scores = calculateScores();
    
    const response: QuestionnaireResponse = {
      concerns: selectedConcerns,
      preferredFormats: selectedFormats,
      ageGroup: ageGroup as any,
      timeAvailable: 'medium'
    };

    onComplete(response, scores);
  };

  const canProceed = () => {
    if (currentStep < questions.length) {
      return answers[questions[currentStep].id] !== undefined;
    } else if (currentStep === questions.length) {
      return selectedConcerns.length > 0;
    } else if (currentStep === questions.length + 1) {
      return selectedFormats.length > 0;
    } else if (currentStep === questions.length + 2) {
      return ageGroup !== '';
    }
    return true;
  };

  const renderQuestion = () => {
    if (currentStep < questions.length) {
      const question = questions[currentStep];
      const selectedValue = answers[question.id] as number;

      return (
        <div className="space-y-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
            <h3 className="text-xl font-semibold text-foreground">
              {question.question}
            </h3>
          </div>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(question.id, option.value)}
                className={`w-full p-4 text-left border-2 transition-all ${
                  selectedValue === option.value
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.text}</span>
                  {selectedValue === option.value && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    } else if (currentStep === questions.length) {
      // Concerns selection
      const concernOptions = [
        'Anxiety', 'Depression', 'Stress', 'Sleep', 
        'Relationships', 'Work-life balance', 'Self-esteem',
        'Motivation', 'Academic pressure', 'Social anxiety'
      ];

      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground">
            What areas would you like support with? (Select all that apply)
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {concernOptions.map((concern) => (
              <button
                key={concern}
                onClick={() => toggleConcern(concern)}
                className={`p-4 border-2 transition-colors ${
                  selectedConcerns.includes(concern)
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                {concern}
              </button>
            ))}
          </div>
        </div>
      );
    } else if (currentStep === questions.length + 1) {
      // Format preferences
      const formatOptions = ['Video', 'Blog', 'Article', 'Audio'];

      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground">
            What format do you prefer for learning? (Select all that apply)
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {formatOptions.map((format) => (
              <button
                key={format}
                onClick={() => toggleFormat(format)}
                className={`p-4 border-2 transition-colors ${
                  selectedFormats.includes(format)
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                {format}
              </button>
            ))}
          </div>
        </div>
      );
    } else if (currentStep === questions.length + 2) {
      // Age group
      const ageOptions = [
        { value: 'children', label: 'Children (Under 13)' },
        { value: 'teens', label: 'Teenagers (13-17)' },
        { value: 'college', label: 'College/University Student' },
        { value: 'adult', label: 'Adult (18+)' }
      ];

      return (
        <div className="space-y-6">
          <h3 className="text-xl font-semibold text-foreground">
            Which age group best describes you?
          </h3>

          <div className="space-y-3">
            {ageOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setAgeGroup(option.value)}
                className={`w-full p-4 text-left border-2 transition-all ${
                  ageGroup === option.value
                    ? 'border-primary bg-primary/10 text-foreground'
                    : 'border-border bg-background text-muted-foreground hover:border-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium">{option.label}</span>
                  {ageGroup === option.value && (
                    <CheckCircle2 className="w-5 h-5 text-primary" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      );
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-surface border-2 border-border p-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question {currentStep + 1} of {totalSteps}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Content */}
        {renderQuestion()}

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-3 mt-8">
          <Button
            variant="ghost"
            onClick={currentStep === 0 ? onCancel : handleBack}
          >
            {currentStep === 0 ? 'Cancel' : 'Back'}
          </Button>
          <Button
            onClick={handleNext}
            disabled={!canProceed()}
          >
            {currentStep === totalSteps - 1 ? 'Complete' : 'Continue'}
          </Button>
        </div>

        {/* Disclaimer */}
        {currentStep < questions.length && (
          <p className="text-xs text-muted-foreground mt-6 text-center">
            This assessment is for informational purposes only and is not a substitute for professional medical advice.
          </p>
        )}
      </Card>
    </div>
  );
};

export default MentalHealthQuestionnaire;
