
import { GoogleGenAI, Type } from "@google/genai";
import { UserProfile, CoachResponse, MealAnalysisResponse } from "./types";

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 2000): Promise<T> {
  try {
    return await fn();
  } catch (error: any) {
    const isQuotaError = 
      error.message?.includes("429") || 
      error.message?.includes("quota") || 
      error.message?.includes("RESOURCE_EXHAUSTED") ||
      error.message?.includes("Rpc failed");
      
    if (retries > 0 && isQuotaError) {
      await sleep(delay);
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
}

export const analyzeMealPhoto = async (base64Image: string): Promise<MealAnalysisResponse> => {
  return withRetry(async () => {
    // Standard initialization per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    
    const prompt = `
      Act as a clinical nutritionist expert. Identify food items in this photo.
      
      For EACH item:
      1. Name: Clear specific name.
      2. Calories: Estimate.
      3. Description: Technical breakdown.
      
      Summary:
      - totalCalories: sum.
      - healthAlerts: 2-3 clinical notes.
      - coachVerdict: expert summary.

      STRICT REQUIREMENT: Return ONLY valid JSON.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: {
        parts: [
          { inlineData: { mimeType: "image/jpeg", data: base64Image } },
          { text: prompt }
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  calories: { type: Type.NUMBER },
                  description: { type: Type.STRING }
                },
                required: ["name", "calories"]
              }
            },
            totalCalories: { type: Type.NUMBER },
            healthAlerts: { type: Type.ARRAY, items: { type: Type.STRING } },
            coachVerdict: { type: Type.STRING }
          },
          required: ["items", "totalCalories", "healthAlerts", "coachVerdict"]
        }
      }
    });

    return JSON.parse(response.text.trim());
  });
};

export const generateJeffreyPlan = async (profile: UserProfile): Promise<CoachResponse> => {
  return withRetry(async () => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });
    const bmi = (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);
    
    const prompt = `
      Act as a health coach. Create a plan for:
      - Goal: ${profile.goal}
      - Stats: ${profile.age}yo, ${profile.gender}, ${profile.weight}kg, ${profile.height}cm, BMI: ${bmi}
      - Ethnicity: ${profile.ethnicity}, Diet: ${profile.dietaryPreference}
      - Activity: ${profile.activityLevel}
      - Target: ${profile.targetWeight}kg, Pace: ${profile.pace}kg/week

      Return JSON with dailyPlan and healthTips (bmiAnalysis, targetAnalysis, paceAnalysis).
    `;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            dailyPlan: {
              type: Type.OBJECT,
              properties: {
                dailyNutritionScore: { type: Type.NUMBER },
                estimatedCalorieExpenditure: { type: Type.NUMBER },
                proteinTarget: { type: Type.NUMBER },
                carbsTarget: { type: Type.NUMBER },
                fatTarget: { type: Type.NUMBER },
                calorieTarget: { type: Type.NUMBER }
              },
              required: ["dailyNutritionScore", "estimatedCalorieExpenditure", "proteinTarget", "carbsTarget", "fatTarget", "calorieTarget"]
            },
            healthTips: {
              type: Type.OBJECT,
              properties: {
                bmiAnalysis: {
                  type: Type.OBJECT,
                  properties: {
                    value: { type: Type.STRING },
                    category: { type: Type.STRING },
                    tip: { type: Type.STRING }
                  },
                  required: ["value", "category", "tip"]
                },
                targetAnalysis: {
                  type: Type.OBJECT,
                  properties: { tip: { type: Type.STRING } },
                  required: ["tip"]
                },
                paceAnalysis: {
                  type: Type.OBJECT,
                  properties: { tip: { type: Type.STRING } },
                  required: ["tip"]
                }
              },
              required: ["bmiAnalysis", "targetAnalysis", "paceAnalysis"]
            }
          },
          required: ["dailyPlan", "healthTips"]
        }
      }
    });
    
    return JSON.parse(response.text.trim());
  });
};
