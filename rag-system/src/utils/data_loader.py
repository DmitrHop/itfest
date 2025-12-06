"""Data loader for universities JSON."""

import json
from pathlib import Path
from typing import List, Dict
from src.utils.logger import logger


class DataLoader:
    """Load and process university data from JSON."""
    
    def __init__(self, data_path: str):
        self.data_path = Path(data_path)
        if not self.data_path.is_absolute():
            self.data_path = Path(__file__).parent.parent.parent / data_path
    
    def load_universities(self) -> List[Dict]:
        """Load universities from JSON file."""
        try:
            with open(self.data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            
            universities = data.get('universities', [])
            logger.info(f"Loaded {len(universities)} universities from {self.data_path.name}")
            return universities
            
        except FileNotFoundError:
            logger.error(f"File not found: {self.data_path}")
            raise
        except json.JSONDecodeError as e:
            logger.error(f"JSON parse error: {e}")
            raise
    
    def load_filters(self) -> Dict:
        """Load available filters from JSON."""
        try:
            with open(self.data_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
            return data.get('filters', {})
        except Exception as e:
            logger.error(f"Error loading filters: {e}")
            return {}
    
    def prepare_chunks(self, universities: List[Dict]) -> List[Dict]:
        """Prepare document chunks for vector indexing."""
        chunks = []
        
        for uni in universities:
            chunk_text = self._create_chunk_text(uni)
            
            # Ensure no None values in metadata (ChromaDB requirement)
            chunks.append({
                "id": f"uni_{uni['id']}",
                "text": chunk_text,
                "metadata": {
                    "id": uni['id'],
                    "name": uni.get('name', '') or '',
                    "city": uni.get('city', '') or '',
                    "category": uni.get('category', '') or '',
                    "direction": uni.get('direction', '') or '',
                    "type": uni.get('type', '') or '',
                    "programs": uni.get('programs', '') or '',
                    "education_levels": uni.get('education_levels', '') or '',
                    "ent_min_score": uni.get('ent_min_score', 0) or 0,
                    "ent_max_score": uni.get('ent_max_score', 0) or 0,
                    "profile_subjects": uni.get('profile_subjects', '') or '',
                    "email": uni.get('email', '') or '',
                    "phone": uni.get('phone', '') or '',
                    "address": uni.get('address', '') or ''
                }
            })
        
        logger.info(f"Prepared {len(chunks)} chunks for indexing")
        return chunks
    
    def _create_chunk_text(self, uni: Dict) -> str:
        """Create searchable text representation of university."""
        return f"""
Университет: {uni['name']}
Город: {uni['city']}
Тип: {uni['type']}
Категория: {uni['category']}
Направление: {uni['direction']}

Образовательные программы: {uni['programs']}
Уровни образования: {uni['education_levels']}

Вступительные требования:
- Проходной балл ЕНТ: от {uni['ent_min_score']} до {uni['ent_max_score']}
- Профильные предметы: {uni['profile_subjects']}

Контактная информация:
- Телефон: {uni.get('phone', 'не указан')}
- Email: {uni.get('email', 'не указан')}
- Адрес: {uni.get('address', 'не указан')}
""".strip()
