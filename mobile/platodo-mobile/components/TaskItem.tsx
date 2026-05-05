import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Circle, CheckCircle2, AlertCircle, MoreVertical } from 'lucide-react-native';
import { Task } from '../hooks/useTasks';
import { format, parseISO } from 'date-fns';

const PRIORITIES = [
  { value: 5, label: 'P5 — Critical', color: '#EF4444', bg: '#FEE2E2' },
  { value: 4, label: 'P4 — High', color: '#F59E0B', bg: '#FEF3C7' },
  { value: 3, label: 'P3 — Medium', color: '#6B5CE7', bg: '#EEF0FF' },
  { value: 2, label: 'P2 — Low', color: '#0EA5A0', bg: '#E0F7F6' },
  { value: 1, label: 'P1 — Minimal', color: '#8888AA', bg: '#F7F8FC' },
];

interface TaskItemProps {
  task: Task;
  onToggleDone: (id: string, currentStatus: boolean) => void;
  onOptionsPress: (task: Task) => void;
}

export default function TaskItem({ task, onToggleDone, onOptionsPress }: TaskItemProps) {
  const isParsing = task.title === null;
  const isError = task.title === '⚠️ AI Parsing Failed';
  
  const priorityData = PRIORITIES.find(p => p.value === task.priority);

  return (
    <View style={[
      styles.container,
      isError ? styles.errorContainer : undefined,
      task.is_done ? styles.doneContainer : undefined
    ]}>
      {!isError ? (
        <TouchableOpacity 
          style={styles.checkbox} 
          onPress={() => onToggleDone(task.id, task.is_done)}
        >
          {task.is_done ? (
            <CheckCircle2 color="#10B981" size={26} />
          ) : (
            <Circle color="#CDD0E8" size={26} />
          )}
        </TouchableOpacity>
      ) : (
        <View style={styles.checkbox}>
          <AlertCircle color="#EF4444" size={26} />
        </View>
      )}

      <View style={styles.content}>
        {isParsing ? (
          <View style={styles.parsingContainer}>
            <Text style={styles.title}>{task.raw_input}</Text>
            <View style={styles.parsingBadge}>
              <Text style={styles.parsingText}>AI parsing...</Text>
            </View>
          </View>
        ) : isError ? (
          <View>
            <Text style={styles.errorTitle}>{task.title}</Text>
            <Text style={styles.errorText}>
              We couldn't understand: "{task.raw_input}". Please edit to set details manually.
            </Text>
          </View>
        ) : (
          <View>
            <Text style={[styles.title, task.is_done && styles.doneTitle]}>
              {task.title}
            </Text>
            <View style={styles.metadata}>
              {task.deadline && (
                <Text style={styles.metaText}>
                  Due {format(parseISO(task.deadline), 'MMM d')}
                </Text>
              )}
              {task.deadline && task.subject && <Text style={styles.metaDot}>•</Text>}
              {task.subject && (
                <View style={styles.subjectBadge}>
                  <Text style={styles.subjectText}>{task.subject}</Text>
                </View>
              )}
            </View>
          </View>
        )}
      </View>

      {!isParsing && (
        <View style={styles.actions}>
          <View style={[styles.priorityBadge, { backgroundColor: priorityData?.bg || '#F7F8FC' }]}>
            <Text style={[styles.priorityText, { color: priorityData?.color || '#8888AA' }]}>
              P{task.priority}
            </Text>
          </View>
          <TouchableOpacity style={styles.moreButton} onPress={() => onOptionsPress(task)}>
            <MoreVertical size={20} color="#8888AA" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderWidth: 1,
    borderColor: '#E4E6F0',
    marginBottom: 12,
  },
  errorContainer: {
    borderColor: '#FCA5A5',
    backgroundColor: '#FEF2F2',
  },
  doneContainer: {
    opacity: 0.6,
    backgroundColor: '#F7F8FC',
  },
  checkbox: {
    marginRight: 12,
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  parsingContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: 8,
  },
  title: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 15,
    color: '#14142B',
    lineHeight: 20,
  },
  doneTitle: {
    textDecorationLine: 'line-through',
    color: '#8888AA',
  },
  errorTitle: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 15,
    color: '#EF4444',
  },
  errorText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: '#EF4444',
    marginTop: 4,
    opacity: 0.8,
  },
  parsingBadge: {
    backgroundColor: '#EEF0FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  parsingText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
    color: '#6B5CE7',
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    flexWrap: 'wrap',
    gap: 6,
  },
  metaText: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
    color: '#8888AA',
  },
  metaDot: {
    color: '#E4E6F0',
    fontSize: 12,
  },
  subjectBadge: {
    backgroundColor: '#E0F7F6',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  subjectText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 10,
    color: '#0EA5A0',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 11,
  },
  moreButton: {
    padding: 4,
    marginLeft: 4,
  },
});
