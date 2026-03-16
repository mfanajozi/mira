import * as FileSystem from 'expo-file-system';
import { neon } from '@neondatabase/serverless';

const REPORTS_DIRECTORY = `${(FileSystem as any).documentDirectory}reports/`;

// Initialize Neon client using the environment variable
const sql = neon(process.env.EXPO_PUBLIC_NEON_DATABASE_URL!);

/**
 * Ensures the reports directory exists
 */
export const ensureDirectoryExists = async () => {
  const dirInfo = await FileSystem.getInfoAsync(REPORTS_DIRECTORY);
  if (!dirInfo.exists) {
    await FileSystem.makeDirectoryAsync(REPORTS_DIRECTORY, { intermediates: true });
  }
};

/**
 * Saves a temporary recording to the permanent local reports folder
 */
import { Platform } from 'react-native';

export const saveAudioToLocal = async (tempUri: string): Promise<string> => {
  // Web does not support standard file system moves
  if (Platform.OS === 'web') {
    console.log('Voice report: Local storage skipped on Web platform.');
    return tempUri;
  }

  try {
    await ensureDirectoryExists();
    
    const docDir = (FileSystem as any).documentDirectory;
    if (!docDir) {
      return tempUri;
    }

    const fileName = `audio_report_${Date.now()}.m4a`;
    const permanentUri = `${REPORTS_DIRECTORY}${fileName}`;
    
    // Attempt copy for better reliability
    await FileSystem.copyAsync({
      from: tempUri,
      to: permanentUri,
    });
    
    return permanentUri;
  } catch (error) {
    console.warn('Could not save to permanent storage, falling back to tempUri:', error);
    return tempUri;
  }
};

/**
 * Connects to Neon and stores the report
 */
export const logToDatabase = async (type: 'text' | 'voice', content: string) => {
  try {
    console.log(`Attempting to save ${type} report to Neon...`);
    
    // Execute SQL directly using the serverless driver
    // Table: reports(id, type, content, created_at, is_anonymous)
    await sql`
      INSERT INTO reports (type, content, is_anonymous)
      VALUES (${type}, ${content}, TRUE)
    `;
    
    console.log('--- DATABASE SUCCESS ---');
    console.log(`Type: ${type} saved successfully.`);
    console.log('-------------------------');
  } catch (error) {
    console.error('--- DATABASE ERROR ---');
    console.error('Failed to log to Neon database:', error);
    console.error('Make sure EXPO_PUBLIC_NEON_DATABASE_URL is set correctly in .env');
    console.log('-----------------------');
    
    // Fallback: log to console if DB fails
    console.log('Fallback: Report would have been:', content);
  }
};
