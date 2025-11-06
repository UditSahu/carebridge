-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE,
    anonymous_id TEXT UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Chat messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    citations INTEGER[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Channels table
CREATE TABLE IF NOT EXISTS channels (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    member_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Community messages table
CREATE TABLE IF NOT EXISTS community_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    channel_id UUID REFERENCES channels(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    anonymous_username TEXT NOT NULL,
    flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Therapists table
CREATE TABLE IF NOT EXISTS therapists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    specialty TEXT NOT NULL,
    credentials TEXT NOT NULL,
    availability TEXT,
    bio TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Counseling sessions table
CREATE TABLE IF NOT EXISTS counseling_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    therapist_id UUID REFERENCES therapists(id) ON DELETE SET NULL,
    type TEXT NOT NULL CHECK (type IN ('professional', 'ai_voice')),
    status TEXT NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
    scheduled_time TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Resources table
CREATE TABLE IF NOT EXISTS resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('article', 'video', 'audio', 'tool')),
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,
    duration_minutes INTEGER,
    content_url TEXT,
    thumbnail_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- User preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    concerns TEXT[],
    preferred_formats TEXT[],
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Saved resources table
CREATE TABLE IF NOT EXISTS saved_resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES resources(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, resource_id)
);

-- Citation sources table
CREATE TABLE IF NOT EXISTS citation_sources (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    author TEXT NOT NULL,
    url TEXT NOT NULL,
    publication_date DATE,
    category TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_created_at ON chat_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_community_messages_channel_id ON community_messages(channel_id);
CREATE INDEX IF NOT EXISTS idx_community_messages_created_at ON community_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_counseling_sessions_user_id ON counseling_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_counseling_sessions_therapist_id ON counseling_sessions(therapist_id);
CREATE INDEX IF NOT EXISTS idx_resources_category ON resources(category);
CREATE INDEX IF NOT EXISTS idx_saved_resources_user_id ON saved_resources(user_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply updated_at triggers
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_counseling_sessions_updated_at BEFORE UPDATE ON counseling_sessions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default channels
INSERT INTO channels (name, description, member_count) VALUES
    ('general', 'General Support', 142),
    ('anxiety', 'Anxiety Support', 89),
    ('depression', 'Depression Support', 67),
    ('recovery', 'Recovery Journey', 54)
ON CONFLICT (name) DO NOTHING;

-- Insert sample therapists
INSERT INTO therapists (name, specialty, credentials, availability, bio) VALUES
    ('Dr. Sarah Johnson', 'Anxiety & Depression', 'PhD, Licensed Psychologist', 'Next available: Tomorrow 2pm', 'Specializing in cognitive behavioral therapy with over 10 years of experience.'),
    ('Dr. Michael Chen', 'Trauma & PTSD', 'PsyD, EMDR Certified', 'Next available: Today 6pm', 'Expert in trauma-focused therapy and EMDR techniques.'),
    ('Dr. Emily Rodriguez', 'Family Therapy', 'LMFT, 15 years experience', 'Next available: Friday 10am', 'Experienced family and relationship therapist.')
ON CONFLICT DO NOTHING;

-- Insert sample resources
INSERT INTO resources (type, title, description, category, duration_minutes, content_url) VALUES
    ('article', 'Understanding Anxiety: A Comprehensive Guide', 'Learn about the science behind anxiety and evidence-based coping strategies.', 'Anxiety', 8, 'https://example.com/anxiety-guide'),
    ('video', 'Breathing Techniques for Stress Relief', 'Follow along with guided breathing exercises designed to reduce stress.', 'Stress', 12, 'https://example.com/breathing-video'),
    ('audio', 'Guided Meditation for Better Sleep', 'A calming meditation to help you relax and prepare for restful sleep.', 'Sleep', 20, 'https://example.com/sleep-meditation'),
    ('article', 'Building Healthy Relationships', 'Practical tips for improving communication and connection in relationships.', 'Relationships', 10, 'https://example.com/relationships-guide'),
    ('tool', 'Interactive Mood Tracker', 'Track your daily mood and identify patterns over time.', 'General', 5, 'https://example.com/mood-tracker')
ON CONFLICT DO NOTHING;

-- Insert sample citation sources
INSERT INTO citation_sources (title, author, url, category) VALUES
    ('Cognitive Behavioral Therapy for Anxiety', 'APA Guidelines', 'https://www.apa.org/ptsd-guideline/patients-and-families/cognitive-behavioral', 'Anxiety'),
    ('Mindfulness-Based Stress Reduction', 'Journal of Clinical Psychology', 'https://onlinelibrary.wiley.com/doi/abs/10.1002/jclp.22761', 'Stress'),
    ('Evidence-Based Practices in Mental Health', 'NIMH Research', 'https://www.nimh.nih.gov/health/topics/psychotherapies', 'General')
ON CONFLICT DO NOTHING;

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE counseling_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_resources ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Chat messages policies
CREATE POLICY "Users can view own chat messages" ON chat_messages
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own chat messages" ON chat_messages
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Community messages - anonymous viewing
CREATE POLICY "Anyone can view community messages" ON community_messages
    FOR SELECT USING (true);

CREATE POLICY "Users can insert community messages" ON community_messages
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- Counseling sessions policies
CREATE POLICY "Users can view own sessions" ON counseling_sessions
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can insert own sessions" ON counseling_sessions
    FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);

-- User preferences policies
CREATE POLICY "Users can view own preferences" ON user_preferences
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own preferences" ON user_preferences
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Saved resources policies
CREATE POLICY "Users can view own saved resources" ON saved_resources
    FOR SELECT USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can manage own saved resources" ON saved_resources
    FOR ALL USING (auth.uid()::text = user_id::text);

-- Public read access for reference tables
CREATE POLICY "Public read access for channels" ON channels
    FOR SELECT USING (true);

CREATE POLICY "Public read access for therapists" ON therapists
    FOR SELECT USING (true);

CREATE POLICY "Public read access for resources" ON resources
    FOR SELECT USING (true);

CREATE POLICY "Public read access for citation sources" ON citation_sources
    FOR SELECT USING (true);
