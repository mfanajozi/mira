import { neon } from '@neondatabase/serverless';

/**
 * Lazy initializer for the SQL client
 */
const getSql = () => {
  if (!process.env.NEON_DATABASE_URL) {
    throw new Error('NEON_DATABASE_URL is not defined in environment variables');
  }
  return neon(process.env.NEON_DATABASE_URL);
};

/**
 * Logs a report to the database
 */
export async function logToDatabase(type: 'text' | 'voice', content: string) {
  try {
    const sql = getSql();
    await sql`
      INSERT INTO reports (type, content, is_anonymous)
      VALUES (${type}, ${content}, TRUE)
    `;
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}
