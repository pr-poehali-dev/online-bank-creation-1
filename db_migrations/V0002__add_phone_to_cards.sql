-- Добавление поля phone к таблице cards
ALTER TABLE cards ADD COLUMN IF NOT EXISTS phone VARCHAR(20);

-- Создание уникального индекса для phone (может быть NULL, но уникальным если заполнен)
CREATE UNIQUE INDEX IF NOT EXISTS idx_cards_phone ON cards(phone) WHERE phone IS NOT NULL;