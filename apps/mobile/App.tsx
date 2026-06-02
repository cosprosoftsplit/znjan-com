import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { describeApiTarget, fetchMobileData, getApiBaseUrl, resolveApiUrl } from './src/lib/mobileApi';
import { getLabels } from './src/lib/labels';
import type {
  DiscoverItem,
  Language,
  MobileAuthSessionData,
  MobileBootstrapData,
  MobileCommunityFeedData,
  MobileDiscoverData,
  MobileReservationsData,
} from './src/lib/mobileTypes';

const LANGUAGES: Language[] = ['en', 'hr', 'de', 'it'];
const TABS = ['discover', 'sports', 'community', 'account'] as const;

const COLORS = {
  background: '#F4EFE5',
  surface: '#FFFBF3',
  border: '#D8CBB9',
  ink: '#18344D',
  inkMuted: '#5E7285',
  ocean: '#0A6B83',
  oceanDeep: '#0C4A62',
  aqua: '#D6ECF0',
  sand: '#F0D7A9',
  coral: '#D46B53',
} as const;

type TabId = (typeof TABS)[number];

type LoadableState<T> = {
  data: T | null;
  error: string | null;
  loading: boolean;
};

function useLoadableResource<T>(loader: () => Promise<T>, deps: readonly unknown[]): LoadableState<T> {
  const [state, setState] = useState<LoadableState<T>>({
    data: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    let active = true;

    async function run() {
      setState((current) => ({
        ...current,
        loading: true,
        error: null,
      }));

      try {
        const data = await loader();
        if (!active) {
          return;
        }

        setState({
          data,
          error: null,
          loading: false,
        });
      } catch (error) {
        if (!active) {
          return;
        }

        setState((current) => ({
          data: current.data,
          error: error instanceof Error ? error.message : 'Unexpected error',
          loading: false,
        }));
      }
    }

    void run();

    return () => {
      active = false;
    };
  }, deps);

  return state;
}

function addDays(offset: number): string {
  const nextDate = new Date();
  nextDate.setDate(nextDate.getDate() + offset);
  return nextDate.toISOString().slice(0, 10);
}

function localeForLanguage(lang: Language): string {
  switch (lang) {
    case 'hr':
      return 'hr-HR';
    case 'de':
      return 'de-DE';
    case 'it':
      return 'it-IT';
    default:
      return 'en-US';
  }
}

