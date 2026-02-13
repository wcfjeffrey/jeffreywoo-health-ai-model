
export type Language = 'en' | 'zh';

export type Goal = 'Weight Loss' | 'Weight Gain' | 'Maintain Weight';
export type Gender = 'Male' | 'Female';
export type ActivityLevel = 'Sedentary' | 'Lightly Active' | 'Moderately Active' | 'Highly Active';
export type Ethnicity = 'Asian' | 'Black' | 'Hispanic' | 'White' | 'Pacific Islander' | 'Middle Eastern' | 'Native American' | 'Mixed' | 'Prefer not to say';

export interface UserProfile {
  name: string;
  goal: Goal;
  gender: Gender;
  age: number;
  height: number; // in cm
  weight: number; // in kg
  ethnicity: Ethnicity;
  dietaryPreference: string;
  activityLevel: ActivityLevel;
  targetWeight: number;
  pace: number; // kg per week
  language: Language;
  streak: number;
  lastActive: string;
  points: number;
  bookmarks: FoodItem[];
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  score: number;
}

export interface MealItemRecognition {
  name: string;
  calories: number;
  description?: string;
}

export interface LoggedMeal {
  id: string;
  timestamp: string;
  items: MealItemRecognition[];
  totalCalories: number;
  healthAlerts: string[];
  coachVerdict?: string;
  photoUrl?: string;
  portion: number;
}

export interface DailyPlan {
  dailyNutritionScore: number;
  estimatedCalorieExpenditure: number;
  proteinTarget: number;
  carbsTarget: number;
  fatTarget: number;
  calorieTarget: number;
}

export interface CoachResponse {
  dailyPlan: DailyPlan;
  healthTips: {
    bmiAnalysis: {
      value: string;
      category: string;
      tip: string;
    };
    targetAnalysis: {
      tip: string;
    };
    paceAnalysis: {
      tip: string;
    };
  };
}

export interface MealAnalysisResponse {
  items: MealItemRecognition[];
  totalCalories: number;
  healthAlerts: string[];
  coachVerdict: string;
}
