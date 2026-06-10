import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface FoodItem {
  id: string;
  name: string;
  nameFa?: string;
  category: string;
  carbsPerServing: number;
  proteinPerServing: number;
  fatPerServing: number;
  caloriesPerServing: number;
  giLevel: 'low' | 'medium' | 'high';
  servingUnit: string;
  servingSize: number;
  isIranian: boolean;
  isCustom?: boolean;
}

interface MealLog {
  id: string;
  date: string;
  mealType: string;
  foods: { itemId: string; quantity: number; unit: string }[];
  totalCarbs: number;
  bloodSugarBefore?: number;
  bloodSugarAfter?: number;
  insulinDose?: number;
  notes?: string;
}

interface FoodManagerProps {
  onBack: () => void;
}

// Predefined Iranian food database
const DEFAULT_FOODS: FoodItem[] = [
  {
    id: '1',
    name: 'Sangak Bread',
    nameFa: 'نان سنگک',
    category: 'bread',
    carbsPerServing: 25,
    proteinPerServing: 4,
    fatPerServing: 1,
    caloriesPerServing: 130,
    giLevel: 'medium',
    servingUnit: 'hand',
    servingSize: 1,
    isIranian: true,
  },
  {
    id: '2',
    name: 'Lavash Bread',
    nameFa: 'نان لواش',
    category: 'bread',
    carbsPerServing: 30,
    proteinPerServing: 3,
    fatPerServing: 0.5,
    caloriesPerServing: 140,
    giLevel: 'high',
    servingUnit: 'hand',
    servingSize: 1,
    isIranian: true,
  },
  {
    id: '3',
    name: 'White Rice (Cooked)',
    nameFa: 'برنج سفید پخته',
    category: 'rice',
    carbsPerServing: 45,
    proteinPerServing: 4,
    fatPerServing: 0.5,
    caloriesPerServing: 200,
    giLevel: 'high',
    servingUnit: 'tbsp',
    servingSize: 10,
    isIranian: true,
  },
  {
    id: '4',
    name: 'Brown Rice',
    nameFa: 'برنج قهوه‌ای',
    category: 'rice',
    carbsPerServing: 35,
    proteinPerServing: 5,
    fatPerServing: 1,
    caloriesPerServing: 170,
    giLevel: 'medium',
    servingUnit: 'tbsp',
    servingSize: 10,
    isIranian: false,
  },
  {
    id: '5',
    name: 'Grilled Chicken Breast',
    nameFa: 'سینه مرغ کبابی',
    category: 'protein',
    carbsPerServing: 0,
    proteinPerServing: 31,
    fatPerServing: 3,
    caloriesPerServing: 150,
    giLevel: 'low',
    servingUnit: 'matchbox',
    servingSize: 3,
    isIranian: false,
  },
  {
    id: '6',
    name: 'Lamb Kebab',
    nameFa: 'کباب بره',
    category: 'protein',
    carbsPerServing: 0,
    proteinPerServing: 25,
    fatPerServing: 15,
    caloriesPerServing: 240,
    giLevel: 'low',
    servingUnit: 'matchbox',
    servingSize: 3,
    isIranian: true,
  },
  {
    id: '7',
    name: 'Ghormeh Sabzi',
    nameFa: 'قرمه سبزی',
    category: 'stew',
    carbsPerServing: 15,
    proteinPerServing: 20,
    fatPerServing: 12,
    caloriesPerServing: 250,
    giLevel: 'medium',
    servingUnit: 'bowl',
    servingSize: 1,
    isIranian: true,
  },
  {
    id: '8',
    name: 'Fesenjan',
    nameFa: 'فسنجان',
    category: 'stew',
    carbsPerServing: 20,
    proteinPerServing: 18,
    fatPerServing: 18,
    caloriesPerServing: 300,
    giLevel: 'medium',
    servingUnit: 'bowl',
    servingSize: 1,
    isIranian: true,
  },
  {
    id: '9',
    name: 'Greek Yogurt',
    nameFa: 'ماست یونانی',
    category: 'dairy',
    carbsPerServing: 6,
    proteinPerServing: 10,
    fatPerServing: 0,
    caloriesPerServing: 60,
    giLevel: 'low',
    servingUnit: 'bowl',
    servingSize: 0.5,
    isIranian: false,
  },
  {
    id: '10',
    name: 'Persian Salad (Shirazi)',
    nameFa: 'سالاد شیرازی',
    category: 'vegetable',
    carbsPerServing: 8,
    proteinPerServing: 1,
    fatPerServing: 0,
    caloriesPerServing: 40,
    giLevel: 'low',
    servingUnit: 'bowl',
    servingSize: 1,
    isIranian: true,
  },
  {
    id: '11',
    name: 'Dates',
    nameFa: 'خرما',
    category: 'fruit',
    carbsPerServing: 18,
    proteinPerServing: 0.5,
    fatPerServing: 0,
    caloriesPerServing: 70,
    giLevel: 'high',
    servingUnit: 'piece',
    servingSize: 3,
    isIranian: true,
  },
  {
    id: '12',
    name: 'Walnuts',
    nameFa: 'گردو',
    category: 'snack',
    carbsPerServing: 4,
    proteinPerServing: 4,
    fatPerServing: 18,
    caloriesPerServing: 180,
    giLevel: 'low',
    servingUnit: 'piece',
    servingSize: 5,
    isIranian: true,
  },
];

