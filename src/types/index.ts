export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface DailyGoal extends NutritionInfo {}

export interface MLPrediction {
  class: string;
  classId: string;
  confidence: number;
}

export interface MLDetectionResult {
  predictions: MLPrediction[];
  processingTime?: number;
}

export interface FoodDetectionRequest {
  imageBase64: string;
  userId: string;
  portionSize?: number;
  portionUnit?: string;
}

export interface FoodDetectionResponse {
  success: boolean;
  data?: {
    detections: {
      predictedClass: string;
      confidence: number;
      nutrition?: NutritionInfo;
    }[];
    imageUrl: string;
  };
  error?: string;
}

export interface DailySummary {
  date: Date;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  totalFiber: number;
  mealCount: number;
  foods: {
    id: number;
    name: string;
    calories: number;
    portionSize: number;
    portionUnit: string;
    detectedAt: Date;
  }[];
}

export interface HistoryFilters {
  startDate?: Date;
  endDate?: Date;
  category?: string;
}

export interface MenuRecommendation {
  id: number;
  name: string;
  description?: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  imageUrl?: string;
  category: "breakfast" | "lunch" | "dinner" | "snack";
  tags: string[];
}

export interface WeeklyStats {
  weekStart: Date;
  weekEnd: Date;
  dailyAverages: {
    day: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  }[];
  totalMeals: number;
  mostFrequentFood?: string;
}

// NextAuth type augmentation
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
  }
}