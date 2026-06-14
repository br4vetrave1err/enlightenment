import { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, FlatList, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useChatStore } from '../../../lib/store/chat-store';
import { ChatMessageBubble } from '../../../features/chat/components/ChatMessageBubble';
import { ChatInput } from '../../../features/chat/components/ChatInput';
import { TypingIndicator } from '../../../features/chat/components/TypingIndicator';
import { ChatHistory } from '../../../features/chat/components/ChatHistory';

export default function ChatScreen() {
  const { messages, sendMessage, isTyping } = useChatStore();
  const flatListRef = useRef<FlatList>(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    flatListRef.current?.scrollToEnd({ animated: true });
  }, [messages, isTyping]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setShowHistory(!showHistory)} style={styles.historyButton}>
          <Ionicons name="chatbubbles" size={24} color="#FFD700" />
        </TouchableOpacity>
        <View style={styles.headerDot} />
        <View style={styles.headerTitle}>Cosmic Guide</View>
      </View>

      {showHistory && (
        <View style={styles.historyContainer}>
          <ChatHistory />
        </View>
      )}

      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ChatMessageBubble message={item} />}
        contentContainerStyle={styles.messagesList}
        ListFooterComponent={isTyping ? <TypingIndicator /> : null}
      />

      <ChatInput onSend={sendMessage} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A1A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#0A0A1A',
    borderBottomWidth: 1,
    borderBottomColor: '#1A1A2E',
  },
  historyButton: {
    marginRight: 12,
  },
  headerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#00D4FF',
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  historyContainer: {
    backgroundColor: '#1A1A2E',
    borderBottomWidth: 1,
    borderBottomColor: '#2A2A4E',
  },
  messagesList: {
    padding: 16,
    flexGrow: 1,
  },
});