const MEAL_TYPES = [
  { id: 'breakfast', name: 'Breakfast', nameFa: 'صبحانه', time: '7:00-8:00' },
  {
    id: 'pre_lunch',
    name: 'Pre-Lunch Snack',
    nameFa: 'میان‌وعده قبل ناهار',
    time: '10:00-11:00',
  },
  { id: 'lunch', name: 'Lunch', nameFa: 'ناهار', time: '12:00-13:30' },
  {
    id: 'afternoon_snack',
    name: 'Afternoon Snack',
    nameFa: 'عصرانه',
    time: '16:00-17:00',
  },
  { id: 'dinner', name: 'Dinner', nameFa: 'شام', time: '19:00-20:30' },
  {
    id: 'bedtime',
    name: 'Bedtime Snack',
    nameFa: 'قبل از خواب',
    time: '22:00-23:00',
  },
];

const CATEGORIES = [
  { id: 'all', name: 'All', nameFa: 'همه' },
  { id: 'bread', name: 'Bread & Grains', nameFa: 'نان و غلات' },
  { id: 'rice', name: 'Rice', nameFa: 'برنج' },
  { id: 'protein', name: 'Protein', nameFa: 'پروتئین' },
  { id: 'vegetable', name: 'Vegetables', nameFa: 'سبزیجات' },
  { id: 'fruit', name: 'Fruits', nameFa: 'میوه‌ها' },
  { id: 'dairy', name: 'Dairy', nameFa: 'لبنیات' },
  { id: 'snack', name: 'Snacks', nameFa: 'تنقلات' },
  { id: 'beverage', name: 'Beverages', nameFa: 'نوشیدنی‌ها' },
  { id: 'stew', name: 'Stews', nameFa: 'خورش‌ها' },
  { id: 'custom', name: 'My Foods', nameFa: 'غذاهای من' },
];

