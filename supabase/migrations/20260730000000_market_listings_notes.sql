-- Add free-text notes field (max 500 chars) to market listings (supply + demand)
ALTER TABLE market_listings
  ADD COLUMN IF NOT EXISTS notes TEXT CHECK (char_length(notes) <= 500);
