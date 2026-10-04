// ─── NexusLearn Mobile — Root App ─────────────────────────────────────────
import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, StatusBar, Platform } from 'react-native';
import { NavigationContainer }     from '@react-navigation/native';
import { createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import { createStackNavigator }    from '@react-navigation/stack';
import { SafeAreaProvider }        from 'react-native-safe-area-context';
import { GestureHandlerRootView }  from 'react-native-gesture-handler';

import AuthScreen        from './src/screens/AuthScreen';
import DashboardScreen   from './src/screens/DashboardScreen';
import CoursePlayerScreen from './src/screens/CoursePlayerScreen';
import LeaderboardScreen from './src/screens/LeaderboardScreen';
import AchievementsScreen from './src/screens/AchievementsScreen';
import ShopScreen        from './src/screens/ShopScreen';
import ProfileScreen     from './src/screens/ProfileScreen';

import {
  loadUser, checkServerSession, fetchCoursesFromServer,
  clearLocalCache, logout,
} from './src/utils/api';
import { DEFAULT_USER } from './src/utils/constants';
import { colors }       from './src/utils/theme';

// ── Navigators ───────────────────────────────────────────────────────────────
const Tab   = createBottomTabNavigator();
const Stack = createStackNavigator();

// ── Tab Icon Map ─────────────────────────────────────────────────────────────
const TAB_ICONS = {
  Dashboard:    { active: '🏠', inactive: '🏠' },
  Leaderboard:  { active: '🏆', inactive: '🏆' },
  Achievements: { active: '🏅', inactive: '🏅' },
  Shop:         { active: '🛍️', inactive: '🛍️' },
  Profile:      { active: '👤', inactive: '👤' },
};

// ── Dashboard Stack (wraps Dashboard + CoursePlayer) ─────────────────────────
function DashboardStack({ user, courses, onDeleteCourse, onUpdateUser, onRefresh, refreshing }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Dashboard">
        {({ navigation }) => (
          <DashboardScreen
            navigation={navigation}
            user={user}
            courses={courses}
            onDeleteCourse={onDeleteCourse}
            onRefresh={onRefresh}
            refreshing={refreshing}
          />
        )}
      </Stack.Screen>
      <Stack.Screen name="CoursePlayer">
        {({ route, navigation }) => (
          <CoursePlayerScreen
            route={route}
            navigation={navigation}
            user={user}
            onUpdateUser={onUpdateUser}
          />
        )}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// ── Main Tab Navigator ────────────────────────────────────────────────────────
function MainTabs({ user, courses, onDeleteCourse, onUpdateUser, onLogout, onRefresh, refreshing }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#111827',
          borderTopColor: 'rgba(99,102,241,0.2)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 84 : 64,
          paddingBottom: Platform.OS === 'ios' ? 24 : 8,
          paddingTop: 8,
        },
        tabBarActiveTintColor:   colors.accent,
        tabBarInactiveTintColor: colors.textDim,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600', marginTop: 2 },
        tabBarIcon: ({ focused }) => {
          const icons = TAB_ICONS[route.name] || { active: '●', inactive: '○' };
          return <Text style={{ fontSize: 20 }}>{focused ? icons.active : icons.inactive}</Text>;
        },
      })}
    >
      <Tab.Screen name="Dashboard"   options={{ tabBarLabel: 'Home' }}>
        {() => (
          <DashboardStack
            user={user} courses={courses}
            onDeleteCourse={onDeleteCourse}
            onUpdateUser={onUpdateUser} onRefresh={onRefresh} refreshing={refreshing}
          />
        )}
      </Tab.Screen>

      <Tab.Screen name="Leaderboard" options={{ tabBarLabel: 'Rankings' }}>
        {() => <LeaderboardScreen user={user} />}
      </Tab.Screen>

      <Tab.Screen name="Achievements" options={{ tabBarLabel: 'Badges' }}>
        {() => <AchievementsScreen user={user} />}
      </Tab.Screen>

      <Tab.Screen name="Shop" options={{ tabBarLabel: 'Shop' }}>
        {() => <ShopScreen user={user} onUpdateUser={onUpdateUser} />}
      </Tab.Screen>

      <Tab.Screen name="Profile" options={{ tabBarLabel: 'Profile' }}>
        {() => <ProfileScreen user={user} onUpdateUser={onUpdateUser} onLogout={onLogout} />}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

// ── Root App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [mounted,    setMounted]    = useState(false);
  const [authedUser, setAuthedUser] = useState(null);
  const [user,       setUser]       = useState(DEFAULT_USER);
  const [courses,    setCourses]    = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Initial load
  useEffect(() => {
    const init = async () => {
      const cached = await loadUser();
      setUser(cached);

      const serverUser = await checkServerSession();
      if (serverUser) {
        setAuthedUser(serverUser);
        setUser(u => ({ ...DEFAULT_USER, ...u, ...serverUser }));
        const diskCourses = await fetchCoursesFromServer();
        if (Array.isArray(diskCourses)) setCourses(diskCourses);
      }
      setMounted(true);
    };
    init().catch(err => { console.error('Init error:', err); setMounted(true); });
  }, []);

  const handleAuthenticated = useCallback(async (userData) => {
    setAuthedUser(userData);
    setUser(u => ({ ...DEFAULT_USER, ...u, ...userData }));
    setCourses([]);
    const diskCourses = await fetchCoursesFromServer();
    if (Array.isArray(diskCourses)) setCourses(diskCourses);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout();
    await clearLocalCache();
    setAuthedUser(null);
    setUser(DEFAULT_USER);
    setCourses([]);
  }, []);

  // Course navigation is handled inside DashboardStack via Stack.Navigator

  const handleUpdateUser = useCallback((updatedUser) => {
    setUser(updatedUser);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      const diskCourses = await fetchCoursesFromServer();
      if (Array.isArray(diskCourses)) setCourses(diskCourses);
    } catch {}
    setRefreshing(false);
  }, []);

  if (!mounted) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashEmoji}>🎓</Text>
        <Text style={styles.splashTitle}>NexusLearn</Text>
        <Text style={styles.splashSub}>Loading your academy…</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={colors.bg} />
        {!authedUser ? (
          <AuthScreen onAuthenticated={handleAuthenticated} />
        ) : (
          <NavigationContainer>
            <MainTabs
              user={user}
              courses={courses}
              onDeleteCourse={async (courseId) => {
                const { deleteCourseFromServer } = await import('./src/utils/api');
                const deleted = await deleteCourseFromServer(courseId);
                if (deleted) setCourses(prev => prev.filter(c => c.id !== courseId));
              }}
              onUpdateUser={handleUpdateUser}
              onLogout={handleLogout}
              onRefresh={handleRefresh}
              refreshing={refreshing}
            />
          </NavigationContainer>
        )}
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  splash:      { flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center', gap: 12 },
  splashEmoji: { fontSize: 60 },
  splashTitle: { fontSize: 30, fontWeight: '900', color: '#f8fafc' },
  splashSub:   { fontSize: 14, color: colors.textMuted },
});
