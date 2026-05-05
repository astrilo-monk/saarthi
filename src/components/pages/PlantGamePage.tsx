import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Droplets, 
  Sun, 
  Heart, 
  BookOpen, 
  Users, 
  CheckCircle, 
  Star,
  Leaf,
  Trophy,
  Calendar,
  Target
} from 'lucide-react';
import { useMember } from '@/integrations';
import { MemberProtectedRoute } from '@/components/ui/member-protected-route';

interface Task {
  id: string;
  title: string;
  description: string;
  icon: any;
  points: number;
  category: 'mindfulness' | 'social' | 'learning' | 'self-care';
  completed: boolean;
}

interface PlantProgress {
  level: number;
  experience: number;
  experienceToNext: number;
  health: number;
  happiness: number;
  lastWatered: string;
  totalTasksCompleted: number;
  streak: number;
  lastCompletionDate: string;
}

interface UserGameData {
  plantProgress: PlantProgress;
  completedTasks: string[];
  lastResetDate: string;
}

const PlantGameContent = () => {
  const { member } = useMember();
  const [gameData, setGameData] = useState<UserGameData>({
    plantProgress: {
      level: 1,
      experience: 0,
      experienceToNext: 100,
      health: 100,
      happiness: 80,
      lastWatered: '',
      totalTasksCompleted: 0,
      streak: 0,
      lastCompletionDate: ''
    },
    completedTasks: [],
    lastResetDate: new Date().toDateString()
  });

  const [showCelebration, setShowCelebration] = useState(false);
  const [celebrationMessage, setCelebrationMessage] = useState('');

  const dailyTasks: Task[] = [
    {
      id: 'breathing',
      title: 'Deep Breathing',
      description: 'Take 5 minutes for deep breathing exercises',
      icon: Droplets,
      points: 20,
      category: 'mindfulness',
      completed: false
    },
    {
      id: 'gratitude',
      title: 'Gratitude Journal',
      description: 'Write down 3 things you\'re grateful for today',
      icon: Heart,
      points: 25,
      category: 'self-care',
      completed: false
    },
    {
      id: 'learning',
      title: 'Read Mental Health Article',
      description: 'Read an article about mental wellness',
      icon: BookOpen,
      points: 30,
      category: 'learning',
      completed: false
    },
    {
      id: 'social',
      title: 'Connect with Someone',
      description: 'Have a meaningful conversation with a friend or family member',
      icon: Users,
      points: 35,
      category: 'social',
      completed: false
    },
    {
      id: 'mindfulness',
      title: 'Mindful Moment',
      description: 'Spend 10 minutes in mindful observation of your surroundings',
      icon: Sun,
      points: 20,
      category: 'mindfulness',
      completed: false
    },
    {
      id: 'exercise',
      title: 'Physical Activity',
      description: 'Do 15 minutes of physical activity or stretching',
      icon: Target,
      points: 25,
      category: 'self-care',
      completed: false
    }
  ];

  useEffect(() => {
    loadGameData();
    checkDailyReset();
  }, [member]);

  const loadGameData = () => {
    if (!member) return;
    
    const savedData = localStorage.getItem(`plantGame_${member.loginEmail}`);
    if (savedData) {
      const parsed = JSON.parse(savedData);
      setGameData(parsed);
    }
  };

  const saveGameData = (newData: UserGameData) => {
    if (!member) return;
    
    localStorage.setItem(`plantGame_${member.loginEmail}`, JSON.stringify(newData));
    setGameData(newData);
  };

  const checkDailyReset = () => {
    const today = new Date().toDateString();
    if (gameData.lastResetDate !== today) {
      const newData = {
        ...gameData,
        completedTasks: [],
        lastResetDate: today
      };
      saveGameData(newData);
    }
  };

  const completeTask = (taskId: string) => {
    const task = dailyTasks.find(t => t.id === taskId);
    if (!task || gameData.completedTasks.includes(taskId)) return;

    const newCompletedTasks = [...gameData.completedTasks, taskId];
    const newExperience = gameData.plantProgress.experience + task.points;
    const newTotalTasks = gameData.plantProgress.totalTasksCompleted + 1;
    
    let newLevel = gameData.plantProgress.level;
    let experienceToNext = gameData.plantProgress.experienceToNext;
    let finalExperience = newExperience;

    // Level up logic
    if (newExperience >= experienceToNext) {
      newLevel++;
      finalExperience = newExperience - experienceToNext;
      experienceToNext = newLevel * 100;
      
      setCelebrationMessage(`🌱 Your plant grew to level ${newLevel}! 🌱`);
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 3000);
    }

    // Calculate streak
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toDateString();
    let newStreak = gameData.plantProgress.streak;
    
    if (gameData.plantProgress.lastCompletionDate === yesterday) {
      newStreak++;
    } else if (gameData.plantProgress.lastCompletionDate !== today) {
      newStreak = 1;
    }

    const newGameData: UserGameData = {
      ...gameData,
      completedTasks: newCompletedTasks,
      plantProgress: {
        ...gameData.plantProgress,
        level: newLevel,
        experience: finalExperience,
        experienceToNext,
        health: Math.min(100, gameData.plantProgress.health + 5),
        happiness: Math.min(100, gameData.plantProgress.happiness + 10),
        totalTasksCompleted: newTotalTasks,
        streak: newStreak,
        lastCompletionDate: today
      }
    };

    saveGameData(newGameData);
  };

  const getPlantStage = () => {
    const level = gameData.plantProgress.level;
    if (level >= 10) return { emoji: '🌳', name: 'Mighty Tree', color: 'text-green-800' };
    if (level >= 7) return { emoji: '🌲', name: 'Young Tree', color: 'text-green-700' };
    if (level >= 5) return { emoji: '🪴', name: 'Flourishing Plant', color: 'text-green-600' };
    if (level >= 3) return { emoji: '🌿', name: 'Growing Plant', color: 'text-green-500' };
    return { emoji: '🌱', name: 'Seedling', color: 'text-green-400' };
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'mindfulness': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'social': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'learning': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'self-care': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const tasksWithCompletion = dailyTasks.map(task => ({
    ...task,
    completed: gameData.completedTasks.includes(task.id)
  }));

  const completedToday = tasksWithCompletion.filter(t => t.completed).length;
  const totalTasks = tasksWithCompletion.length;
  const completionPercentage = (completedToday / totalTasks) * 100;

  const plantStage = getPlantStage();

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 py-8">
      <div className="max-w-[120rem] mx-auto px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-heading font-bold bg-gradient-to-r from-green-600 via-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            🌱 Mindful Garden 🌱
          </h1>
          <p className="text-lg font-paragraph text-gray-600 max-w-3xl mx-auto">
            Nurture your mental wellness and watch your plant grow! Complete daily mindfulness tasks to help your virtual plant thrive.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Plant Display */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-3xl shadow-lg border-2 border-green-200 p-8 text-center sticky top-8">
              <div className="mb-6">
                <div className="text-8xl mb-4">{plantStage.emoji}</div>
                <h2 className={`text-2xl font-heading font-bold ${plantStage.color} mb-2`}>
                  {plantStage.name}
                </h2>
                <p className="text-lg font-paragraph text-gray-600">Level {gameData.plantProgress.level}</p>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex justify-between text-sm font-paragraph text-gray-600 mb-2">
                  <span>Experience</span>
                  <span>{gameData.plantProgress.experience}/{gameData.plantProgress.experienceToNext}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${(gameData.plantProgress.experience / gameData.plantProgress.experienceToNext) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-red-50 rounded-xl p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Heart className="w-5 h-5 text-red-500 mr-1" />
                    <span className="font-paragraph font-bold text-red-700">Health</span>
                  </div>
                  <div className="text-2xl font-heading font-bold text-red-600">
                    {gameData.plantProgress.health}%
                  </div>
                </div>
                
                <div className="bg-yellow-50 rounded-xl p-4">
                  <div className="flex items-center justify-center mb-2">
                    <Sun className="w-5 h-5 text-yellow-500 mr-1" />
                    <span className="font-paragraph font-bold text-yellow-700">Joy</span>
                  </div>
                  <div className="text-2xl font-heading font-bold text-yellow-600">
                    {gameData.plantProgress.happiness}%
                  </div>
                </div>
              </div>

              {/* Achievements */}
              <div className="space-y-3">
                <div className="bg-blue-50 rounded-xl p-4">
                  <div className="flex items-center justify-center mb-1">
                    <Trophy className="w-5 h-5 text-blue-500 mr-2" />
                    <span className="font-paragraph font-bold text-blue-700">Total Tasks</span>
                  </div>
                  <div className="text-xl font-heading font-bold text-blue-600">
                    {gameData.plantProgress.totalTasksCompleted}
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-4">
                  <div className="flex items-center justify-center mb-1">
                    <Star className="w-5 h-5 text-purple-500 mr-2" />
                    <span className="font-paragraph font-bold text-purple-700">Streak</span>
                  </div>
                  <div className="text-xl font-heading font-bold text-purple-600">
                    {gameData.plantProgress.streak} days
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tasks Section */}
          <div className="lg:col-span-2">
            {/* Daily Progress */}
            <div className="bg-white rounded-3xl shadow-lg border-2 border-blue-200 p-8 mb-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-heading font-bold text-gray-800">
                  Today's Progress
                </h2>
                <div className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-gray-600" />
                  <span className="font-paragraph text-gray-600">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between text-sm font-paragraph text-gray-600 mb-2">
                  <span>Daily Tasks Completed</span>
                  <span>{completedToday}/{totalTasks}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-gradient-to-r from-blue-400 to-purple-600 h-4 rounded-full transition-all duration-500"
                    style={{ width: `${completionPercentage}%` }}
                  ></div>
                </div>
              </div>
              
              {completionPercentage === 100 && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <div className="text-2xl mb-2">🎉</div>
                  <p className="font-paragraph font-bold text-green-800">
                    Amazing! You've completed all tasks today!
                  </p>
                </div>
              )}
            </div>

            {/* Tasks List */}
            <div className="bg-white rounded-3xl shadow-lg border-2 border-purple-200 p-8">
              <h2 className="text-2xl font-heading font-bold text-gray-800 mb-6">
                Daily Mindfulness Tasks
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {tasksWithCompletion.map((task) => {
                  const Icon = task.icon;
                  return (
                    <motion.div
                      key={task.id}
                      whileHover={{ scale: task.completed ? 1 : 1.02 }}
                      className={`rounded-2xl border-2 p-6 transition-all ${
                        task.completed
                          ? 'bg-green-50 border-green-300 opacity-75'
                          : 'bg-white border-gray-200 hover:border-gray-300 cursor-pointer hover:shadow-md'
                      }`}
                      onClick={() => !task.completed && completeTask(task.id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          task.completed ? 'bg-green-100' : getCategoryColor(task.category)
                        }`}>
                          {task.completed ? (
                            <CheckCircle className="w-6 h-6 text-green-600" />
                          ) : (
                            <Icon className="w-6 h-6" />
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-3 py-1 rounded-full text-xs font-paragraph font-medium border ${getCategoryColor(task.category)}`}>
                            {task.category}
                          </span>
                          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-paragraph font-bold">
                            +{task.points} XP
                          </span>
                        </div>
                      </div>
                      
                      <h3 className={`font-heading font-bold mb-2 ${
                        task.completed ? 'text-green-700 line-through' : 'text-gray-800'
                      }`}>
                        {task.title}
                      </h3>
                      
                      <p className={`font-paragraph text-sm ${
                        task.completed ? 'text-green-600' : 'text-gray-600'
                      }`}>
                        {task.description}
                      </p>
                      
                      {task.completed && (
                        <div className="mt-4 flex items-center text-green-600">
                          <CheckCircle className="w-4 h-4 mr-2" />
                          <span className="font-paragraph text-sm font-medium">Completed!</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Celebration Modal */}
        <AnimatePresence>
          {showCelebration && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            >
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.5, opacity: 0 }}
                className="bg-white rounded-3xl p-8 text-center max-w-md w-full"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-2xl font-heading font-bold text-gray-800 mb-4">
                  Congratulations!
                </h3>
                <p className="text-lg font-paragraph text-gray-600 mb-6">
                  {celebrationMessage}
                </p>
                <div className="text-4xl">{plantStage.emoji}</div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default function PlantGamePage() {
  return (
    <MemberProtectedRoute messageToSignIn="Sign in to start nurturing your virtual plant and track your mental wellness journey">
      <PlantGameContent />
    </MemberProtectedRoute>
  );
}