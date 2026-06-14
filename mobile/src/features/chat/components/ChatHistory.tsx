import { View, StyleSheet, Text, FlatList, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface ChatSession {
  id: string;
  title: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
}

interface ChatHistoryProps {
  sessions: ChatSession[];
  onSelect: (id: string) => void;
}

export function ChatHistory({ sessions, onSelect }: ChatHistoryProps) {
  return (
    <FlatList
      data={sessions}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.session} onPress={() => onSelect(item.id)}>
          <View style={styles.sessionIcon}>
            <Ionicons name="chatbubble" size={20} color="#00D4FF" />
          </View>
          <View style={styles.sessionContent}>
            <Text style={styles.sessionTitle}>{item.title}</Text>
            <Text style={styles.sessionMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
          </View>
          {item.unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      )}
    />
  );
}

const styles = StyleSheet.create({
  session: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  sessionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  sessionContent: {
    flex: 1,
  },
  sessionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  sessionMessage: {
    fontSize: 12,
    color: '#666666',
  },
  badge: {
    backgroundColor: '#00D4FF',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#000000',
  },
});
