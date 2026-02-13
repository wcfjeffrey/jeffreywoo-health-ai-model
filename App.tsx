
import React, { useState, useEffect } from 'react';
import { 
  Layout, Camera, Bookmark, Flame, Award, 
  Search, Plus, X, Loader2, CheckCircle2, 
  History, Info, TrendingUp, ChevronRight,
  User, Activity, Target, Utensils, Bell, 
  ChevronLeft, Sparkles, Scale, AlertTriangle, ExternalLink, Key,
  Focus, Scan, Heart, LogOut, Settings, RotateCcw,
  Zap, BrainCircuit, ShieldCheck, ClipboardCheck, Lock, Trash2
} from 'lucide-react';
import { 
  UserProfile, CoachResponse, LoggedMeal, 
  MealAnalysisResponse, FoodItem, Ethnicity, Goal, Gender, ActivityLevel, MealItemRecognition 
} from './types';
import { 
  INITIAL_PROFILE, ETHNICITIES, 
  ACTIVITY_LEVELS, DIETARY_PREFERENCES 
} from './constants';
import { generateJeffreyPlan, analyzeMealPhoto } from './geminiService';

const OnboardingStep = ({ title, description, children, onNext, onPrev, isLast, nextLabel = "Continue" }: any) => (
  <div className="flex flex-col space-y-6 w-full max-w-lg mx-auto bg-white p-10 rounded-[48px] shadow-2xl border border-slate-100 animate-in fade-in slide-in-from-bottom-6 duration-700">
    <div className="space-y-2">
      <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none">{title}</h3>
      {description && <p className="text-slate-500 font-medium">{description}</p>}
    </div>
    <div className="flex-1 py-4">{children}</div>
    <div className="flex gap-4">
      {onPrev && (
        <button onClick={onPrev} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-3xl font-black hover:bg-slate-100 transition-all flex items-center justify-center gap-2">
          <ChevronLeft size={20} /> Back
        </button>
      )}
      <button 
        onClick={onNext} 
        className="flex-[2] py-4 bg-indigo-600 text-white rounded-3xl font-black shadow-xl shadow-indigo-100 hover:bg-indigo-700 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
      >
        {nextLabel} <ChevronRight size={20} />
      </button>
    </div>
  </div>
);

