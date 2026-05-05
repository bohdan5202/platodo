import { View, Text, StyleSheet } from 'react-native';

interface StatCardProps {
  value: number;
  label: string;
  isPrimary?: boolean;
}

export default function StatCard({ value, label, isPrimary = false }: StatCardProps) {
  if (isPrimary) {
    return (
      <View style={[styles.card, styles.primaryCard]}>
        <Text style={[styles.value, styles.primaryText]}>{value}</Text>
        <Text style={[styles.label, styles.primaryText]}>{label}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.card, styles.defaultCard]}>
      <Text style={[styles.value, styles.defaultText]}>{value}</Text>
      <Text style={[styles.label, styles.defaultLabel]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 16,
    borderRadius: 24,
    marginHorizontal: 4,
    minHeight: 100,
    justifyContent: 'center',
  },
  primaryCard: {
    backgroundColor: '#6B5CE7',
    shadowColor: '#6B5CE7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  defaultCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E4E6F0',
  },
  value: {
    fontFamily: 'DMSans_700Bold',
    fontSize: 32,
    marginBottom: 4,
  },
  primaryText: {
    color: '#FFFFFF',
  },
  defaultText: {
    color: '#14142B',
  },
  label: {
    fontFamily: 'DMSans_500Medium',
    fontSize: 12,
  },
  defaultLabel: {
    color: '#8888AA',
  },
});
