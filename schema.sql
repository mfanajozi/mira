-- Create reports table to store both voice and text messages
CREATE TABLE IF NOT EXISTS reports (
    id SERIAL PRIMARY KEY,
    type VARCHAR(10) NOT NULL, -- 'text', 'voice', or 'image'
    content TEXT, -- message body or file path/URL
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    is_anonymous BOOLEAN DEFAULT TRUE
);

-- Index for faster queries on report types
CREATE INDEX IF NOT EXISTS idx_reports_type ON reports(type);
