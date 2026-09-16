export type MainScreen = 'home' | 'discover' | 'messages' | 'profile';

export type Screen =
  | MainScreen
  | 'gameDetail'
  | 'payment'
  | 'create'
  | 'notifications'
  | 'organiserDashboard'
  | 'squad'
  | 'playerProfile';

export const MAIN_SCREENS: MainScreen[] = ['home', 'discover', 'messages', 'profile'];

export type NavigateFn = (target: Screen | 'back' | 'chat' | 'rate' | 'assessment', data?: string) => void;