function formatLongDate(value: string, lang: Language): string {
  return new Intl.DateTimeFormat(localeForLanguage(lang), {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${value}T12:00:00`));
}

function openUrl(url: string) {
  void Linking.openURL(url);
}

function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activeTab, setActiveTab] = useState<TabId>('discover');
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [reservationDate, setReservationDate] = useState(addDays(1));

  const apiBaseUrl = getApiBaseUrl();
  const labels = getLabels(lang);

  const bootstrap = useLoadableResource(
    () => fetchMobileData<MobileBootstrapData>(`/api/mobile/v1/bootstrap/?lang=${lang}`),
    [lang, refreshKey],
  );
  const discover = useLoadableResource(
    () => fetchMobileData<MobileDiscoverData>(`/api/mobile/v1/discover/?lang=${lang}`),
    [lang, refreshKey],
  );
  const sportsAccess = useLoadableResource(
    () => fetchMobileData<MobileReservationsData>(`/api/mobile/v1/reservations/?lang=${lang}&date=${reservationDate}`),
    [lang, reservationDate, refreshKey],
  );
  const community = useLoadableResource(
    () => fetchMobileData<MobileCommunityFeedData>(`/api/mobile/v1/community/feed/?lang=${lang}&page=1&limit=6`),
    [lang, refreshKey],
  );
  const auth = useLoadableResource(
    () => fetchMobileData<MobileAuthSessionData>(`/api/mobile/v1/auth/session/?lang=${lang}`),
    [lang, refreshKey],
  );

  const anyLoading = bootstrap.loading || discover.loading || sportsAccess.loading || community.loading || auth.loading;

  useEffect(() => {
    if (refreshing && !anyLoading) {
      setRefreshing(false);
    }
  }, [refreshing, anyLoading]);

  const featuredAreas = bootstrap.data?.featured.beachAreas ?? discover.data?.beachAreas.slice(0, 3) ?? [];
  const featuredActivities = bootstrap.data?.featured.activities ?? discover.data?.activities.slice(0, 4) ?? [];
  const featuredPlaces = bootstrap.data?.featured.places ?? discover.data?.places.slice(0, 4) ?? [];
  const faqHighlights = discover.data?.faq.slice(0, 3) ?? [];

  function refreshAll() {
    setRefreshing(true);
    setRefreshKey((current) => current + 1);
  }

  function renderStateCard(error?: string | null) {
    if (error) {
      return (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{labels.sections.overview}</Text>
          <Text style={styles.bodyText}>{error}</Text>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <ActivityIndicator color={COLORS.ocean} />
        <Text style={styles.loadingText}>{labels.states.loading}</Text>
      </View>
    );
  }

  function renderMetricRow() {
    if (!bootstrap.data) {
      return null;
    }

    const metrics = [
      [labels.metrics.beachAreas, bootstrap.data.counts.beachAreas],
      [labels.metrics.activities, bootstrap.data.counts.activities],
      [labels.metrics.places, bootstrap.data.counts.places],
      [labels.metrics.faqs, bootstrap.data.counts.faq],
    ] as const;

    return (
      <View style={styles.metricRow}>
        {metrics.map(([label, value]) => (
          <View key={label} style={styles.metricTile}>
            <Text style={styles.metricValue}>{value}</Text>
            <Text style={styles.metricLabel}>{label}</Text>
          </View>
        ))}
      </View>
    );
  }

  function renderLinkedRows(items: DiscoverItem[], actionLabel: string) {
    return items.map((item) => {
      const target = item.website ?? item.webUrl;
      return (
        <Pressable
          key={item.id}
          onPress={target ? () => openUrl(target) : undefined}
          style={({ pressed }) => [styles.listRow, pressed && target ? styles.listRowPressed : null]}
        >
          <View style={styles.listCopy}>
            <Text style={styles.listTitle}>{item.title}</Text>
            <Text style={styles.listText} numberOfLines={2}>
              {item.shortDescription ?? item.description}
            </Text>
          </View>
          {target ? <Text style={styles.linkLabel}>{actionLabel}</Text> : null}
        </Pressable>
      );
    });
  }

  function renderDiscoverTab() {
    if (!bootstrap.data && bootstrap.loading) {
      return renderStateCard();
    }

    if (!bootstrap.data) {
      return renderStateCard(bootstrap.error ?? discover.error);
    }

    return (
      <>
        {renderMetricRow()}

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{labels.sections.featuredAreas}</Text>
          {renderLinkedRows(featuredAreas, labels.labels.readOnWeb)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{labels.sections.featuredActivities}</Text>
          {renderLinkedRows(featuredActivities, labels.labels.readOnWeb)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{labels.sections.featuredPlaces}</Text>
          {renderLinkedRows(featuredPlaces, labels.labels.openWebsite)}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{labels.sections.commonQuestions}</Text>
          {faqHighlights.length === 0 ? (
            <Text style={styles.bodyText}>{labels.states.emptyFaq}</Text>
          ) : (
            faqHighlights.map((item) => (
              <View key={item.id} style={styles.faqRow}>
                <Text style={styles.listTitle}>{item.question}</Text>
                <Text style={styles.listText}>{item.answer}</Text>
              </View>
            ))
          )}
        </View>
      </>
    );
  }

  function renderSportsAccessTab() {
    if (!sportsAccess.data && sportsAccess.loading) {
      return renderStateCard();
    }

    if (!sportsAccess.data) {
      return renderStateCard(sportsAccess.error);
    }

    const accessData = sportsAccess.data;

    return (
      <>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{labels.sections.publicAccessNote}</Text>
          <Text style={styles.bodyText}>{accessData.publicAccessMessage}</Text>
          <View style={styles.policyGrid}>
            <View style={styles.policyTile}>
              <Text style={styles.policyValue}>{accessData.resources.length}</Text>
              <Text style={styles.policyLabel}>{labels.labels.resources}</Text>
            </View>
            <View style={styles.policyTile}>
              <Text style={styles.policyValue}>{accessData.dateOptions.length}d</Text>
              <Text style={styles.policyLabel}>{labels.labels.daysInView}</Text>
            </View>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
          {accessData.dateOptions.map((option) => (
            <Pressable
              key={option}
              onPress={() => setReservationDate(option)}
              style={[styles.choicePill, reservationDate === option ? styles.choicePillActive : null]}
            >
              <Text style={[styles.choicePillText, reservationDate === option ? styles.choicePillTextActive : null]}>
                {formatLongDate(option, lang)}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{labels.sections.sportsAreas}</Text>
          <Text style={styles.captionText}>
            {labels.labels.accessDate}: {formatLongDate(accessData.reservationDate, lang)}
          </Text>
          {accessData.resources.map((resource) => {
            const visibleSlots = resource.slots.filter((slot) => slot.status !== 'past').slice(0, 3);
            return (
              <View key={resource.id} style={styles.resourceCard}>
                <Text style={styles.listTitle}>{resource.titles[lang] ?? resource.titles.en}</Text>
                <Text style={styles.captionText}>
                  {resource.reservationMode === 'shared-session'
                    ? labels.labels.sharedSession
                    : labels.labels.sharedPublicArea}
                </Text>
                {visibleSlots.length === 0 ? (
                  <Text style={styles.listText}>{labels.labels.noOpenSlots}</Text>
                ) : (
                  <View style={styles.slotWrap}>
                    {visibleSlots.map((slot) => (
                      <View
                        key={`${resource.id}-${slot.start}`}
                        style={[
                          styles.slotPill,
                          slot.status === 'available'
                            ? styles.slotAvailable
                            : slot.status === 'mine'
                              ? styles.slotMine
                              : slot.status === 'closed'
                                ? styles.slotClosed
                                : styles.slotReserved,
                        ]}
                      >
                        <Text style={styles.slotTime}>{slot.start} - {slot.end}</Text>
                        <Text style={styles.slotLabel}>
                          {slot.status === 'available'
                            ? labels.labels.available
                            : slot.status === 'mine'
                              ? labels.labels.mine
                              : slot.status === 'closed'
                                ? labels.labels.closed
                                : labels.labels.reserved}
                          {resource.reservationMode === 'shared-session' && slot.status === 'available'
                            ? ` · ${slot.spotsLeft} ${labels.labels.spotsLeft}`
                            : ''}
                        </Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </>
    );
  }

  function renderCommunityTab() {
    if (!community.data && community.loading) {
      return renderStateCard();
    }

    if (!community.data) {
      return renderStateCard(community.error);
    }

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{labels.sections.communityFeed}</Text>
        <Text style={styles.captionText}>
          {community.data.pagination.total} total · page {community.data.pagination.page}
        </Text>
        {community.data.posts.length === 0 ? (
          <Text style={styles.bodyText}>{labels.states.emptyPosts}</Text>
        ) : (
          community.data.posts.map((post) => (
            <View key={post.id} style={styles.communityCard}>
              <Text style={styles.communityMeta}>
                {post.type} · {post.category}
              </Text>
              <Text style={styles.listTitle}>{post.title}</Text>
              <Text style={styles.listText} numberOfLines={4}>
                {post.body}
              </Text>
              <Text style={styles.captionText}>
                {post.author.displayName} · Lv {post.author.level}
                {post.location ? ` · ${post.location}` : ''}
                {post.eventDate ? ` · ${post.eventDate}` : ''}
              </Text>
              <View style={styles.communityStats}>
                <Text style={styles.communityStat}>{labels.labels.joins}: {post.joinCount}</Text>
                <Text style={styles.communityStat}>{labels.labels.comments}: {post.commentCount}</Text>
                <Text style={styles.communityStat}>{labels.labels.views}: {post.views}</Text>
              </View>
              <Pressable
                onPress={() => openUrl(resolveApiUrl(`/${lang}/community/${post.id}/`))}
                style={styles.inlineLinkButton}
              >
                <Text style={styles.inlineLinkText}>{labels.labels.readOnWeb}</Text>
              </Pressable>
            </View>
          ))
        )}
      </View>
    );
  }

  function renderAccountTab() {
    if (!auth.data && auth.loading) {
      return renderStateCard();
    }

    if (!auth.data) {
      return renderStateCard(auth.error);
    }

    const authData = auth.data;

    return (
      <>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>{labels.sections.authStatus}</Text>
          <Text style={styles.bodyText}>
            {authData.viewer.isAuthenticated ? labels.states.signedIn : labels.states.signedOut}
          </Text>
          {authData.viewer.user ? (
            <Text style={styles.captionText}>
              {authData.viewer.user.displayName} · Lv {authData.viewer.user.level} · {authData.viewer.user.role}
            </Text>
          ) : null}
          <Pressable onPress={() => openUrl(resolveApiUrl(authData.web.loginScreen))} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>{labels.labels.loginOnWeb}</Text>
          </Pressable>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{labels.sections.nextMilestone}</Text>
          <Text style={styles.bodyText}>{labels.states.nativeNotReady}</Text>
          <Text style={styles.captionText}>{authData.nativePlan.targetFlow}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{labels.sections.connectedEndpoints}</Text>
          {Object.entries(bootstrap.data?.endpoints ?? {}).slice(0, 6).map(([key, value]) => (
            <View key={key} style={styles.endpointRow}>
              <Text style={styles.endpointKey}>{key}</Text>
              <Text style={styles.endpointValue}>{value}</Text>
            </View>
          ))}
        </View>
      </>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshAll} tintColor={COLORS.ocean} />}
      >
        <View style={styles.hero}>
          <View style={styles.heroOrbPrimary} />
          <View style={styles.heroOrbSecondary} />
          <Text style={styles.heroTitle}>Znjan</Text>
          <Text style={styles.heroTagline}>{labels.tagline}</Text>
          <View style={styles.targetPill}>
            <Text style={styles.targetPillLabel}>{labels.apiTarget}</Text>
            <Text style={styles.targetPillValue}>{describeApiTarget(apiBaseUrl)}</Text>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillRow}>
          {LANGUAGES.map((option) => (
            <Pressable
              key={option}
              onPress={() => setLang(option)}
              style={[styles.choicePill, lang === option ? styles.choicePillActive : null]}
            >
              <Text style={[styles.choicePillText, lang === option ? styles.choicePillTextActive : null]}>
                {option.toUpperCase()}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        <View style={styles.tabRow}>
          {TABS.map((tab) => (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tabButton, activeTab === tab ? styles.tabButtonActive : null]}
            >
              <Text style={[styles.tabButtonText, activeTab === tab ? styles.tabButtonTextActive : null]}>
                {labels.tabs[tab]}
              </Text>
            </Pressable>
          ))}
        </View>

        <View style={styles.body}>
          {activeTab === 'discover' ? renderDiscoverTab() : null}
          {activeTab === 'sports' ? renderSportsAccessTab() : null}
          {activeTab === 'community' ? renderCommunityTab() : null}
          {activeTab === 'account' ? renderAccountTab() : null}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export default App;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    paddingBottom: 48,
  },
  hero: {
    margin: 20,
    padding: 24,
    borderRadius: 28,
    backgroundColor: COLORS.oceanDeep,
    overflow: 'hidden',
  },
  heroOrbPrimary: {
    position: 'absolute',
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(240, 215, 169, 0.20)',
    top: -30,
    right: -40,
  },
  heroOrbSecondary: {
    position: 'absolute',
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: 'rgba(214, 236, 240, 0.18)',
    bottom: -30,
    left: -20,
  },
  heroTitle: {
    color: '#FFFFFF',
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  heroTagline: {
    marginTop: 10,
    color: 'rgba(255,255,255,0.88)',
    fontSize: 16,
    lineHeight: 22,
    maxWidth: 300,
  },
  targetPill: {
    marginTop: 18,
    alignSelf: 'flex-start',
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  targetPillLabel: {
    color: 'rgba(255,255,255,0.66)',
    fontSize: 11,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  targetPillValue: {
    marginTop: 2,
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  pillRow: {
    paddingHorizontal: 20,
    gap: 10,
  },
  choicePill: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  choicePillActive: {
    backgroundColor: COLORS.ocean,
    borderColor: COLORS.ocean,
  },
  choicePillText: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  choicePillTextActive: {
    color: '#FFFFFF',
  },
  tabRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tabButton: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: '#E7E0D2',
  },
  tabButtonActive: {
    backgroundColor: COLORS.sand,
  },
  tabButtonText: {
    color: COLORS.inkMuted,
    fontSize: 13,
    fontWeight: '700',
  },
  tabButtonTextActive: {
    color: COLORS.ink,
  },
  body: {
    paddingHorizontal: 20,
    paddingTop: 18,
    gap: 16,
  },
  card: {
    borderRadius: 24,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 18,
    gap: 14,
  },
  cardTitle: {
    color: COLORS.ink,
    fontSize: 18,
    fontWeight: '800',
  },
  bodyText: {
    color: COLORS.inkMuted,
    fontSize: 15,
    lineHeight: 21,
  },
  captionText: {
    color: COLORS.inkMuted,
    fontSize: 12,
    lineHeight: 18,
  },
  loadingText: {
    color: COLORS.inkMuted,
    fontSize: 14,
    textAlign: 'center',
  },
  metricRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metricTile: {
    width: '48%',
    borderRadius: 22,
    backgroundColor: COLORS.ocean,
    padding: 16,
  },
  metricValue: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '800',
  },
  metricLabel: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    marginTop: 4,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFE8DA',
  },
  listRowPressed: {
    opacity: 0.72,
  },
  listCopy: {
    flex: 1,
    gap: 4,
  },
  listTitle: {
    color: COLORS.ink,
    fontSize: 15,
    fontWeight: '700',
  },
  listText: {
    color: COLORS.inkMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  linkLabel: {
    color: COLORS.ocean,
    fontSize: 12,
    fontWeight: '700',
  },
  faqRow: {
    gap: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFE8DA',
  },
  policyGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  policyTile: {
    width: '48%',
    borderRadius: 18,
    backgroundColor: COLORS.aqua,
    padding: 14,
  },
  policyValue: {
    color: COLORS.ink,
    fontSize: 22,
    fontWeight: '800',
  },
  policyLabel: {
    color: COLORS.inkMuted,
    fontSize: 12,
    marginTop: 4,
  },
  resourceCard: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFE8DA',
  },
  slotWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  slotPill: {
    width: '48%',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
  },
  slotAvailable: {
    backgroundColor: '#E1F0E7',
  },
  slotReserved: {
    backgroundColor: '#F5E0DB',
  },
  slotMine: {
    backgroundColor: '#D9EBF2',
  },
  slotClosed: {
    backgroundColor: '#ECE4D9',
  },
  slotTime: {
    color: COLORS.ink,
    fontSize: 13,
    fontWeight: '700',
  },
  slotLabel: {
    color: COLORS.inkMuted,
    fontSize: 12,
  },
  communityCard: {
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#EFE8DA',
  },
  communityMeta: {
    color: COLORS.coral,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.7,
  },
  communityStats: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  communityStat: {
    color: COLORS.inkMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  inlineLinkButton: {
    alignSelf: 'flex-start',
    paddingVertical: 4,
  },
  inlineLinkText: {
    color: COLORS.ocean,
    fontSize: 12,
    fontWeight: '700',
  },
  primaryButton: {
    alignSelf: 'flex-start',
    borderRadius: 18,
    backgroundColor: COLORS.ocean,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  endpointRow: {
    gap: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#EFE8DA',
  },
  endpointKey: {
    color: COLORS.ink,
    fontSize: 12,
    fontWeight: '700',
  },
  endpointValue: {
    color: COLORS.inkMuted,
    fontSize: 12,
  },
});
