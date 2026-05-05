import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, Modal, Alert } from 'react-native';
import { Sparkles, Loader2, X, Check } from 'lucide-react-native';
import { useTasks, Task } from '../../hooks/useTasks';
import { useUser } from '../../hooks/useUser';
import StatCard from '../../components/StatCard';
import TaskItem from '../../components/TaskItem';
import { isToday, isThisWeek, parseISO } from 'date-fns';

export default function DashboardScreen() {
  const { tasks, isLoading, addTask, toggleTaskDone, deleteTask, updateTask, fetchTasks } = useTasks();
  const { displayName, user, updateName } = useUser();
  const [newTaskText, setNewTaskText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editPriority, setEditPriority] = useState(1);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchTasks();
    setRefreshing(false);
  };

  const handleAddTask = () => {
    if (!newTaskText.trim()) return;
    addTask(newTaskText);
    setNewTaskText('');
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
        <Text style={styles.loadingText}>Loading your tasks...</Text>
      </View>
    );
  }

  const tasksToday = tasks.filter(t => t.deadline && isToday(parseISO(t.deadline)) && !t.is_done).length;
  const dueThisWeek = tasks.filter(t => t.deadline && isThisWeek(parseISO(t.deadline)) && !t.is_done).length;
  const completedTasks = tasks.filter(t => t.is_done).length;

  const hour = new Date().getHours();
  let greetingText = 'Good evening';
  if (hour >= 5 && hour < 12) greetingText = 'Good morning';
  else if (hour >= 12 && hour < 17) greetingText = 'Good afternoon';

  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.title === '⚠️ AI Parsing Failed') return -1;
    if (b.title === '⚠️ AI Parsing Failed') return 1;
    const da = a.deadline ? new Date(a.deadline).getTime() : Infinity;
    const db = b.deadline ? new Date(b.deadline).getTime() : Infinity;
    return da - db;
  });

  return (
    <View style={styles.container}>
      <ScrollView 
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6B5CE7" />
        }
      >
        <View style={styles.header}>
          <Text style={styles.greeting}>{greetingText}, {displayName || 'there'} 👋</Text>
          <Text style={styles.date}>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</Text>
        </View>

        <View style={styles.addBar}>
          <Sparkles size={20} color="#6B5CE7" style={styles.addIcon} />
          <TextInput
            style={styles.addInput}
            placeholder='Type anything — "math exam Friday"'
            placeholderTextColor="#8888AA"
            value={newTaskText}
            onChangeText={setNewTaskText}
            onSubmitEditing={handleAddTask}
          />
          <TouchableOpacity 
            style={[styles.addButton, !newTaskText.trim() && styles.addButtonDisabled]} 
            onPress={handleAddTask}
            disabled={!newTaskText.trim()}
          >
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsRow}>
          <StatCard value={tasksToday} label="Tasks today" isPrimary />
          <StatCard value={dueThisWeek} label="Due this week" />
          <StatCard value={completedTasks} label="Completed" />
        </View>

        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>YOUR TASKS</Text>
          
          {sortedTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <View style={styles.emptyIcon}>
                <Sparkles size={32} color="#6B5CE7" />
              </View>
              <Text style={styles.emptyTitle}>Welcome to Platodo!</Text>
              <Text style={styles.emptyText}>Type a task above to get started.</Text>
            </View>
          ) : (
            sortedTasks.map(task => (
              <TaskItem 
                key={task.id} 
                task={task} 
                onToggleDone={toggleTaskDone} 
                onOptionsPress={openOptions} 
              />
            ))
          )}
        </View>
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
                <Text style={styles.deleteButtonText}>Delete Task</Text>
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

import { ActivityIndicator } from 'react-native';

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
    marginBottom: 24,
  },
  greeting: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 28,
    color: '#14142B',
    marginBottom: 4,
  },
  date: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 14,
    color: '#8888AA',
  },
  addBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#C4BEFA',
    borderRadius: 16,
    padding: 8,
    marginBottom: 24,
  },
  addIcon: {
    marginLeft: 8,
    marginRight: 8,
  },
  addInput: {
    flex: 1,
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: '#14142B',
    height: 40,
  },
  addButton: {
    backgroundColor: '#6B5CE7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    fontFamily: 'DMSans_700Bold',
    color: '#FFFFFF',
    fontSize: 14,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 32,
  },
  tasksSection: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    color: '#8888AA',
    letterSpacing: 1,
    marginBottom: 16,
    marginLeft: 4,
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
