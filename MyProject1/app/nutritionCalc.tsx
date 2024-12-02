// nutritionCalculator.tsx

const nutritionData = [
    { calories: 1200, grains: 1.5, protein: 3, dairy: 1.5, vegetables: 3, fruits: 2, oils: 4 },
    { calories: 1500, grains: 2.5, protein: 4, dairy: 1.5, vegetables: 3, fruits: 2, oils: 4 },
    { calories: 1800, grains: 3, protein: 5, dairy: 1.5, vegetables: 3, fruits: 3, oils: 5 },
    { calories: 2000, grains: 3, protein: 6, dairy: 1.5, vegetables: 4, fruits: 3, oils: 6 },
    { calories: 2200, grains: 3.5, protein: 6, dairy: 1.5, vegetables: 4, fruits: 3.5, oils: 6 },
    { calories: 2500, grains: 4, protein: 7, dairy: 1.5, vegetables: 5, fruits: 4, oils: 7 },
    { calories: 2700, grains: 4, protein: 8, dairy: 2, vegetables: 5, fruits: 4, oils: 8 },
  ];
  
  // 四捨五入至最近的 0.5
  const roundToNearestHalf = (num: number): number => {
    return Math.round(num * 2) / 2;
  };
  
  // 卡路里到營養素換算函數
  export const interpolateNutrition = (inputCalories: number) => {
    if (inputCalories < 1200) return nutritionData[0];
    if (inputCalories > 2700) return nutritionData[nutritionData.length - 1];
  
    for (let i = 0; i < nutritionData.length - 1; i++) {
      const lower = nutritionData[i];
      const upper = nutritionData[i + 1];
      if (inputCalories >= lower.calories && inputCalories <= upper.calories) {
        const ratio = (inputCalories - lower.calories) / (upper.calories - lower.calories);
        return {
          grains: roundToNearestHalf(lower.grains + (upper.grains - lower.grains) * ratio),
          protein: roundToNearestHalf(lower.protein + (upper.protein - lower.protein) * ratio),
          dairy: roundToNearestHalf(lower.dairy + (upper.dairy - lower.dairy) * ratio),
          vegetables: roundToNearestHalf(lower.vegetables + (upper.vegetables - lower.vegetables) * ratio),
          fruits: roundToNearestHalf(lower.fruits + (upper.fruits - lower.fruits) * ratio),
          oils: roundToNearestHalf(lower.oils + (upper.oils - lower.oils) * ratio),
        };
      }
    }
    return null;
  };
  