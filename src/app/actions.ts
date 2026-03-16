'use server';

import { logToDatabase } from '../lib/db';

export async function sendReportAction(type: 'text' | 'voice', content: string) {
  return await logToDatabase(type, content);
}
