
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
    tagline: "您的日常身材与习惯指南",
    onboarding: "开启您的蜕变之旅",
    track: "记录饮食",
    dashboard: "今日",
    tracker: "日记",
    plan: "我的计划",
    bookmarks: "收藏夹",
    bmi: "BMI 分析",
    target: "目标体重",
    pace: "每周进度",
    score: "每日评分",
    expenditure: "每日消耗",
    protein: "蛋白质",
    carbs: "碳水",
    fat: "脂肪",
    alerts: "健康提示",
    total: "总热量"
  }
};