export default function FoodManager({ onBack }: FoodManagerProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'fa' || i18n.language === 'ar';

  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [mealLogs, setMealLogs] = useState<MealLog[]>([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0],
  );
  const [selectedMealType, setSelectedMealType] = useState<string>('breakfast');
  const [selectedFoods, setSelectedFoods] = useState<
    { itemId: string; quantity: number; unit: string }[]
  >([]);
  const [bloodSugarBefore, setBloodSugarBefore] = useState('');
  const [bloodSugarAfter, setBloodSugarAfter] = useState('');
  const [insulinDose, setInsulinDose] = useState('');
  const [notes, setNotes] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddFoodModal, setShowAddFoodModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // New food form
  const [newFoodName, setNewFoodName] = useState('');
  const [newFoodNameFa, setNewFoodNameFa] = useState('');
  const [newFoodCategory, setNewFoodCategory] = useState('');
  const [newFoodCarbs, setNewFoodCarbs] = useState('');
  const [newFoodProtein, setNewFoodProtein] = useState('');
  const [newFoodFat, setNewFoodFat] = useState('');
  const [newFoodCalories, setNewFoodCalories] = useState('');
  const [newFoodGiLevel, setNewFoodGiLevel] = useState<
    'low' | 'medium' | 'high'
  >('medium');
  const [newFoodServingUnit, setNewFoodServingUnit] = useState('');
  const [newFoodServingSize, setNewFoodServingSize] = useState('');

  useEffect(() => {
    // Load custom foods from localStorage
    const savedCustomFoods = localStorage.getItem('omni_custom_foods');
    const customFoods = savedCustomFoods ? JSON.parse(savedCustomFoods) : [];
    setFoods([...DEFAULT_FOODS, ...customFoods]);

    const savedMeals = localStorage.getItem('omni_meals');
    if (savedMeals) {
      setMealLogs(JSON.parse(savedMeals));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('omni_meals', JSON.stringify(mealLogs));
  }, [mealLogs]);

  const saveCustomFood = () => {
    if (!newFoodName || !newFoodCarbs) return;

    const newFood: FoodItem = {
      id: `custom_${Date.now()}`,
      name: newFoodName,
      nameFa: newFoodNameFa || undefined,
      category: newFoodCategory || 'other',
      carbsPerServing: parseFloat(newFoodCarbs),
      proteinPerServing: parseFloat(newFoodProtein) || 0,
      fatPerServing: parseFloat(newFoodFat) || 0,
      caloriesPerServing: parseFloat(newFoodCalories) || 0,
      giLevel: newFoodGiLevel,
      servingUnit: newFoodServingUnit || 'serving',
      servingSize: parseFloat(newFoodServingSize) || 1,
      isIranian: false,
      isCustom: true,
    };

    const savedCustomFoods = localStorage.getItem('omni_custom_foods');
    const customFoods = savedCustomFoods ? JSON.parse(savedCustomFoods) : [];
    const updatedCustomFoods = [...customFoods, newFood];
    localStorage.setItem(
      'omni_custom_foods',
      JSON.stringify(updatedCustomFoods),
    );

    setFoods([...DEFAULT_FOODS, ...updatedCustomFoods]);
    resetAddFoodForm();
  };

  const deleteCustomFood = (foodId: string) => {
    const savedCustomFoods = localStorage.getItem('omni_custom_foods');
    let customFoods = savedCustomFoods ? JSON.parse(savedCustomFoods) : [];
    customFoods = customFoods.filter((f: FoodItem) => f.id !== foodId);
    localStorage.setItem('omni_custom_foods', JSON.stringify(customFoods));
    setFoods([...DEFAULT_FOODS, ...customFoods]);
  };

  const getTodayMeals = () => {
    return mealLogs.filter((log) => log.date === selectedDate);
  };

  const getMealForType = (type: string) => {
    return mealLogs.find(
      (log) => log.date === selectedDate && log.mealType === type,
    );
  };

  // FIXED: Calculate meal carbs by finding the food item from the foods array
  const calculateMealCarbs = (
    selectedFoods: { itemId: string; quantity: number; unit: string }[],
  ) => {
    return selectedFoods.reduce((total, sf) => {
      const food = foods.find((f) => f.id === sf.itemId);
      if (!food) return total;
      const multiplier = sf.quantity / food.servingSize;
      return total + food.carbsPerServing * multiplier;
    }, 0);
  };

  const addMealLog = () => {
    if (selectedFoods.length === 0) return;

    const totalCarbs = calculateMealCarbs(selectedFoods);
    const newLog: MealLog = {
      id: Date.now().toString(),
      date: selectedDate,
      mealType: selectedMealType,
      foods: selectedFoods,
      totalCarbs,
      bloodSugarBefore: bloodSugarBefore
        ? parseInt(bloodSugarBefore)
        : undefined,
      bloodSugarAfter: bloodSugarAfter ? parseInt(bloodSugarAfter) : undefined,
      insulinDose: insulinDose ? parseInt(insulinDose) : undefined,
      notes: notes || undefined,
    };

    const filtered = mealLogs.filter(
      (log) =>
        !(log.date === selectedDate && log.mealType === selectedMealType),
    );
    setMealLogs([newLog, ...filtered]);
    setSelectedFoods([]);
    setBloodSugarBefore('');
    setBloodSugarAfter('');
    setInsulinDose('');
    setNotes('');
    setShowAddModal(false);
  };

  const deleteMealLog = (id: string) => {
    setMealLogs(mealLogs.filter((log) => log.id !== id));
  };

  const resetAddFoodForm = () => {
    setShowAddFoodModal(false);
    setNewFoodName('');
    setNewFoodNameFa('');
    setNewFoodCategory('');
    setNewFoodCarbs('');
    setNewFoodProtein('');
    setNewFoodFat('');
    setNewFoodCalories('');
    setNewFoodGiLevel('medium');
    setNewFoodServingUnit('');
    setNewFoodServingSize('');
  };

  const getGiColor = (gi: string) => {
    switch (gi) {
      case 'low':
        return 'text-green-600 dark:text-green-400';
      case 'medium':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'high':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-500';
    }
  };

  const getGiLabel = (gi: string) => {
    switch (gi) {
      case 'low':
        return t('food.low_gi');
      case 'medium':
        return t('food.medium_gi');
      case 'high':
        return t('food.high_gi');
      default:
        return '';
    }
  };

  const filteredFoods = foods.filter((food) => {
    const matchesCategory =
      selectedCategory === 'all' ||
      (selectedCategory === 'custom'
        ? food.isCustom
        : food.category === selectedCategory);
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      searchTerm === '' ||
      food.name.toLowerCase().includes(searchLower) ||
      (food.nameFa && food.nameFa.includes(searchLower));
    return matchesCategory && matchesSearch;
  });

  const currentMeal = getMealForType(selectedMealType);
  const dailyTotalCarbs = getTodayMeals().reduce(
    (sum, meal) => sum + meal.totalCarbs,
    0,
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className='space-y-6'
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      <div className='flex items-center justify-between flex-wrap gap-4'>
        <button
          onClick={onBack}
          className='flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-all'
        >
          <i className='fas fa-arrow-left text-sm'></i> {t('nav.back')}
        </button>
        <div className='flex items-center gap-3'>
          <input
            type='date'
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className='px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300'
          />
          <button
            onClick={() => setShowAddModal(true)}
            className='px-4 py-1.5 bg-gray-800 dark:bg-gray-700 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-600 transition-all flex items-center gap-2 text-sm'
          >
            <i className='fas fa-plus text-xs'></i> {t('food.log_meal')}
          </button>
          <button
            onClick={() => setShowAddFoodModal(true)}
            className='px-4 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all flex items-center gap-2 text-sm'
          >
            <i className='fas fa-apple-alt text-xs'></i> {t('food.add_food')}
          </button>
        </div>
      </div>

      {/* Daily Summary Cards */}
      <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('food.total_carbs_today')}
          </div>
          <div className='text-2xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {dailyTotalCarbs}g
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('food.meals_logged')}
          </div>
          <div className='text-2xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            {getTodayMeals().length}/6
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('food.avg_blood_sugar')}
          </div>
          <div className='text-2xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            —
          </div>
        </div>
        <div className='bg-white dark:bg-gray-900 rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800'>
          <div className='text-xs text-gray-400 uppercase tracking-wide'>
            {t('food.target_carbs')}
          </div>
          <div className='text-2xl font-light text-gray-700 dark:text-gray-300 mt-1'>
            ~150g
          </div>
        </div>
      </div>

      {/* Meal Type Tabs */}
      <div className='flex overflow-x-auto gap-2 pb-2'>
        {MEAL_TYPES.map((meal) => (
          <button
            key={meal.id}
            onClick={() => setSelectedMealType(meal.id)}
            className={`px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              selectedMealType === meal.id
                ? 'bg-gray-800 dark:bg-gray-700 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {isRTL ? meal.nameFa : meal.name}
            <span className='text-xs ml-1 opacity-60'>{meal.time}</span>
          </button>
        ))}
      </div>

      {/* Current Meal Display */}
      <div className='bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-800'>
        {currentMeal ? (
          <div>
            <div className='flex justify-between items-start mb-4'>
              <h3 className='font-medium text-gray-700 dark:text-gray-300'>
                {t('food.logged_meal')}{' '}
                {currentMeal.foods.length > 0 &&
                  `(${currentMeal.foods.length} ${t('food.items')})`}
              </h3>
              <button
                onClick={() => deleteMealLog(currentMeal.id)}
                className='text-gray-400 hover:text-red-500 transition'
              >
                <i className='fas fa-trash-alt text-xs'></i>
              </button>
            </div>
            <div className='space-y-2'>
              {currentMeal.foods.map((food, idx) => {
                const foodItem = foods.find((f) => f.id === food.itemId);
                if (!foodItem) return null;
                return (
                  <div key={idx} className='flex justify-between text-sm'>
                    <span className='text-gray-600 dark:text-gray-400'>
                      {isRTL && foodItem.nameFa
                        ? foodItem.nameFa
                        : foodItem.name}
                    </span>
                    <span className='text-gray-500 dark:text-gray-500'>
                      {food.quantity} {food.unit}
                    </span>
                  </div>
                );
              })}
              <div className='border-t border-gray-100 dark:border-gray-800 pt-2 mt-2'>
                <div className='flex justify-between text-sm font-medium'>
                  <span>{t('food.total_carbs')}</span>
                  <span className='text-blue-600 dark:text-blue-400'>
                    {currentMeal.totalCarbs}g
                  </span>
                </div>
                {currentMeal.bloodSugarBefore && (
                  <div className='flex justify-between text-sm'>
                    <span>{t('food.blood_sugar_before')}</span>
                    <span>{currentMeal.bloodSugarBefore} mg/dL</span>
                  </div>
                )}
                {currentMeal.insulinDose && (
                  <div className='flex justify-between text-sm'>
                    <span>{t('food.insulin_dose')}</span>
                    <span>
                      {currentMeal.insulinDose} {t('food.units')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className='text-center py-8 text-gray-500 dark:text-gray-400'>
            <i className='fas fa-utensils text-3xl mb-2 opacity-50'></i>
            <p className='text-sm'>
              {t('food.no_meal_logged')}{' '}
              {isRTL
                ? MEAL_TYPES.find((m) => m.id === selectedMealType)?.nameFa
                : MEAL_TYPES.find((m) => m.id === selectedMealType)?.name}
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className='mt-3 text-sm text-blue-600 dark:text-blue-400 hover:underline'
            >
              {t('food.log_meal')} →
            </button>
          </div>
        )}
      </div>

      {/* Add Meal Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4'>
                {t('food.log_meal')} -{' '}
                {isRTL
                  ? MEAL_TYPES.find((m) => m.id === selectedMealType)?.nameFa
                  : MEAL_TYPES.find((m) => m.id === selectedMealType)?.name}
              </h3>

              {/* Category Filter */}
              <div className='flex flex-wrap gap-2 mb-4'>
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 text-xs rounded-full transition ${
                      selectedCategory === cat.id
                        ? 'bg-gray-800 dark:bg-gray-700 text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {isRTL ? cat.nameFa : cat.name}
                  </button>
                ))}
              </div>

              {/* Search */}
              <div className='relative mb-4'>
                <i className='fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs'></i>
                <input
                  type='text'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder={t('food.search_foods')}
                  className='w-full pl-8 pr-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                />
              </div>

              {/* Food List */}
              <div className='space-y-2 max-h-60 overflow-y-auto mb-4'>
                {filteredFoods.map((food) => (
                  <div
                    key={food.id}
                    className='flex items-center justify-between p-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition'
                  >
                    <div>
                      <div className='font-medium text-sm text-gray-800 dark:text-gray-200'>
                        {isRTL && food.nameFa ? food.nameFa : food.name}
                        {food.isCustom && (
                          <span className='ml-2 text-xs bg-green-100 text-green-600 px-1 rounded'>
                            {t('food.custom')}
                          </span>
                        )}
                      </div>
                      <div className='flex gap-3 text-xs text-gray-500 mt-0.5'>
                        <span>
                          {food.carbsPerServing}g {t('food.carbs')}
                        </span>
                        <span className={getGiColor(food.giLevel)}>
                          {getGiLabel(food.giLevel)}
                        </span>
                        <span>1 {food.servingUnit}</span>
                      </div>
                    </div>
                    <div className='flex gap-1'>
                      {food.isCustom && (
                        <button
                          onClick={() => deleteCustomFood(food.id)}
                          className='px-2 py-1 text-xs text-red-500 hover:text-red-700'
                        >
                          <i className='fas fa-trash-alt'></i>
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const existing = selectedFoods.find(
                            (f) => f.itemId === food.id,
                          );
                          if (existing) {
                            setSelectedFoods(
                              selectedFoods.map((f) =>
                                f.itemId === food.id
                                  ? { ...f, quantity: f.quantity + 1 }
                                  : f,
                              ),
                            );
                          } else {
                            setSelectedFoods([
                              ...selectedFoods,
                              {
                                itemId: food.id,
                                quantity: 1,
                                unit: food.servingUnit,
                              },
                            ]);
                          }
                        }}
                        className='px-3 py-1 text-xs bg-gray-100 dark:bg-gray-800 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition'
                      >
                        <i className='fas fa-plus'></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selected Foods */}
              {selectedFoods.length > 0 && (
                <div className='mb-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'>
                  <h4 className='text-sm font-medium mb-2 text-gray-700 dark:text-gray-300'>
                    {t('food.selected_foods')}:
                  </h4>
                  {selectedFoods.map((sf, idx) => {
                    const food = foods.find((f) => f.id === sf.itemId);
                    return (
                      <div
                        key={idx}
                        className='flex justify-between items-center text-sm mb-1'
                      >
                        <span>
                          {isRTL && food?.nameFa ? food.nameFa : food?.name}
                        </span>
                        <div className='flex items-center gap-2'>
                          <button
                            onClick={() => {
                              const newQuantity = sf.quantity - 1;
                              if (newQuantity <= 0) {
                                setSelectedFoods(
                                  selectedFoods.filter(
                                    (f) => f.itemId !== sf.itemId,
                                  ),
                                );
                              } else {
                                setSelectedFoods(
                                  selectedFoods.map((f) =>
                                    f.itemId === sf.itemId
                                      ? { ...f, quantity: newQuantity }
                                      : f,
                                  ),
                                );
                              }
                            }}
                            className='text-gray-500 hover:text-red-500'
                          >
                            <i className='fas fa-minus-circle text-xs'></i>
                          </button>
                          <span>
                            {sf.quantity} {sf.unit}
                            {sf.quantity > 1 ? 's' : ''}
                          </span>
                          <button
                            onClick={() =>
                              setSelectedFoods(
                                selectedFoods.map((f) =>
                                  f.itemId === sf.itemId
                                    ? { ...f, quantity: f.quantity + 1 }
                                    : f,
                                ),
                              )
                            }
                            className='text-gray-500 hover:text-green-500'
                          >
                            <i className='fas fa-plus-circle text-xs'></i>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                  <div className='border-t border-gray-200 dark:border-gray-700 mt-2 pt-2 text-sm font-medium'>
                    {t('food.total_carbs')}: {calculateMealCarbs(selectedFoods)}
                    g
                  </div>
                </div>
              )}

              {/* Blood Sugar & Insulin */}
              <div className='grid grid-cols-2 gap-3 mb-4'>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('food.blood_sugar_before')}
                  </label>
                  <input
                    type='number'
                    value={bloodSugarBefore}
                    onChange={(e) => setBloodSugarBefore(e.target.value)}
                    placeholder='mg/dL'
                    className='w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('food.blood_sugar_after')}
                  </label>
                  <input
                    type='number'
                    value={bloodSugarAfter}
                    onChange={(e) => setBloodSugarAfter(e.target.value)}
                    placeholder='mg/dL'
                    className='w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('food.insulin_dose')}
                  </label>
                  <input
                    type='number'
                    value={insulinDose}
                    onChange={(e) => setInsulinDose(e.target.value)}
                    placeholder={t('food.units')}
                    className='w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800'
                  />
                </div>
                <div>
                  <label className='block text-xs text-gray-500 mb-1'>
                    {t('common.notes')}
                  </label>
                  <input
                    type='text'
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder={t('common.optional')}
                    className='w-full px-3 py-2 text-sm border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800'
                  />
                </div>
              </div>

              <div className='flex gap-3'>
                <button
                  onClick={() => setShowAddModal(false)}
                  className='flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={addMealLog}
                  className='flex-1 px-4 py-2 bg-gray-800 dark:bg-gray-700 text-white rounded-lg text-sm hover:bg-gray-700 dark:hover:bg-gray-600 transition'
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Custom Food Modal */}
      <AnimatePresence>
        {showAddFoodModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className='fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4'
            onClick={() => setShowAddFoodModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className='bg-white dark:bg-gray-900 rounded-2xl p-6 w-full max-w-md max-h-[80vh] overflow-y-auto'
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className='font-medium text-gray-800 dark:text-gray-200 mb-4'>
                <i className='fas fa-apple-alt mr-2 text-green-500'></i>
                {t('food.add_food')}
              </h3>
              <div className='space-y-4'>
                <div className='grid grid-cols-2 gap-3'>
                  <input
                    type='text'
                    value={newFoodName}
                    onChange={(e) => setNewFoodName(e.target.value)}
                    placeholder={t('food.food_name_en')}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                  <input
                    type='text'
                    value={newFoodNameFa}
                    onChange={(e) => setNewFoodNameFa(e.target.value)}
                    placeholder={t('food.food_name_fa')}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <select
                  value={newFoodCategory}
                  onChange={(e) => setNewFoodCategory(e.target.value)}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                >
                  <option value=''>{t('food.select_category')}</option>
                  <option value='bread'>{t('food.bread_grains')}</option>
                  <option value='rice'>{t('food.rice')}</option>
                  <option value='protein'>{t('food.protein')}</option>
                  <option value='vegetable'>{t('food.vegetables')}</option>
                  <option value='fruit'>{t('food.fruits')}</option>
                  <option value='dairy'>{t('food.dairy')}</option>
                  <option value='snack'>{t('food.snacks')}</option>
                  <option value='beverage'>{t('food.beverages')}</option>
                  <option value='stew'>{t('food.stews')}</option>
                </select>
                <div className='grid grid-cols-2 gap-3'>
                  <input
                    type='number'
                    step='0.1'
                    value={newFoodCarbs}
                    onChange={(e) => setNewFoodCarbs(e.target.value)}
                    placeholder={`${t('food.carbs')} (g)`}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                  <input
                    type='number'
                    step='0.1'
                    value={newFoodProtein}
                    onChange={(e) => setNewFoodProtein(e.target.value)}
                    placeholder={`${t('food.protein_g')} (g)`}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <input
                    type='number'
                    step='0.1'
                    value={newFoodFat}
                    onChange={(e) => setNewFoodFat(e.target.value)}
                    placeholder={`${t('food.fat')} (g)`}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                  <input
                    type='number'
                    step='0.1'
                    value={newFoodCalories}
                    onChange={(e) => setNewFoodCalories(e.target.value)}
                    placeholder={`${t('food.calories')}`}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <div className='grid grid-cols-2 gap-3'>
                  <select
                    value={newFoodGiLevel}
                    onChange={(e) => setNewFoodGiLevel(e.target.value as any)}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  >
                    <option value='low'>{t('food.low_gi')}</option>
                    <option value='medium'>{t('food.medium_gi')}</option>
                    <option value='high'>{t('food.high_gi')}</option>
                  </select>
                  <input
                    type='text'
                    value={newFoodServingUnit}
                    onChange={(e) => setNewFoodServingUnit(e.target.value)}
                    placeholder={t('food.serving_unit')}
                    className='w-full px-3 py-2 text-sm border rounded-lg'
                  />
                </div>
                <input
                  type='number'
                  step='0.1'
                  value={newFoodServingSize}
                  onChange={(e) => setNewFoodServingSize(e.target.value)}
                  placeholder={t('food.serving_size')}
                  className='w-full px-3 py-2 text-sm border rounded-lg'
                />
              </div>
              <div className='flex gap-3 mt-6'>
                <button
                  onClick={() => setShowAddFoodModal(false)}
                  className='flex-1 px-4 py-2 border rounded-lg text-sm'
                >
                  {t('common.cancel')}
                </button>
                <button
                  onClick={saveCustomFood}
                  className='flex-1 px-4 py-2 bg-green-600 text-white rounded-lg text-sm'
                >
                  {t('common.save')}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tip Card */}
      <div className='bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 border border-gray-100 dark:border-gray-800'>
        <div className='flex gap-3'>
          <i className='fas fa-lightbulb text-gray-400 text-sm mt-0.5'></i>
          <div>
            <h4 className='font-medium text-sm text-gray-700 dark:text-gray-300 mb-1'>
              {t('food.carb_counting_title')}
            </h4>
            <p className='text-xs text-gray-500 dark:text-gray-400'>
              {t('food.carb_counting_text')}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
