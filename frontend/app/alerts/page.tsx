"use client";

import { useAlerts } from '../../hooks/useAlerts';
import { Bell, BellOff, Trash2, RefreshCw, Loader2, AlertTriangle, Sun, Clock } from 'lucide-react';
import { format, parseISO, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { useEffect } from 'react';

function getAlertStyle(type: string | null) {
  switch (type) {
    case 'morning_briefing':
      return {
        icon: Sun,
        iconColor: 'text-[#F59E0B]',
        iconBg: 'bg-[#FEF3C7]',
        border: 'border-l-[#F59E0B]',
        badge: 'bg-[#FEF3C7] text-[#F59E0B]',
        label: 'Morning Briefing',
      };
    case 'alert':
    case 'conflict':
    default:
      return {
        icon: AlertTriangle,
        iconColor: 'text-[#EF4444]',
        iconBg: 'bg-[#FEE2E2]',
        border: 'border-l-[#EF4444]',
        badge: 'bg-[#FEE2E2] text-[#EF4444]',
        label: 'Deadline Conflict',
      };
  }
}

function formatAlertDate(dateStr: string) {
  const date = parseISO(dateStr);
  if (isToday(date)) return `Today · ${format(date, 'HH:mm')}`;
  if (isYesterday(date)) return `Yesterday · ${format(date, 'HH:mm')}`;
  return format(date, 'MMM d · HH:mm');
}

export default function AlertsPage() {
  const { alerts, isLoading, error, dismissAlert, clearAllAlerts, fetchAlerts, markAllAsRead } = useAlerts();

  useEffect(() => {
    if (alerts.some(a => !a.is_read)) {
      markAllAsRead();
    }
  }, [alerts, markAllAsRead]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#6B5CE7]" />
          <p className="text-[#8888AA] font-medium">Loading alerts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#14142B] tracking-tight">Alerts</h1>
          <p className="text-[#8888AA] mt-1.5 font-medium">
            {alerts.length > 0
              ? `${alerts.length} notification${alerts.length > 1 ? 's' : ''} from your AI assistant`
              : 'AI-generated alerts and briefings'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={fetchAlerts}
            className="p-2.5 rounded-xl border border-[#E4E6F0] text-[#8888AA] hover:bg-[#F7F8FC] hover:text-[#14142B] transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          {alerts.length > 0 && (
            <button
              onClick={clearAllAlerts}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#E4E6F0] text-sm font-medium text-[#EF4444] hover:bg-[#FEF2F2] hover:border-[#FCA5A5] transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-[#FEF2F2] border border-[#FCA5A5] text-[#EF4444] px-4 py-3 rounded-xl mb-6 text-sm font-medium">
          {error}
        </div>
      )}

      {alerts.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 bg-white rounded-[24px] border border-[#E4E6F0] border-dashed">
          <div className="bg-[#EEF0FF] w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5">
            <BellOff className="w-10 h-10 text-[#6B5CE7]" />
          </div>
          <h3 className="text-[#14142B] font-bold text-xl mb-2">No alerts yet</h3>
          <p className="text-[#8888AA] font-medium text-sm max-w-xs mx-auto">
            Alerts appear here when the AI detects deadline conflicts or sends your morning briefing.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {alerts.map(alert => {
            const style = getAlertStyle(alert.type);
            const Icon = style.icon;

            return (
              <div
                key={alert.id}
                className={`bg-white rounded-[20px] border ${!alert.is_read ? 'border-[#6B5CE7]' : 'border-[#E4E6F0]'} border-l-4 ${style.border} shadow-sm hover:shadow-md transition-all p-5 flex gap-4 relative overflow-hidden`}
              >
                {!alert.is_read && (
                  <div className="absolute top-0 right-0 w-16 h-16 bg-[#6B5CE7]/5 rounded-bl-[100px] pointer-events-none" />
                )}
                {/* Icon */}
                <div className={`flex-shrink-0 w-10 h-10 ${style.iconBg} rounded-xl flex items-center justify-center`}>
                  <Icon className={`w-5 h-5 ${style.iconColor}`} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${style.badge}`}>
                      {style.label}
                    </span>
                    <span className="text-[#8888AA] text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatAlertDate(alert.created_at)}
                      {!alert.is_read && <span className="ml-1 text-[10px] font-bold text-[#6B5CE7] bg-[#EEF0FF] px-1.5 py-0.5 rounded-md">NEW</span>}
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed whitespace-pre-line ${!alert.is_read ? 'text-[#14142B] font-semibold' : 'text-[#4A4A6A] font-medium'}`}>
                    {alert.message}
                  </p>
                </div>

                {/* Dismiss button */}
                <button
                  onClick={() => dismissAlert(alert.id)}
                  className="flex-shrink-0 p-1.5 rounded-lg text-[#CDD0E8] hover:text-[#EF4444] hover:bg-[#FEF2F2] transition-colors self-start"
                  title="Dismiss"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Info footer */}
      {alerts.length > 0 && (
        <div className="mt-8 flex items-center gap-2 text-xs text-[#8888AA] font-medium">
          <Bell className="w-3.5 h-3.5" />
          <span>Alerts are generated automatically by AI</span>
        </div>
      )}
    </div>
  );
}
