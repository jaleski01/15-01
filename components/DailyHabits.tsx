import React, { useState, useEffect } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../lib/firebase';
import { COLORS } from '../types';

const HABITS = [
  { id: '1', label: 'Treino Físico', icon: 'barbell' },
  { id: '2', label: 'Ler 10 Páginas', icon: 'book' },
  { id: '3', label: '4L de Água', icon: 'water' },
  { id: '4', label: 'Conexão Real', icon: 'people' },
  { id: '5', label: 'Banho Gelado', icon: 'snow' },
  { id: '6', label: 'Sem Telas > 22h', icon: 'moon' },
];

export const DailyHabits: React.FC = () => {
  const [completedIds, setCompletedIds] = useState<string[]>([]);
  
  // Helper to get consistent date string YYYY-MM-DD
  // This ensures habits reset automatically the next day
  const getTodayDateKey = () => {
    const now = new Date();
    // Use 'en-CA' to get YYYY-MM-DD format consistently
    return now.toLocaleDateString('en-CA'); 
  };

  const todayDate = getTodayDateKey();
  const STORAGE_KEY = `@habits_${todayDate}`;

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    try {
      const savedHabits = localStorage.getItem(STORAGE_KEY);
      if (savedHabits) {
        setCompletedIds(JSON.parse(savedHabits));
      }
    } catch (error) {
      console.error("Failed to load habits from local storage", error);
    }
  }, [STORAGE_KEY]);

  // 2. Sync to Firestore Function
  const syncProgressToDB = async (currentIds: string[]) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      const total = HABITS.length;
      const count = currentIds.length;
      const percentage = Math.round((count / total) * 100);

      // Path: users/{uid}/daily_history/{YYYY-MM-DD}
      const historyRef = doc(db, "users", user.uid, "daily_history", todayDate);

      const payload = {
        date: todayDate,
        completed_count: count,
        total_habits: total,
        habits_ids: currentIds,
        percentage: percentage,
        last_updated: new Date().toISOString()
      };

      // Use setDoc with merge: true to create or update
      await setDoc(historyRef, payload, { merge: true });
      
    } catch (error) {
      console.error("Failed to sync habit progress to Firestore:", error);
    }
  };

  // 3. Handle Toggle
  const toggleHabit = (id: string) => {
    setCompletedIds(prev => {
      const isCompleted = prev.includes(id);
      let newHabits;

      if (isCompleted) {
        newHabits = prev.filter(item => item !== id);
      } else {
        newHabits = [...prev, id];
      }

      // A. Save Locally (Instant Persistence)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newHabits));

      // B. Sync Remotely (Async Data Collection)
      syncProgressToDB(newHabits);

      return newHabits;
    });
  };

  const getIcon = (name: string, checked: boolean) => {
    const color = checked ? '#FFFFFF' : '#9CA3AF'; // Gray-400
    
    switch (name) {
      case 'barbell':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M3 18h18M8 6v12M16 6v12M4 6h16M4 18h16" /></svg>;
      case 'book':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>;
      case 'water':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20 12c0 4.418-3.582 8-8 8s-8-3.582-8-8C4 8 12 2 12 2s8 6 20 10z" /></svg>;
      case 'people':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;
      case 'snow':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18m-6.364-1.636l12.728-12.728M3 12h18M5.636 5.636l12.728 12.728" /></svg>;
      case 'moon':
        return <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke={color} strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col w-full">
      {HABITS.map((habit) => {
        const isChecked = completedIds.includes(habit.id);

        return (
          <button
            key={habit.id}
            onClick={() => toggleHabit(habit.id)}
            className="flex flex-row items-center w-full mb-3 px-4 rounded-xl border transition-all duration-200 active:scale-[0.98]"
            style={{
              height: '60px',
              backgroundColor: '#111827', // Card Dark
              borderColor: '#1F2937', // Dark Border
            }}
          >
            {/* Left: Icon */}
            <div className="flex-shrink-0 opacity-70">
              {getIcon(habit.icon, isChecked)}
            </div>

            {/* Middle: Label */}
            <div className="flex-1 ml-3 text-left">
              <span 
                className="text-sm font-medium"
                style={{ color: isChecked ? '#FFFFFF' : '#D1D5DB' }}
              >
                {habit.label}
              </span>
            </div>

            {/* Right: Checkbox Visual */}
            <div className="flex-shrink-0">
               {isChecked ? (
                 // Checked State: Green Filled Circle with Check
                 <div className="w-6 h-6 rounded-full flex items-center justify-center bg-[#10B981]">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                 </div>
               ) : (
                 // Unchecked State: Empty Circle
                 <div className="w-6 h-6 rounded-full border-2 border-[#374151]"></div>
               )}
            </div>
          </button>
        );
      })}
    </div>
  );
};