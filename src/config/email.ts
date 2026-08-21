export interface EmailConfig {
  provider: 'smtp' | 'mailgun';
  fromEmail: string;
  fromName: string;
  smtp?: {
    host: string;
    port: number;
    username: string;
    password: string;
    encryption: 'tls' | 'ssl' | 'none';
  };
  mailgun?: {
    domain: string;
    secret: string;
  };
}

/**
 * Determina qué proveedor de correo usar basado en las variables de entorno disponibles
 */
function determineProvider(): 'smtp' | 'mailgun' {
  // Prioridad: Mailgun si está configurado, sino SMTP
  if (process.env.MAILGUN_DOMAIN && process.env.MAILGUN_SECRET) {
    return 'mailgun';
  }
  
  if (process.env.MAIL_HOST && process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD) {
    return 'smtp';
  }
  
  // Por defecto SMTP si no hay configuración (para desarrollo)
  return 'smtp';
}

export const emailConfig: EmailConfig = {
  provider: determineProvider(),
  fromEmail: process.env.MAIL_FROM_EMAIL || 'noreply@borboleta.com',
  fromName: process.env.MAIL_FROM_NAME || 'Borboleta',
  smtp: process.env.MAIL_HOST ? {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.MAIL_PORT || '587', 10),
    username: process.env.MAIL_USERNAME || '',
    password: process.env.MAIL_PASSWORD || '',
    encryption: (process.env.MAIL_ENCRYPTION as 'tls' | 'ssl' | 'none') || 'tls',
  } : undefined,
  mailgun: process.env.MAILGUN_DOMAIN && process.env.MAILGUN_SECRET ? {
    domain: process.env.MAILGUN_DOMAIN,
    secret: process.env.MAILGUN_SECRET,
  } : undefined,
};
