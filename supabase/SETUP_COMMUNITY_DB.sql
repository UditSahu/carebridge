-- =====================================================
-- COMMUNITY DATABASE SETUP FOR SUPABASE
-- Run this in your Supabase SQL Editor
-- =====================================================

-- 1. Create channels table
CREATE TABLE IF NOT EXISTS channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  member_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create community_messages table (without foreign key on user_id for anonymous posting)
CREATE TABLE IF NOT EXISTS community_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- No foreign key constraint - allows anonymous users
  channel_id UUID NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  anonymous_username TEXT NOT NULL,
  flagged BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_community_messages_channel ON community_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_created ON community_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_flagged ON community_messages(flagged);

-- 4. Insert default channels
INSERT INTO channels (name, description, member_count) VALUES
  ('general', 'Open discussion for all mental health topics', 142),
  ('anxiety', 'Share experiences and coping strategies for anxiety', 87),
  ('depression', 'A safe space to discuss depression and recovery', 67),
  ('recovery', 'Celebrate wins and inspire others on the recovery journey', 54)
ON CONFLICT DO NOTHING;

-- 5. Enable Row Level Security
ALTER TABLE channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;

-- 6. Create RLS Policies for channels
DROP POLICY IF EXISTS "Anyone can view channels" ON channels;
CREATE POLICY "Anyone can view channels"
  ON channels FOR SELECT
  USING (true);

-- 7. Create RLS Policies for community_messages
DROP POLICY IF EXISTS "Anyone can view non-flagged messages" ON community_messages;
CREATE POLICY "Anyone can view non-flagged messages"
  ON community_messages FOR SELECT
  USING (flagged = false);

DROP POLICY IF EXISTS "Anyone can post messages" ON community_messages;
CREATE POLICY "Anyone can post messages"
  ON community_messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update messages" ON community_messages;
CREATE POLICY "Users can update messages"
  ON community_messages FOR UPDATE
  USING (true);

-- 8. Enable Realtime for community_messages
ALTER PUBLICATION supabase_realtime ADD TABLE community_messages;

-- 9. Create function to update member count
CREATE OR REPLACE FUNCTION update_channel_member_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE channels 
    SET member_count = member_count + 1 
    WHERE id = NEW.channel_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE channels 
    SET member_count = GREATEST(member_count - 1, 0) 
    WHERE id = OLD.channel_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- 10. Create trigger for member count
DROP TRIGGER IF EXISTS update_channel_members ON community_messages;
CREATE TRIGGER update_channel_members
AFTER INSERT OR DELETE ON community_messages
FOR EACH ROW
EXECUTE FUNCTION update_channel_member_count();

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('channels', 'community_messages');

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('channels', 'community_messages');

-- View channels
SELECT * FROM channels ORDER BY name;

-- View recent messages
SELECT 
  cm.id,
  cm.anonymous_username,
  cm.content,
  c.name as channel_name,
  cm.created_at
FROM community_messages cm
JOIN channels c ON cm.channel_id = c.id
ORDER BY cm.created_at DESC
LIMIT 10;
