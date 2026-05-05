import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator, Modal, TextInput } from 'react-native';
import { useTasks, Task } from '../../hooks/useTasks';
import { useAlerts } from '../../hooks/useAlerts';
import TaskItem from '../../components/TaskItem';
import { Calendar as CalendarIcon, Clock, X, Check } from 'lucide-react-native';
import { format, parseISO, isToday, isTomorrow, isPast, isAfter, endOfTomorrow, addDays } from 'date-fns';

export default function PlannerScreen() {
  const { tasks, isLoading, toggleTaskDone, updateTaskDate, updateTask, deleteTask, fetchTasks } = useTasks();
  const [refreshing, setRefreshing] = useState(false);

  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState(1);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const openOptions = (task: Task) => {
    setSelectedTask(task);
    setEditTitle(task.title || '');
    setEditPriority(task.priority || 1);
  };

  const handleSaveEdit = () => {
    if (selectedTask) {
      updateTask(selectedTask.id, { title: editTitle, priority: editPriority });
      setSelectedTask(null);
    }
  };

  const handleDelete = () => {
    if (selectedTask) {
      deleteTask(selectedTask.id);
      setSelectedTask(null);
    }
  };

  if (isLoading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6B5CE7" />
        <Text style={styles.loadingText}>Loading your planner...</Text>
      </View>
    );
  }

  const pendingSync = tasks.filter(t => !t.is_done && t.title === null);
  const unscheduled = tasks.filter(t => !t.is_done && t.title !== null && t.planned_date === null);
  const overdue = tasks.filter(t => t.planned_date && isPast(parseISO(t.planned_date)) && !isToday(parseISO(t.planned_date)) && !t.is_done);
  const today = tasks.filter(t => t.planned_date && isToday(parseISO(t.planned_date)));
  const tomorrow = tasks.filter(t => t.planned_date && isTomorrow(parseISO(t.planned_date)));
  const upcomingRaw = tasks.filter(t => t.planned_date && isAfter(parseISO(t.planned_date), endOfTomorrow()));

  const upcomingByDate = upcomingRaw.reduce<Record<string, Task[]>>((acc, task) => {
    const key = format(parseISO(task.planned_date!), 'dd.MM.yyyy');
    if (!acc[key]) acc[key] = [];
    acc[key].push(task);
    return acc;
  }, {});
  
  const upcomingDateKeys = Object.keys(upcomingByDate).sort((a, b) => {
    const [da, ma, ya] = a.split('.').map(Number);
    const [db, mb, yb] = b.split('.').map(Number);
    return new Date(ya, ma - 1, da).getTime() - new Date(yb, mb - 1, db).getTime();
  });

  const sections = [
    { title: "Pending AI Sync", tasks: pendingSync, color: "#F59E0B", badgeBg: "#FEF3C7" },
    { title: "Unscheduled", tasks: unscheduled, color: "#8888AA", badgeBg: "#F7F8FC" },
    { title: "Overdue (Planned)", tasks: overdue, color: "#EF4444", badgeBg: "#FEE2E2" },
    { title: "Today", tasks: today, color: "#6B5CE7", badgeBg: "#EEF0FF" },
    { title: "Tomorrow", tasks: tomorrow, color: "#0EA5A0", badgeBg: "#E0F7F6" },
  ];

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B5CE7" />}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Planner</Text>
          <Text style={styles.subtitle}>Your tasks organized by planned work date.</Text>
        </View>

        {sections.map(section => {
          if (section.tasks.length === 0) return null;
          return (
            <View key={section.title} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={[styles.sectionTitle, { color: section.color }]}>{section.title}</Text>
                <View style={[styles.badge, { backgroundColor: section.badgeBg }]}>
                  <Text style={[styles.badgeText, { color: section.color }]}>{section.tasks.length}</Text>
                </View>
              </View>
              {section.tasks.map(task => (
                <TaskItem key={task.id} task={task} onToggleDone={toggleTaskDone} onOptionsPress={openOptions} />
              ))}
            </View>
          );
        })}

        {upcomingDateKeys.map(dateKey => (
          <View key={dateKey} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, { color: '#8888AA' }]}>{dateKey}</Text>
              <View style={[styles.badge, { backgroundColor: '#F7F8FC' }]}>
                <Text style={[styles.badgeText, { color: '#8888AA' }]}>{upcomingByDate[dateKey].length}</Text>
              </View>
            </View>
            {upcomingByDate[dateKey].map(task => (
              <TaskItem key={task.id} task={task} onToggleDone={toggleTaskDone} onOptionsPress={openOptions} />
            ))}
          </View>
        ))}

        {tasks.length === 0 && (
          <View style={styles.emptyState}>
            <View style={styles.emptyIcon}>
              <CalendarIcon size={32} color="#6B5CE7" />
            </View>
            <Text style={styles.emptyTitle}>Your planner is empty</Text>
            <Text style={styles.emptyText}>When you add tasks with dates, they will automatically appear here grouped by day.</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={!!selectedTask}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTask(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Edit Task</Text>
              <TouchableOpacity onPress={() => setSelectedTask(null)}>
                <X size={24} color="#8888AA" />
              </TouchableOpacity>
            </View>
            
            <TextInput
              style={styles.modalInput}
              value={editTitle}
              onChangeText={setEditTitle}
              placeholder="Task title"
            />
            
            <Text style={styles.label}>Priority</Text>
            <View style={styles.priorityRow}>
              {[1, 2, 3, 4, 5].map(p => (
                <TouchableOpacity
                  key={p}
                  style={[styles.priorityBtn, editPriority === p && styles.priorityBtnActive]}
                  onPress={() => setEditPriority(p)}
                >
                  <Text style={[styles.priorityBtnText, editPriority === p && styles.priorityBtnTextActive]}>P{p}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Text style={styles.deleteButtonText}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSaveEdit}>
                <Check size={16} color="#fff" />
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    marginBottom: 32,
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
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 43, 0.5)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 18,
    color: '#14142B',
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E4E6F0',
    borderRadius: 12,
    padding: 16,
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    marginBottom: 16,
  },
  label: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 13,
    color: '#4A4A6A',
    marginBottom: 8,
  },
  priorityRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 32,
  },
  priorityBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E4E6F0',
  },
  priorityBtnActive: {
    borderColor: '#6B5CE7',
    backgroundColor: '#EEF0FF',
  },
  priorityBtnText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 12,
    color: '#8888AA',
  },
  priorityBtnTextActive: {
    color: '#6B5CE7',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  deleteButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
  },
  deleteButtonText: {
    fontFamily: 'DMSans_700Bold',
    color: '#EF4444',
    fontSize: 14,
  },
  saveButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#6B5CE7',
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveButtonText: {
    fontFamily: 'DMSans_700Bold',
    color: '#FFFFFF',
    fontSize: 14,
  },
});