export default function App() {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem('jeffrey_v2_profile');
    return saved ? JSON.parse(saved) : INITIAL_PROFILE;
  });
  
  const [meals, setMeals] = useState<LoggedMeal[]>(() => {
    const saved = localStorage.getItem('jeffrey_v2_meals');
    return saved ? JSON.parse(saved) : [];
  });

  const [coachData, setCoachData] = useState<CoachResponse | null>(() => {
    const saved = localStorage.getItem('jeffrey_v2_coach');
    return saved ? JSON.parse(saved) : null;
  });

  const [step, setStep] = useState(0);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isLoading, setIsLoading] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [photoAnalysis, setPhotoAnalysis] = useState<MealAnalysisResponse | null>(null);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [portion, setPortion] = useState(1.0);

  const bmi = (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1);

  useEffect(() => {
    localStorage.setItem('jeffrey_v2_profile', JSON.stringify(profile));
    localStorage.setItem('jeffrey_v2_meals', JSON.stringify(meals));
    localStorage.setItem('jeffrey_v2_coach', JSON.stringify(coachData));
  }, [profile, meals, coachData]);

  const handleReset = () => {
    if (confirm("Reset everything and start over?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const handleSaveItem = (item: MealItemRecognition) => {
    const isAlreadySaved = profile.bookmarks.some(b => b.name === item.name);
    if (isAlreadySaved) {
      alert("Item already in your favorites!");
      return;
    }
    
    const newItem: FoodItem = {
      id: Math.random().toString(36).substr(2, 9),
      name: item.name,
      calories: item.calories,
      protein: 0,
      carbs: 0,
      fats: 0,
      score: 0
    };
    
    setProfile(p => ({
      ...p,
      bookmarks: [...p.bookmarks, newItem]
    }));
  };

  const handleRemoveItem = (id: string) => {
    setProfile(p => ({
      ...p,
      bookmarks: p.bookmarks.filter(b => b.id !== id)
    }));
  };

  const generatePlan = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const data = await generateJeffreyPlan(profile);
      setCoachData(data);
      setStep(0);
    } catch (e: any) {
      console.error(e);
      setErrorMessage(e.message || "Failed to generate plan. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = (reader.result as string).split(',')[1];
      setTempImage(reader.result as string);
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const analysis = await analyzeMealPhoto(base64);
        setPhotoAnalysis(analysis);
        setPortion(1.0);
      } catch (err: any) {
        console.error(err);
        setErrorMessage(err.message || "Meal analysis failed. Ensure your photo is clear.");
      } finally {
        setIsLoading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveMeal = () => {
    if (!photoAnalysis) return;
    const meal: LoggedMeal = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      items: photoAnalysis.items.map(it => ({ ...it, calories: Math.round(it.calories * portion) })),
      totalCalories: Math.round(photoAnalysis.totalCalories * portion),
      healthAlerts: photoAnalysis.healthAlerts,
      coachVerdict: photoAnalysis.coachVerdict,
      photoUrl: tempImage || undefined,
      portion
    };
    setMeals([meal, ...meals]);
    setProfile(p => ({ ...p, streak: p.streak + 1, points: p.points + 10 }));
    setPhotoAnalysis(null);
    setTempImage(null);
    setIsCapturing(false);
  };

  const onboardingFlow = [
    <OnboardingStep title="Who are we training?" description="Your name will be on your personal blueprint." onNext={() => setStep(1)}>
      <input type="text" className="w-full p-6 bg-slate-50 rounded-3xl border-none focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-2xl" placeholder="E.g. Jeffrey" value={profile.name} onChange={e => setProfile({...profile, name: e.target.value})} />
    </OnboardingStep>,
    <OnboardingStep title="Primary Goal" onNext={() => setStep(2)} onPrev={() => setStep(0)}>
      <div className="grid grid-cols-1 gap-4">
        {['Weight Loss', 'Weight Gain', 'Maintain Weight'].map((g: any) => (
          <button key={g} onClick={() => setProfile({...profile, goal: g})} className={`p-6 rounded-[32px] font-black text-left border-2 flex items-center justify-between ${profile.goal === g ? 'bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100' : 'bg-slate-50 border-transparent text-slate-600 hover:bg-slate-100'}`}>
            {g} {profile.goal === g && <CheckCircle2 size={24} />}
          </button>
        ))}
      </div>
    </OnboardingStep>,
    <OnboardingStep title="Metabolism Core" onNext={() => setStep(3)} onPrev={() => setStep(1)}>
      <div className="space-y-8">
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Birth Gender</label>
          <div className="flex bg-slate-100 p-1.5 rounded-[24px]">
            {['Male', 'Female'].map((g: any) => (
              <button key={g} onClick={() => setProfile({...profile, gender: g})} className={`flex-1 py-4 rounded-2xl font-black transition-all ${profile.gender === g ? 'bg-white shadow-lg text-indigo-600' : 'text-slate-400'}`}>{g}</button>
            ))}
          </div>
        </div>
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Age</label>
          <input type="number" className="w-full p-6 bg-slate-50 rounded-3xl font-bold text-xl" value={profile.age} onChange={e => setProfile({...profile, age: +e.target.value})} />
        </div>
      </div>
    </OnboardingStep>,
    <OnboardingStep title="Physical Stats" onNext={() => setStep(4)} onPrev={() => setStep(2)}>
      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Height (cm)</label>
          <input type="number" className="w-full p-6 bg-slate-50 rounded-3xl font-bold text-xl" value={profile.height} onChange={e => setProfile({...profile, height: +e.target.value})} />
        </div>
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Weight (kg)</label>
          <input type="number" className="w-full p-6 bg-slate-50 rounded-3xl font-bold text-xl" value={profile.weight} onChange={e => setProfile({...profile, weight: +e.target.value})} />
        </div>
      </div>
    </OnboardingStep>,
    <OnboardingStep title="Body Heritage" onNext={() => setStep(5)} onPrev={() => setStep(3)}>
      <div className="grid grid-cols-2 gap-3">
        {ETHNICITIES.map(et => (
          <button key={et} onClick={() => setProfile({...profile, ethnicity: et as Ethnicity})} className={`p-4 rounded-2xl font-bold text-sm transition-all border-2 text-center ${profile.ethnicity === et ? 'bg-indigo-50 border-indigo-200 text-indigo-600' : 'bg-slate-50 border-transparent text-slate-500 hover:bg-slate-100'}`}>{et}</button>
        ))}
      </div>
    </OnboardingStep>,
    <OnboardingStep title="Daily Habits" onNext={() => setStep(6)} onPrev={() => setStep(4)}>
      <div className="space-y-8">
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Dietary Preference</label>
          <select className="w-full p-6 bg-slate-50 rounded-3xl font-bold appearance-none outline-none" value={profile.dietaryPreference} onChange={e => setProfile({...profile, dietaryPreference: e.target.value})}>
            {DIETARY_PREFERENCES.map(dp => <option key={dp} value={dp}>{dp}</option>)}
          </select>
        </div>
        <div>
          <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 block">Activity Level</label>
          <select className="w-full p-6 bg-slate-50 rounded-3xl font-bold appearance-none outline-none" value={profile.activityLevel} onChange={e => setProfile({...profile, activityLevel: e.target.value as ActivityLevel})}>
            {ACTIVITY_LEVELS.map(al => <option key={al} value={al}>{al}</option>)}
          </select>
        </div>
      </div>
    </OnboardingStep>,
    <OnboardingStep title="Target Objective" onNext={() => setStep(7)} onPrev={() => setStep(5)}>
      <div className="space-y-8">
        <div className="p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
          <p className="text-indigo-600 font-black text-xs uppercase tracking-widest mb-2">BMI Assessment: {bmi}</p>
          <p className="text-slate-600 text-sm font-medium italic">"Metabolic flexibility is key. Let's aim for a composition change."</p>
        </div>
        <input type="number" className="w-full p-6 bg-slate-50 rounded-3xl font-bold text-3xl text-indigo-600" value={profile.targetWeight} onChange={e => setProfile({...profile, targetWeight: +e.target.value})} />
      </div>
    </OnboardingStep>,
    <OnboardingStep title="Desired Pace" nextLabel="Build My Guide" onNext={generatePlan} onPrev={() => setStep(6)}>
      <div className="space-y-8">
        <div className="space-y-4">
          <div className="flex justify-between items-center"><label className="text-xs font-black text-slate-400 tracking-widest uppercase">Weekly Change (kg)</label><span className="font-black text-2xl text-indigo-600">{profile.pace}</span></div>
          <input type="range" min="0.1" max="1.5" step="0.1" className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-full appearance-none" value={profile.pace} onChange={e => setProfile({...profile, pace: +e.target.value})} />
        </div>
        {errorMessage && <p className="text-rose-500 font-bold text-center text-sm">{errorMessage}</p>}
      </div>
    </OnboardingStep>
  ];

  if (!coachData) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        {isLoading ? (
          <div className="text-center space-y-8 animate-in zoom-in-95 duration-1000">
            <Sparkles size={100} className="text-indigo-600 opacity-20 animate-pulse inline-block" />
            <div className="space-y-2">
              <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Forging Your Blueprint...</h2>
              <p className="text-slate-500 font-medium italic">"Jeffrey is calculating metabolic targets..."</p>
            </div>
          </div>
        ) : onboardingFlow[step]}
      </div>
    );
  }

  const renderDashboard = () => (
    <div className="space-y-8 pb-32">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tighter">JeffreyWooHealth</h1>
          <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.3em]">{profile.name}'s Blueprint | {profile.streak} DAY STREAK</p>
        </div>
        <button onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} className="p-4 bg-white rounded-3xl border border-slate-100 text-slate-400 relative">
          <Bell size={24} />
          <span className="absolute top-3.5 right-3.5 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
        </button>
      </header>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[48px] border border-slate-100">
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-4">Daily Score</p>
          <div className="flex items-baseline gap-2"><span className="text-6xl font-black">{coachData.dailyPlan.dailyNutritionScore}</span><span className="text-slate-400 font-bold">/100</span></div>
        </div>
        <div className="bg-white p-8 rounded-[48px] border border-slate-100">
          <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest mb-4">Est. Burned</p>
          <div className="flex items-baseline gap-2"><span className="text-5xl font-black">{coachData.dailyPlan.estimatedCalorieExpenditure}</span><span className="text-slate-400 text-xs font-black">kcal</span></div>
        </div>
      </div>

      <div className="bg-white p-10 rounded-[56px] border border-slate-100 space-y-6">
        <div className="flex justify-between items-center"><h3 className="font-black text-2xl tracking-tight">Transformation</h3><span className="text-emerald-600 font-black text-xs uppercase bg-emerald-50 px-4 py-2 rounded-full border border-emerald-100 tracking-widest">{profile.pace}kg/wk</span></div>
        <div className="h-6 bg-slate-100 rounded-full overflow-hidden border-4 border-white shadow-inner"><div className="h-full bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-full" style={{ width: '65%' }}></div></div>
        <p className="text-sm text-slate-500 italic font-medium">"{coachData.healthTips.targetAnalysis.tip}"</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Protein', value: coachData.dailyPlan.proteinTarget, color: 'indigo' },
          { label: 'Carbs', value: coachData.dailyPlan.carbsTarget, color: 'emerald' },
          { label: 'Fats', value: coachData.dailyPlan.fatTarget, color: 'amber' }
        ].map(macro => (
          <div key={macro.label} className={`bg-${macro.color}-50 p-6 rounded-[40px] text-center border-2 border-${macro.color}-100`}>
            <p className={`text-[10px] font-black text-${macro.color}-500 uppercase mb-1`}>{macro.label}</p>
            <p className={`text-2xl font-black text-${macro.color}-700`}>{macro.value}g</p>
          </div>
        ))}
      </div>

      <button onClick={handleReset} className="w-full py-5 bg-slate-100 text-slate-500 rounded-[32px] font-black flex items-center justify-center gap-3">
        <RotateCcw size={20} /> Reset Profile
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <main className="max-w-2xl mx-auto p-6 pt-12">
        {activeTab === 'dashboard' && renderDashboard()}
        
        {activeTab === 'tracker' && (
          <div className="space-y-8 pb-32">
            <h2 className="text-4xl font-black tracking-tighter">Journal</h2>
            {meals.map(meal => (
              <div key={meal.id} className="bg-white rounded-[56px] overflow-hidden border border-slate-100 shadow-sm">
                {meal.photoUrl && <img src={meal.photoUrl} alt="Meal" className="w-full h-80 object-cover" />}
                <div className="p-10 space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <h4 className="text-2xl font-black">{new Date(meal.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</h4>
                      <p className="text-slate-400 text-xs font-black uppercase">{new Date(meal.timestamp).toLocaleDateString([], {month: 'long', day: 'numeric'})}</p>
                    </div>
                    <div className="bg-indigo-600 text-white px-5 py-2.5 rounded-2xl font-black">{meal.totalCalories} kcal</div>
                  </div>
                  {meal.coachVerdict && <div className="p-5 bg-indigo-50 border border-indigo-100 rounded-3xl text-indigo-700 font-bold italic text-sm">"{meal.coachVerdict}"</div>}
                  <div className="space-y-4">
                    {meal.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between items-center p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <div className="space-y-1">
                          <p className="font-bold text-slate-800">{it.name}</p>
                          {it.description && <p className="text-[10px] text-slate-400 italic font-medium">{it.description}</p>}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="font-black text-slate-600">{it.calories} cal</span>
                          <button 
                            onClick={() => handleSaveItem(it)}
                            className="p-2 bg-white rounded-full text-slate-300 hover:text-rose-500 transition-colors"
                          >
                            <Heart size={18} fill={profile.bookmarks.some(b => b.name === it.name) ? "currentColor" : "none"} className={profile.bookmarks.some(b => b.name === it.name) ? "text-rose-500" : ""} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
            {meals.length === 0 && (
              <div className="text-center py-20 bg-white rounded-[48px] border border-slate-100 border-dashed">
                <Utensils size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold italic">No meals logged yet. Start by snapping a photo!</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'plan' && (
          <div className="space-y-8 pb-32">
             <h2 className="text-4xl font-black tracking-tighter">My Plan</h2>
             <div className="space-y-6">
                <div className="bg-white p-10 rounded-[56px] border border-slate-100 space-y-4">
                   <div className="flex items-center gap-3 text-indigo-600"><Zap size={24} /> <p className="font-black uppercase tracking-widest text-xs">Metabolic Status</p></div>
                   <h4 className="text-3xl font-black">{coachData.healthTips.bmiAnalysis.category} ({coachData.healthTips.bmiAnalysis.value})</h4>
                   <p className="text-slate-500 italic">"{coachData.healthTips.bmiAnalysis.tip}"</p>
                </div>
             </div>
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="space-y-8 pb-32">
            <h2 className="text-4xl font-black tracking-tighter">Favorites</h2>
            {profile.bookmarks.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-[48px] border border-slate-100 border-dashed">
                <Bookmark size={48} className="text-slate-200 mx-auto mb-4" />
                <p className="text-slate-400 font-bold italic">Save items to find them quickly later.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {profile.bookmarks.map(b => (
                  <div key={b.id} className="bg-white p-8 rounded-[40px] border border-slate-100 flex justify-between items-center group animate-in slide-in-from-right duration-300">
                    <div className="space-y-1">
                      <h4 className="text-2xl font-black text-slate-900">{b.name}</h4>
                      <p className="text-xs font-black text-indigo-500 uppercase tracking-widest">{b.calories} CALORIES</p>
                    </div>
                    <button 
                      onClick={() => handleRemoveItem(b.id)}
                      className="p-4 bg-rose-50 text-rose-300 hover:text-rose-600 rounded-3xl transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {!isCapturing && (
        <button onClick={() => setIsCapturing(true)} className="fixed bottom-28 right-8 w-20 h-20 bg-indigo-600 text-white rounded-[32px] flex items-center justify-center shadow-2xl z-40 transition-transform hover:scale-105">
          <Plus size={40} />
        </button>
      )}

      {isCapturing && (
        <div className="fixed inset-0 z-50 bg-white/98 backdrop-blur-2xl p-8 flex flex-col overflow-y-auto">
          <div className="flex justify-between items-center mb-12 max-w-2xl mx-auto w-full shrink-0">
            <h2 className="text-4xl font-black tracking-tighter">Log Meal</h2>
            <button onClick={() => { setIsCapturing(false); setPhotoAnalysis(null); setErrorMessage(null); }} className="p-4 bg-slate-100 rounded-[24px] hover:bg-slate-200 transition-colors"><X size={32} /></button>
          </div>

          <div className="flex-1 max-w-2xl mx-auto w-full space-y-10">
            {!photoAnalysis ? (
              <div className="space-y-8">
                <label className="block w-full h-[400px] border-[6px] border-dashed border-slate-100 rounded-[64px] flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50 transition-all group">
                  <Camera size={60} className="text-indigo-600 mb-6 group-hover:scale-110 transition-transform" />
                  <p className="text-slate-900 font-black text-2xl">Snap Your Plate</p>
                  <p className="text-slate-400 text-sm mt-2">Analysis is automatic</p>
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
                </label>
                {errorMessage && (
                  <div className="p-6 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 text-rose-700">
                    <AlertTriangle size={24} className="shrink-0" />
                    <p className="font-bold text-sm">{errorMessage}</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-8 pb-10">
                {tempImage && <img src={tempImage} className="w-full h-72 object-cover rounded-[48px] shadow-lg" />}
                
                <div className="bg-indigo-600 p-10 rounded-[56px] text-white space-y-4 shadow-2xl shadow-indigo-100">
                   <div className="flex items-center gap-3 opacity-80"><BrainCircuit size={20} /> <p className="font-black uppercase tracking-widest text-[10px]">Coach Verdict</p></div>
                   <p className="text-2xl font-black leading-tight italic">"{photoAnalysis.coachVerdict}"</p>
                </div>

                <div className="space-y-6">
                  <h4 className="text-2xl font-black px-4 flex items-center gap-3"><ClipboardCheck className="text-indigo-600" /> Itemized Breakdown</h4>
                  {photoAnalysis.items.map((it, idx) => (
                    <div key={idx} className="bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm flex justify-between items-center group">
                       <div className="space-y-2 max-w-[60%]">
                          <p className="font-black text-xl text-slate-900">{it.name}</p>
                          {it.description && <p className="text-xs text-slate-500 font-medium leading-relaxed italic">{it.description}</p>}
                       </div>
                       <div className="flex items-center gap-4">
                          <div className="text-right">
                             <p className="text-2xl font-black text-indigo-600">{Math.round(it.calories * portion)}</p>
                             <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">CALORIES</p>
                          </div>
                          <button 
                            onClick={() => handleSaveItem(it)}
                            className="p-3 bg-slate-50 rounded-2xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-all"
                          >
                            <Heart size={20} fill={profile.bookmarks.some(b => b.name === it.name) ? "currentColor" : "none"} className={profile.bookmarks.some(b => b.name === it.name) ? "text-rose-500" : ""} />
                          </button>
                       </div>
                    </div>
                  ))}
                </div>

                <div className="bg-slate-50 p-10 rounded-[56px] space-y-6">
                   <div className="flex justify-between items-center">
                      <p className="text-xs font-black uppercase tracking-widest text-slate-400">Portion Adjustment</p>
                      <span className="font-black text-3xl text-indigo-600">{portion.toFixed(1)}x</span>
                   </div>
                   <input type="range" min="0.1" max="3.0" step="0.1" value={portion} onChange={e => setPortion(+e.target.value)} className="w-full accent-indigo-600 h-2 bg-slate-200 rounded-full appearance-none" />
                </div>

                <div className="bg-emerald-600 p-10 rounded-[56px] text-white flex justify-between items-center">
                   <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Energy Impact</p>
                      <p className="text-6xl font-black tracking-tighter">{Math.round(photoAnalysis.totalCalories * portion)} kcal</p>
                   </div>
                   <ShieldCheck size={60} className="opacity-20" />
                </div>

                <div className="space-y-3">
                   {photoAnalysis.healthAlerts.map((a, idx) => (
                     <div key={idx} className="bg-amber-50 p-6 rounded-[32px] border border-amber-100 text-amber-900 font-bold text-sm flex gap-4 items-center">
                        <Info size={24} className="text-amber-500 shrink-0" /> {a}
                     </div>
                   ))}
                </div>

                <button onClick={saveMeal} className="w-full bg-indigo-600 text-white py-8 rounded-[40px] font-black shadow-2xl text-2xl tracking-tight transition-transform active:scale-95">Confirm Log</button>
              </div>
            )}
          </div>
        </div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-2xl border-t border-slate-100 p-6 pb-12 flex justify-around items-center z-40">
        {[
          { id: 'dashboard', icon: Layout, label: 'Home' },
          { id: 'tracker', icon: History, label: 'Journal' },
          { id: 'fab-spacer', icon: Plus, label: '', spacer: true },
          { id: 'plan', icon: Sparkles, label: 'Plan' },
          { id: 'bookmarks', icon: Heart, label: 'Saved' }
        ].map(n => n.spacer ? <div key="spacer" className="w-20"></div> : (
          <button key={n.id} onClick={() => setActiveTab(n.id)} className={`flex flex-col items-center gap-1.5 transition-all ${activeTab === n.id ? 'text-indigo-600' : 'text-slate-300 hover:text-slate-500'}`}>
            <n.icon size={26} />
            <span className="text-[10px] font-black uppercase tracking-widest">{n.label}</span>
          </button>
        ))}
      </nav>

      {isLoading && !isCapturing && (
        <div className="fixed inset-0 z-[70] bg-indigo-600/95 backdrop-blur-md flex flex-col items-center justify-center text-white p-10 text-center">
          <Loader2 size={60} className="animate-spin mb-6" />
          <h2 className="text-3xl font-black tracking-tighter">Consulting AI Coach...</h2>
          <p className="text-indigo-200 mt-2 font-medium italic">"Analyzing nutritional patterns and bio-signals..."</p>
        </div>
      )}
    </div>
  );
}
