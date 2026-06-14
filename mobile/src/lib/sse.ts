import * as SecureStore from 'expo-secure-store';
import { API_URL } from './api';

export interface SSEOptions {
  endpoint: string;
  body?: unknown;
  onEvent?: (event: string, data: string) => void;
  onMessage?: (data: string) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export async function createSSEConnection(options: SSEOptions): Promise<AbortController> {
  const controller = new AbortController();
  const token = await SecureStore.getItemAsync('access_token');

  try {
    const response = await fetch(`${API_URL}${options.endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        Accept: 'text/event-stream',
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`SSE request failed with status ${response.status}`);
    }

    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      let currentEvent = '';
      for (const line of lines) {
        if (line.startsWith('event: ')) {
          currentEvent = line.slice(7);
        } else if (line.startsWith('data: ')) {
          const data = line.slice(6);
          if (currentEvent === 'message_delta' || currentEvent === 'message_end') {
            options.onMessage?.(data);
          } else {
            options.onEvent?.(currentEvent, data);
          }
        } else if (line.startsWith('error: ')) {
          const errorData = line.slice(7);
          try {
            const parsed = JSON.parse(errorData);
            throw new Error(parsed.error || 'Stream error');
          } catch {
            throw new Error(errorData);
          }
        }
      }
    }

    options.onComplete?.();
  } catch (error) {
    if (error instanceof Error && error.name !== 'AbortError') {
      options.onError?.(error);
    }
  }

  return controller;
}
