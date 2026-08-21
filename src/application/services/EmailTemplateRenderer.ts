import * as fs from 'fs';
import * as path from 'path';
import Handlebars from 'handlebars';

export class EmailTemplateRenderer {
  /**
   * Renderiza un template HTML reemplazando los placeholders con los datos proporcionados
   * @param templateName Nombre del template (sin extensión .html)
   * @param data Datos para reemplazar en el template
   * @returns HTML renderizado
   */
  static render(templateName: string, data: any): string {
    try {
      // Usar path.resolve para asegurar que la ruta sea correcta tanto en desarrollo como en producción
      const templatePath = path.resolve(
        __dirname,
        'email-templates',
        `${templateName}.html`
      );

      // Leer el template
      const templateContent = fs.readFileSync(templatePath, 'utf-8');

      // Compilar con Handlebars
      const template = Handlebars.compile(templateContent);

      // Renderizar con los datos
      return template(data);
    } catch (error: any) {
      throw new Error(`Error renderizando template ${templateName}: ${error.message}`);
    }
  }

  /**
   * Formatea un número como moneda
   */
  static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Formatea una fecha
   */
  static formatDate(date: string | Date): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return new Intl.DateTimeFormat('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  }
}

// Registrar helpers de Handlebars
Handlebars.registerHelper('formatCurrency', (amount: number) => {
  return EmailTemplateRenderer.formatCurrency(amount);
});

Handlebars.registerHelper('formatDate', (date: string | Date) => {
  return EmailTemplateRenderer.formatDate(date);
});
