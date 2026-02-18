
import { UserProfile } from './types';

export const INITIAL_PROFILE: UserProfile = {
  name: '',
  goal: 'Maintain Weight',
  gender: 'Male',
  age: 30,
  height: 175,
  weight: 70,
  ethnicity: 'Prefer not to say',
  dietaryPreference: 'No Preference',
  activityLevel: 'Moderately Active',
  targetWeight: 70,
  pace: 0.5,
  language: 'en',
  streak: 0,
  lastActive: new Date().toISOString(),
  points: 0,
  bookmarks: []
};

export const ETHNICITIES = [
  'Asian', 'Black', 'Hispanic', 'White', 'Pacific Islander', 
  'Middle Eastern', 'Native American', 'Mixed', 'Prefer not to say'
];

export const ACTIVITY_LEVELS = [
  'Sedentary', 'Lightly Active', 'Moderately Active', 'Highly Active'
];

export const DIETARY_PREFERENCES = [
  'No Preference', 'Vegetarian', 'Vegan', 'Pescatarian', 'Keto', 'Paleo'
];

export const TRANSLATIONS = {
  en: {
    welcome: "JeffreyWooHealth",
    tagline: "Your Daily Body & Habit Guide",
    onboarding: "Start Your Transformation",
    track: "Track Meal",
    dashboard: "Today",
    tracker: "Diary",
    plan: "My Plan",
    bookmarks: "Bookmarks",
    bmi: "BMI Analysis",
    target: "Target Weight",
    pace: "Weekly Pace",
    score: "Daily Score",
    expenditure: "Daily Burn",
    protein: "Protein",
    carbs: "Carbs",
    fat: "Fat",
    alerts: "Health Alerts",
    total: "Total Calories"
  },
  zh: {
    welcome: "JeffreyWooHealth",
    tagline: "您的日常身材與習慣指南",
    onboarding: "開啟您的蛻變之旅",
    track: "記錄飲食",
    dashboard: "今日",
    tracker: "日記",
    plan: "我的計劃",
    bookmarks: "收藏夾",
    bmi: "BMI 分析",
    target: "目標體重",
    pace: "每週進度",
    score: "每日評分",
    expenditure: "每日消耗",
    protein: "蛋白質",
    carbs: "碳水",
    fat: "脂肪",
    alerts: "健康提示",
    total: "總熱量"
  }
};
