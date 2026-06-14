"""Zen API client — async chat completion via Zen API."""

import httpx
import json
from typing import AsyncGenerator, Optional
from app.core.config import settings


class ZenAPIClient:
    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.ZEN_API_KEY
        self.base_url = "https://api.zen.ai/v1"

    async def chat_completion(
        self,
        messages: list,
        model: str = "qwen3.6-plus",
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> str:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers={"Authorization": f"Bearer {self.api_key}"},
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                },
            )
            response.raise_for_status()
            data = response.json()
            return data["choices"][0]["message"]["content"]

    async def chat_stream(
        self,
        messages: list,
        model: str = "qwen3.6-plus",
        temperature: float = 0.7,
    ) -> AsyncGenerator[str, None]:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                "POST",
                f"{self.base_url}/chat/completions",
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "Content-Type": "application/json",
                    "Accept": "text/event-stream",
                },
                json={
                    "model": model,
                    "messages": messages,
                    "temperature": temperature,
                    "stream": True,
                },
            ) as response:
                response.raise_for_status()
                async for line in response.aiter_lines():
                    if not line or not line.startswith("data: "):
                        continue
                    data = line[6:]
                    if data == "[DONE]":
                        break
                    try:
                        parsed = json.loads(data)
                        if parsed.get("choices") and parsed["choices"][0].get("delta"):
                            yield data
                    except json.JSONDecodeError:
                        continue
