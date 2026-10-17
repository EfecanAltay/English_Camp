import { createHashRouter, Navigate } from 'react-router-dom';
import { MainLayout } from './layouts/MainLayout';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { CampCalendarPage } from '../features/study-planner/pages/CampCalendarPage';
import { DayTasksPage } from '../features/study-planner/pages/DayTasksPage';
import { GrammarPage } from '../features/grammar/pages/GrammarPage';
import { GrammarDetailPage } from '../features/grammar/pages/GrammarDetailPage';
import { VocabularyPage } from '../features/vocabulary/pages/VocabularyPage';
import { ReadingPage } from '../features/reading/pages/ReadingPage';
import { SkillsPage } from '../features/skills/pages/SkillsPage';
import { ReviewPage } from '../features/review/pages/ReviewPage';
import { ProgressAnalyticsPage } from '../features/progress/pages/ProgressAnalyticsPage';
import { SettingsPage } from '../features/settings/pages/SettingsPage';

export const router = createHashRouter([
  {
    path: '/',
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'camp',
        element: <CampCalendarPage />,
      },
      {
        path: 'camp/day/:day',
        element: <DayTasksPage />,
      },
      {
        path: 'grammar',
        element: <GrammarPage />,
      },
      {
        path: 'grammar/:lessonId',
        element: <GrammarDetailPage />,
      },
      {
        path: 'vocabulary',
        element: <VocabularyPage />,
      },
      {
        path: 'vocabulary/review',
        element: <VocabularyPage />,
      },
      {
        path: 'reading',
        element: <ReadingPage />,
      },
      {
        path: 'reading/:passageId',
        element: <ReadingPage />,
      },
      {
        path: 'skills',
        element: <SkillsPage />,
      },
      {
        path: 'skills/:categoryId',
        element: <SkillsPage />,
      },
      {
        path: 'review',
        element: <ReviewPage />,
      },
      {
        path: 'progress',
        element: <ProgressAnalyticsPage />,
      },
      {
        path: 'settings',
        element: <SettingsPage />,
      },
      {
        path: '*',
        element: <Navigate to="/" replace />,
      },
    ],
  },
]);
