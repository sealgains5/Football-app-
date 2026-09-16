import { useEffect, useRef, useState } from 'react';
import { BottomNav } from './components/BottomNav';
import { SwipeBack } from './components/SwipeBack';
import { useAuth } from './hooks/useAuth';
import { useFollowerCount, useFollowing } from './hooks/useFollows';
import { joinGame, useGames } from './hooks/useGames';
import { useNotifications } from './hooks/useNotifications';
import { fetchProfile } from './hooks/usePlayers';
import { AuthScreen } from './screens/AuthScreen';
import { CreateScreen } from './screens/CreateScreen';
import { DiscoverScreen } from './screens/DiscoverScreen';
import { GameDetailScreen } from './screens/GameDetailScreen';
import { HomeScreen } from './screens/HomeScreen';
import { MessagesScreen } from './screens/MessagesScreen';
import { NotificationsScreen } from './screens/NotificationsScreen';
import { OrganiserDashboard } from './screens/OrganiserDashboard';
import { PaymentScreen } from './screens/PaymentScreen';
import { PlayerPublicProfile } from './screens/PlayerPublicProfile';
import { PostGameRatingModal } from './screens/PostGameRatingModal';
import { ProfileScreen } from './screens/ProfileScreen';
import { SkillAssessmentScreen } from './screens/SkillAssessmentScreen';
import { SplashScreen } from './screens/SplashScreen';
import { SquadScreen } from './screens/SquadScreen';
import { initialsOf, type Profile } from './types/domain';
import { MAIN_SCREENS, type MainScreen, type NavigateFn, type Screen } from './types/nav';

type AppState = 'splash' | 'auth' | 'assessment' | 'main';

