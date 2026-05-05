import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useAlerts } from '../../hooks/useAlerts';
import { Bell, BellOff, Trash2, RefreshCw, AlertTriangle, Sun, Clock, History } from 'lucide-react-native';
import { format, parseISO, isToday, isYesterday } from 'date-fns';

function formatAlertDate(dateStr: string) {
  const date = parseISO(dateStr);
  if (isToday(date)) return `Today · ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `Yesterday · ${format(date, 'HH:mm')}`;
  return format(date, 'MMM d · HH:mm');
}

export default function AlertsScreen() {
  const { alerts, historyAlerts, isLoading, dismissAlert, clearAllAlerts, fetchAlerts, fetchHistory, markAllAsRead } = useAlerts();
  const [activeTab, setActiveTab] = useState<'active' | 'history'>('active');
  const [refreshing, setRefreshing] = useState(false);

  React.useEffect(() => {
    if (activeTab === 'active' && alerts.some(a => !a.is_read)) {
      markAllAsRead();
    }
    if (activeTab === 'history') {
      fetchHistory();
    }
  }, [alerts, activeTab, markAllAsRead, fetchHistory]);

  const onRefresh = async () => {
    setRefreshing(true);
    if (activeTab === 'active') {
      await fetchAlerts();
    } else {
      await fetchHistory();
    }
    setRefreshing(false);
  };

  const displayAlerts = activeTab === 'active' ? alerts : historyAlerts;

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B5CE7" />
        <Text style={styles.loadingText}>Loading alerts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B5CE7" />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Alerts</Text>
            <Text style={styles.subtitle}>
              {activeTab === 'active' 
                ? (alerts.length > 0 ? `${alerts.length} notifications` : 'AI-generated alerts')
                : `${historyAlerts.length} past alerts`
              }
            </Text>
          </View>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.actionBtn} onPress={onRefresh}>
              <RefreshCw size={18} color="#8888AA" />
            </TouchableOpacity>
            {activeTab === 'active' && alerts.length > 0 && (
              <TouchableOpacity style={styles.clearBtn} onPress={clearAllAlerts}>
                <Trash2 size={16} color="#EF4444" />
                <Text style={styles.clearBtnText}>Clear all</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        <View style={styles.tabsContainer}>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'active' && styles.tabActive]}
            onPress={() => setActiveTab('active')}
          >
            <Text style={[styles.tabText, activeTab === 'active' && styles.tabTextActive]}>Active Alerts</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.tab, activeTab === 'history' && styles.tabActive]}
            onPress={() => setActiveTab('history')}
          >
            <Text style={[styles.tabText, activeTab === 'history' && styles.tabTextActive]}>History</Text>
          </TouchableOpacity>
        </View>

        {displayAlerts.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              {activeTab === 'active' ? <BellOff size={32} color="#6B5CE7" /> : <History size={32} color="#6B5CE7" />}
            </View>
            <Text style={styles.emptyTitle}>{activeTab === 'active' ? 'You are all caught up!' : 'No history'}</Text>
            <Text style={styles.emptyText}>
              {activeTab === 'active' 
                ? "You don't have any new alerts."
                : "You haven't received any alerts yet."}
            </Text>
          </View>
        ) : (
          <View style={styles.alertsList}>
            {displayAlerts.map(alert => {
              const isMorning = alert.type === 'morning_briefing';
              const Icon = isMorning ? Sun : AlertTriangle;
              
              return (
                <View key={alert.id} style={[styles.alertCard, !alert.is_read && styles.alertCardUnread]}>
                  {/* Left border indicator */}
                  <View style={[styles.alertBorder, isMorning ? styles.borderMorning : styles.borderDanger]} />
                  
                  <View style={styles.alertContentRow}>
                    <View style={[styles.iconContainer, isMorning ? styles.iconBgMorning : styles.iconBgDanger]}>
                      <Icon size={20} color={isMorning ? '#F59E0B' : '#EF4444'} />
                    </View>
                    
                    <View style={styles.alertContent}>
                      <View style={styles.alertHeader}>
                        <View style={[styles.badge, isMorning ? styles.badgeMorning : styles.badgeDanger]}>
                          <Text style={[styles.badgeText, isMorning ? styles.badgeTextMorning : styles.badgeTextDanger]}>
                            {isMorning ? 'Morning Briefing' : 'Deadline Conflict'}
                          </Text>
                        </View>
                        <View style={styles.timeContainer}>
                          <Clock size={12} color="#8888AA" />
                          <Text style={styles.timeText}>{formatAlertDate(alert.created_at)}</Text>
                          {!alert.is_read && <View style={styles.newBadge}><Text style={styles.newBadgeText}>NEW</Text></View>}
                        </View>
                      </View>
                      <Text style={[styles.messageText, !alert.is_read && styles.messageTextUnread]}>
                        {alert.message}
                      </Text>
                    </View>

                    {activeTab === 'active' && (
                      <TouchableOpacity style={styles.dismissBtn} onPress={() => dismissAlert(alert.id)}>
                        <Trash2 size={16} color="#CDD0E8" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FC',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: 'DMSans_500Medium',
    color: '#8888AA',
    marginTop: 12,
  },
  scrollContent: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    color: '#14142B',
    marginBottom: 4,
  },
  subtitle: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: '#8888AA',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E6F0',
    backgroundColor: '#fff',
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E4E6F0',
    backgroundColor: '#fff',
  },
  clearBtnText: {
    fontFamily: 'DMSans_500Medium',
    color: '#EF4444',
    fontSize: 13,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6F0',
    marginBottom: 24,
  },
  tab: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#6B5CE7',
  },
  tabText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 14,
    color: '#8888AA',
  },
  tabTextActive: {
    color: '#6B5CE7',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E4E6F0',
    borderStyle: 'dashed',
    padding: 32,
    alignItems: 'center',
    marginTop: 16,
  },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EEF0FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 20,
    color: '#14142B',
    marginBottom: 8,
  },
  emptyText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: '#8888AA',
    textAlign: 'center',
  },
  alertsList: {
    gap: 12,
  },
  alertCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E4E6F0',
    overflow: 'hidden',
  },
  alertCardUnread: {
    borderColor: '#6B5CE7',
  },
  alertBorder: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  borderMorning: {
    backgroundColor: '#F59E0B',
  },
  borderDanger: {
    backgroundColor: '#EF4444',
  },
  alertContentRow: {
    flexDirection: 'row',
    padding: 16,
    paddingLeft: 20,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconBgMorning: {
    backgroundColor: '#FEF3C7',
  },
  iconBgDanger: {
    backgroundColor: '#FEE2E2',
  },
  alertContent: {
    flex: 1,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 6,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeMorning: {
    backgroundColor: '#FEF3C7',
  },
  badgeDanger: {
    backgroundColor: '#FEE2E2',
  },
  badgeText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
  },
  badgeTextMorning: {
    color: '#F59E0B',
  },
  badgeTextDanger: {
    color: '#EF4444',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  timeText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: '#8888AA',
  },
  newBadge: {
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 4,
  },
  newBadgeText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    color: '#6B5CE7',
  },
  messageText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: '#4A4A6A',
    lineHeight: 20,
  },
  messageTextUnread: {
    fontFamily: 'DMSans_700Bold',
    color: '#14142B',
  },
  dismissBtn: {
    padding: 4,
    marginLeft: 8,
  },
});
