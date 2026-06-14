import { API_URL } from './api';

interface StreamCallbacks {
  onToken?: (token: string) => void;
  onSources?: (sources: any[]) => void;
  onDone?: (sessionId: string) => void;
  onError?: (error: string) => void;
}

export async function chatStream(
  message: string,
  courseId?: string,
  nodeId?: string,
  callbacks?: StreamCallbacks
): Promise<void> {
  const token = localStorage.getItem('access_token');
  
  try {
    const response = await fetch(`${API_URL}/api/chat/stream`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        message,
        course_id: courseId,
        node_id: nodeId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Stream request failed: ${response.status}`);
    }

    if (!response.body) {
      throw new Error('ReadableStream not supported');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
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
          currentEvent = line.substring('event: '.length).trim();
        } else if (line.startsWith('data: ')) {
          const dataStr = line.substring('data: '.length).trim();
          if (dataStr) {
            try {
              const data = JSON.parse(dataStr);
              if (currentEvent === 'token' && callbacks?.onToken) {
                callbacks.onToken(data.token);
              } else if (currentEvent === 'sources' && callbacks?.onSources) {
                callbacks.onSources(data.sources);
              } else if (currentEvent === 'done' && callbacks?.onDone) {
                callbacks.onDone(data.session_id);
              } else if (currentEvent === 'error' && callbacks?.onError) {
                callbacks.onError(data.error);
              }
            } catch (e) {
              console.warn('Failed to parse SSE JSON data:', dataStr);
            }
          }
        }
      }
    }
  } catch (err: any) {
    if (callbacks?.onError) {
      callbacks.onError(err.message || 'Unknown stream error');
    }
  }
}
