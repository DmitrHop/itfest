"""Gemini LLM service with career counselor persona."""

import google.generativeai as genai
from typing import Tuple, Optional

from src.config.config import config
from src.utils.logger import logger


# System prompt for career counselor persona
SYSTEM_PROMPT = """
Ты — профессиональный профориентолог Казахстана с 15-летним опытом работы в сфере образования.

Твой стиль общения:
- Эмпатичный и поддерживающий
- Задаёшь уточняющие вопросы при необходимости
- Даёшь реалистичные, но мотивирующие советы
- Учитываешь финансовую ситуацию семьи
- Говоришь на понятном языке, избегая сложных терминов

ВСЕГДА структурируй ответ так:

1. 📊 **Анализ ситуации студента**
   Кратко проанализируй запрос и ключевые факторы

2. 🎯 **Топ-3 рекомендации с обоснованием:**
   Для каждого университета укажи:
   - 🏛️ Университет + специальность
   - ✅ Почему подходит
   - 📋 Требования и шансы поступления (баллы ЕНТ, предметы)
   - 💰 Стоимость обучения (если известно)

3. 🔄 **Альтернативные варианты**
   Укажи 1-2 запасных варианта

4. 📝 **Конкретный план действий**
   Пошаговые действия для поступления

5. 💪 **Мотивационное заключение**
   Поддержи абитуриента

Используй эмодзи для структуры, пиши на русском языке, будь конкретным с цифрами.
Если информации недостаточно для полного ответа, честно скажи об этом и предложи уточнить вопрос.
"""


class LLMService:
    """Gemini LLM service for generating responses."""
    
    def __init__(self, api_key: str):
        if not api_key or api_key == "your_gemini_api_key_here":
            raise ValueError("Valid Gemini API key is required")
        
        genai.configure(api_key=api_key)
        
        # Configure model
        self.model = genai.GenerativeModel(
            model_name="gemini-1.5-flash",
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 2048,
            },
            safety_settings=[
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
        )
        
        logger.info("Gemini LLM service initialized")
    
    def generate_answer(
        self, 
        question: str, 
        context: str, 
        temperature: float = 0.7
    ) -> Tuple[str, Optional[int]]:
        """Generate answer based on context."""
        try:
            # Build prompt
            prompt = f"""{SYSTEM_PROMPT}

---

КОНТЕКСТ (информация об университетах Казахстана):
{context}

---

ВОПРОС АБИТУРИЕНТА:
{question}

---

Дай развернутый ответ, используя ТОЛЬКО информацию из контекста выше.
Если в контексте нет нужной информации, честно скажи об этом.
"""
            
            # Generate response
            response = self.model.generate_content(prompt)
            
            answer = response.text
            tokens_used = None
            
            # Try to get token count
            try:
                if hasattr(response, 'usage_metadata'):
                    tokens_used = response.usage_metadata.total_token_count
            except:
                pass
            
            logger.info(f"Generated response ({len(answer)} chars)")
            return answer, tokens_used
            
        except Exception as e:
            logger.error(f"LLM generation error: {e}")
            return f"Извините, произошла ошибка при генерации ответа: {str(e)}", None
    
    def check_health(self) -> str:
        """Check if Gemini API is accessible."""
        try:
            response = self.model.generate_content("Привет")
            return "connected"
        except Exception as e:
            logger.error(f"Gemini health check failed: {e}")
            return f"error: {str(e)}"
