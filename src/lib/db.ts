import { neon } from '@neondatabase/serverless';

if (!process.env.NEON_DATABASE_URL) {
  throw new Error('NEON_DATABASE_URL is not defined');
}

export const sql = neon(process.env.NEON_DATABASE_URL);

/**
 * Logs a report to the database
 */
export async function logToDatabase(type: 'text' | 'voice', content: string) {
  try {
    await sql`
      INSERT INTO reports (type, content, is_anonymous)
      VALUES (${type}, ${content}, TRUE)
    `;
    return { success: true };
  } catch (error) {
    console.error('Database Error:', error);
    return { success: false, error };
  }
}
