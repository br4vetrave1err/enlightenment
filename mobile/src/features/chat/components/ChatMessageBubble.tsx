import { View, StyleSheet, Text } from 'react-native';
import { ChatMessage } from '../../../lib/api-client';

interface ChatMessageBubbleProps {
  message: ChatMessage;
}

export function ChatMessageBubble({ message }: ChatMessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.agentContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.agentBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.agentText]}>
          {message.content}
        </Text>
      </View>
      <Text style={styles.timestamp}>
        {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    maxWidth: '80%',
  },
  userContainer: {
    alignSelf: 'flex-end',
  },
  agentContainer: {
    alignSelf: 'flex-start',
  },
  bubble: {
    borderRadius: 16,
    padding: 12,
  },
  userBubble: {
    backgroundColor: '#00D4FF',
    borderBottomRightRadius: 4,
  },
  agentBubble: {
    backgroundColor: '#1A1A2E',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 14,
    lineHeight: 20,
  },
  userText: {
    color: '#000000',
  },
  agentText: {
    color: '#FFFFFF',
  },
  timestamp: {
    fontSize: 10,
    color: '#666666',
    marginTop: 4,
    marginHorizontal: 4,
  },
});
