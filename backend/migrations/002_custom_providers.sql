CREATE TABLE IF NOT EXISTS custom_providers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  token_encrypted TEXT NOT NULL,
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

ALTER TABLE custom_providers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own custom providers"
  ON custom_providers FOR ALL
  USING (auth.uid() = user_id);

CREATE INDEX idx_custom_providers_user_id ON custom_providers(user_id);