export default function App() {
  const { session, user, profile } = useAuth();
  const { games, refresh: refreshGames } = useGames();
  const { following, toggleFollow } = useFollowing(user?.id);
  const followerCount = useFollowerCount(user?.id);
  const { notifications, unreadCount, markAllRead, refresh: refreshNotifications } = useNotifications(user?.id);

  const [appState, setAppState] = useState<AppState>('splash');
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [ratingGameId, setRatingGameId] = useState<string | null>(null);
  const [viewedPlayer, setViewedPlayer] = useState<Profile | null>(null);

  const navHistory = useRef<{ screen: Screen; id: string | null }[]>([]);
  const screenRef = useRef<Screen>('home');
  const selectedRef = useRef<string | null>(null);

  useEffect(() => {
    if (session && appState === 'auth') setAppState('main');
  }, [session, appState]);

  useEffect(() => {
    if (screen === 'playerProfile' && selectedId) {
      fetchProfile(selectedId).then(setViewedPlayer);
    }
  }, [screen, selectedId]);

  const navigate: NavigateFn = (target, data) => {
    if (target === 'back') {
      const prev = navHistory.current.pop();
      if (prev) {
        selectedRef.current = prev.id;
        setSelectedId(prev.id);
        screenRef.current = prev.screen;
        setScreen(prev.screen);
      } else {
        screenRef.current = 'home';
        setScreen('home');
      }
      return;
    }
    if (target === 'chat') {
      screenRef.current = 'gameDetail';
      setScreen('gameDetail');
      return;
    }
    if (target === 'assessment') {
      setAppState('assessment');
      return;
    }
    if (target === 'rate') {
      setRatingGameId(data ?? null);
      return;
    }
    navHistory.current.push({ screen: screenRef.current, id: selectedRef.current });
    if (data !== undefined) {
      selectedRef.current = data;
      setSelectedId(data);
    }
    screenRef.current = target;
    setScreen(target);
  };

  const selectTab = (tab: MainScreen) => {
    navHistory.current = [];
    screenRef.current = tab;
    setScreen(tab);
  };

  const myId = user?.id;
  const myName = profile?.full_name || 'Player';
  const myInitials = initialsOf(myName);
  const joinedGameIds = myId ? games.filter((g) => g.players.some((p) => p.id === myId)).map((g) => g.id) : [];
  const selectedGame = selectedId ? games.find((g) => g.id === selectedId) : undefined;
  const ratingGame = ratingGameId ? games.find((g) => g.id === ratingGameId) : undefined;
  const mainScreens = MAIN_SCREENS;
  const activeTab = (mainScreens as string[]).includes(screen) ? (screen as MainScreen) : null;

  return (
    <div
      style={{
        fontFamily: "'DM Sans', sans-serif",
        width: '100%',
        maxWidth: 480,
        height: '100dvh',
        margin: '0 auto',
        position: 'relative',
        background: 'var(--bg)',
        overflow: 'hidden',
      }}
    >
      {/* onDone always lands on 'auth' — if a session already exists, the effect above
          immediately promotes 'auth' -> 'main', without relying on a stale closure over
          `session` inside a callback that was created back when the splash screen mounted. */}
      {appState === 'splash' && <SplashScreen onDone={() => setAppState('auth')} />}

      {appState === 'auth' && <AuthScreen onLoggedIn={() => setAppState('main')} onSignedUp={() => setAppState('assessment')} />}

      {appState === 'assessment' && myId && (
        <SkillAssessmentScreen
          userId={myId}
          onComplete={() => {
            setAppState('main');
            screenRef.current = 'profile';
            setScreen('profile');
          }}
        />
      )}

      {appState === 'main' && myId && (
        <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', paddingTop: 'var(--safe-top)' }}>
          <SwipeBack enabled={!mainScreens.includes(screen as MainScreen)} onBack={() => navigate('back')}>
            {screen === 'home' && (
              <HomeScreen navigate={navigate} games={games} joinedGameIds={joinedGameIds} myName={myName} myInitials={myInitials} gamesPlayed={joinedGameIds.length} notifCount={unreadCount} userId={myId} />
            )}
            {screen === 'discover' && <DiscoverScreen navigate={navigate} games={games} joinedGameIds={joinedGameIds} following={following} onToggleFollow={toggleFollow} myId={myId} />}
            {screen === 'messages' && <MessagesScreen navigate={navigate} games={games} joinedGameIds={joinedGameIds} myId={myId} />}
            {screen === 'profile' && <ProfileScreen navigate={navigate} games={games} joinedGameIds={joinedGameIds} followers={followerCount} following={following.size} />}
            {screen === 'gameDetail' && selectedGame && (
              <GameDetailScreen
                game={selectedGame}
                navigate={navigate}
                joinedGameIds={joinedGameIds}
                onJoin={async (waitlist) => {
                  await joinGame(selectedGame.id, myId, { isFull: waitlist });
                  refreshGames();
                }}
                isOrganiser={selectedGame.organiserId === myId}
                myId={myId}
              />
            )}
            {screen === 'payment' && selectedGame && (
              <PaymentScreen
                game={selectedGame}
                navigate={navigate}
                myId={myId}
                onPaid={() => {
                  refreshGames();
                }}
              />
            )}
            {screen === 'create' && <CreateScreen navigate={navigate} organiserId={myId} onCreated={() => refreshGames()} />}
            {screen === 'notifications' && <NotificationsScreen navigate={navigate} notifications={notifications} onMarkRead={markAllRead} onRefresh={() => { refreshNotifications(); refreshGames(); }} />}
            {screen === 'organiserDashboard' && selectedGame && (
              <OrganiserDashboard
                game={selectedGame}
                navigate={navigate}
                onRefresh={() => refreshGames()}
              />
            )}
            {screen === 'squad' && <SquadScreen navigate={navigate} following={following} ownerId={myId} />}
            {screen === 'playerProfile' && viewedPlayer && (
              <PlayerPublicProfile player={viewedPlayer} isFollowing={following.has(viewedPlayer.id)} onToggleFollow={toggleFollow} navigate={navigate} />
            )}
          </SwipeBack>

          {ratingGame && myId && (
            <PostGameRatingModal
              game={ratingGame}
              myId={myId}
              onClose={() => setRatingGameId(null)}
              onSubmitted={() => setRatingGameId(null)}
            />
          )}

          {mainScreens.includes(screen as MainScreen) && <BottomNav active={activeTab} onSelect={selectTab} onCreate={() => navigate('create')} />}
        </div>
      )}
    </div>
  );
}
