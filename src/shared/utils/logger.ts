export class Logger {
  static log(message: string, data?: any) {
    console.log(`[${new Date().toISOString()}] ${message}`, data || '');
  }

  static error(message: string, error?: any) {
    console.error(`[${new Date().toISOString()}] ERROR: ${message}`, error || '');
  }
}