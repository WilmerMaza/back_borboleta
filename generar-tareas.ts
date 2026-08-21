#!/usr/bin/env ts-node

/**
 * Generador de Lista de Tareas Detallada para Back Borboleta
 * 
 * Este script analiza el contexto del proyecto y genera una lista
 * estructurada de tareas para implementar funcionalidades o resolver problemas.
 * 
 * Uso: ts-node generar-tareas.ts [descripción de la tarea]
 */

import * as fs from 'fs';
import * as path from 'path';

interface Task {
  id: string;
  title: string;
  description: string;
  layer?: string;
  priority: 'alta' | 'media' | 'baja';
  dependencies?: string[];
  estimatedTime?: string;
}

interface TaskList {
  project: string;
  description: string;
  tasks: Task[];
  suggestions: string[];
}

class TaskGenerator {
  private taskIdCounter: number = 1;

  /**
   * Genera una lista de tareas basada en el requerimiento
   */
  generateTaskList(requirement: string): TaskList {
    const tasks: Task[] = [];
    const suggestions: string[] = [];

    // Analizar el requerimiento para determinar el tipo de tarea
    const taskType = this.analyzeRequirement(requirement);

    // Generar tareas según el tipo
    switch (taskType) {
      case 'new-feature':
        tasks.push(...this.generateNewFeatureTasks(requirement));
        suggestions.push(...this.getNewFeatureSuggestions());
        break;
      case 'bug-fix':
        tasks.push(...this.generateBugFixTasks(requirement));
        suggestions.push(...this.getBugFixSuggestions());
        break;
      case 'refactor':
        tasks.push(...this.generateRefactorTasks(requirement));
        suggestions.push(...this.getRefactorSuggestions());
        break;
      case 'integration':
        tasks.push(...this.generateIntegrationTasks(requirement));
        suggestions.push(...this.getIntegrationSuggestions());
        break;
      default:
        tasks.push(...this.generateGenericTasks(requirement));
        suggestions.push(...this.getGenericSuggestions());
    }

    return {
      project: 'Back Borboleta - Ecommerce Backend',
      description: requirement,
      tasks,
      suggestions
    };
  }

  /**
   * Analiza el requerimiento para determinar el tipo de tarea
   */
  private analyzeRequirement(requirement: string): string {
    const lowerReq = requirement.toLowerCase();
    
    if (lowerReq.includes('nuevo') || lowerReq.includes('crear') || 
        lowerReq.includes('agregar') || lowerReq.includes('implementar')) {
      return 'new-feature';
    }
    
    if (lowerReq.includes('error') || lowerReq.includes('bug') || 
        lowerReq.includes('corregir') || lowerReq.includes('arreglar')) {
      return 'bug-fix';
    }
    
    if (lowerReq.includes('refactor') || lowerReq.includes('mejorar') || 
        lowerReq.includes('optimizar')) {
      return 'refactor';
    }
    
    if (lowerReq.includes('integrar') || lowerReq.includes('wompi') || 
        lowerReq.includes('firebase') || lowerReq.includes('api')) {
      return 'integration';
    }
    
    return 'generic';
  }

  /**
   * Genera tareas para una nueva funcionalidad
   */
  private generateNewFeatureTasks(_requirement: string): Task[] {
    const tasks: Task[] = [];

    // Preparación
    tasks.push({
      id: this.getTaskId(),
      title: 'Análisis y Diseño',
      description: 'Analizar el requerimiento, revisar documentación existente y diseñar la solución siguiendo Clean Architecture',
      priority: 'alta',
      estimatedTime: '30-60 min'
    });

    // Domain Layer
    tasks.push({
      id: this.getTaskId(),
      title: 'Crear Entidades de Dominio',
      description: 'Definir interfaces y entidades en src/domain/entities/ siguiendo el patrón existente',
      layer: 'Domain',
      priority: 'alta',
      dependencies: [tasks[0].id],
      estimatedTime: '30-45 min'
    });

    tasks.push({
      id: this.getTaskId(),
      title: 'Crear Interfaces de Repositorio',
      description: 'Definir interfaces de repositorio en src/domain/repositories/',
      layer: 'Domain',
      priority: 'alta',
      dependencies: [tasks[1].id],
      estimatedTime: '15-30 min'
    });

    // Infrastructure Layer
    tasks.push({
      id: this.getTaskId(),
      title: 'Crear Modelos de Base de Datos',
      description: 'Implementar modelos Mongoose en src/infrastructure/database/models/ con esquemas y validaciones',
      layer: 'Infrastructure',
      priority: 'alta',
      dependencies: [tasks[1].id],
      estimatedTime: '45-60 min'
    });

    tasks.push({
      id: this.getTaskId(),
      title: 'Implementar Repositorios',
      description: 'Implementar repositorios concretos en src/infrastructure/repositories/',
      layer: 'Infrastructure',
      priority: 'alta',
      dependencies: [tasks[2].id, tasks[3].id],
      estimatedTime: '45-60 min'
    });

    tasks.push({
      id: this.getTaskId(),
      title: 'Registrar en Contenedor DI',
      description: 'Registrar servicios y repositorios en src/infrastructure/di/registry.ts',
      layer: 'Infrastructure',
      priority: 'media',
      dependencies: [tasks[4].id],
      estimatedTime: '15 min'
    });

    // Application Layer
    tasks.push({
      id: this.getTaskId(),
      title: 'Crear Servicios de Aplicación',
      description: 'Implementar servicios de negocio en src/application/services/ con la lógica requerida',
      layer: 'Application',
      priority: 'alta',
      dependencies: [tasks[4].id],
      estimatedTime: '60-90 min'
    });

    // Presentation Layer
    tasks.push({
      id: this.getTaskId(),
      title: 'Crear Controlador',
      description: 'Implementar controlador en src/presentation/controllers/ con manejo de errores',
      layer: 'Presentation',
      priority: 'alta',
      dependencies: [tasks[6].id],
      estimatedTime: '30-45 min'
    });

    tasks.push({
      id: this.getTaskId(),
      title: 'Crear Rutas',
      description: 'Definir rutas en src/presentation/routes/ y registrarlas en src/index.ts',
      layer: 'Presentation',
      priority: 'alta',
      dependencies: [tasks[7].id],
      estimatedTime: '20-30 min'
    });

    // Testing
    tasks.push({
      id: this.getTaskId(),
      title: 'Testing y Validación',
      description: 'Probar endpoints, validar casos de éxito y error, verificar integración',
      priority: 'alta',
      dependencies: [tasks[8].id],
      estimatedTime: '45-60 min'
    });

    // Documentación
    tasks.push({
      id: this.getTaskId(),
      title: 'Documentación y Limpieza',
      description: 'Actualizar documentación, limpiar código, verificar manejo de errores',
      priority: 'media',
      dependencies: [tasks[9].id],
      estimatedTime: '20-30 min'
    });

    return tasks;
  }

  /**
   * Genera tareas para corrección de bugs
   */
  private generateBugFixTasks(_requirement: string): Task[] {
    const tasks: Task[] = [];

    tasks.push({
      id: this.getTaskId(),
      title: 'Reproducir el Error',
      description: 'Reproducir el error de manera consistente y documentar los pasos',
      priority: 'alta',
      estimatedTime: '15-30 min'
    });

    tasks.push({
      id: this.getTaskId(),
      title: 'Identificar la Causa Raíz',
      description: 'Analizar logs, stack traces y código relacionado para encontrar la causa',
      priority: 'alta',
      dependencies: [tasks[0].id],
      estimatedTime: '30-60 min'
    });

    tasks.push({
      id: this.getTaskId(),
      title: 'Implementar la Corrección',
      description: 'Aplicar la corrección en la capa correspondiente (Domain/Infrastructure/Application/Presentation)',
      priority: 'alta',
      dependencies: [tasks[1].id],
      estimatedTime: '30-90 min'
    });

    tasks.push({
      id: this.getTaskId(),
      title: 'Verificar la Solución',
      description: 'Probar que el error esté corregido y que no se hayan introducido regresiones',
      priority: 'alta',
      dependencies: [tasks[2].id],
      estimatedTime: '30-45 min'
    });

    return tasks;
  }

  /**
   * Genera tareas para refactorización
   */
  private generateRefactorTasks(_requirement: string): Task[] {
    const tasks: Task[] = [];

    tasks.push({
      id: this.getTaskId(),
      title: 'Análisis del Código Actual',
      description: 'Revisar el código existente, identificar áreas de mejora y definir el alcance',
      priority: 'alta',
      estimatedTime: '30-45 min'
    });

    tasks.push({
      id: this.getTaskId(),
      title: 'Crear Tests de Regresión',
      description: 'Asegurar que existan tests que validen el comportamiento actual',
      priority: 'alta',
      dependencies: [tasks[0].id],
      estimatedTime: '30-60 min'
    });

    tasks.push({
      id: this.getTaskId(),
      title: 'Aplicar Refactorización',
      description: 'Refactorizar el código siguiendo principios SOLID y las convenciones del proyecto',
      priority: 'alta',
      dependencies: [tasks[1].id],
      estimatedTime: '60-120 min'
    });

    tasks.push({
      id: this.getTaskId(),
      title: 'Verificar Funcionalidad',
      description: 'Ejecutar tests y verificar que todo funcione correctamente',
      priority: 'alta',
      dependencies: [tasks[2].id],
      estimatedTime: '30 min'
    });

    return tasks;
  }

  /**
   * Genera tareas para integraciones
   */
  private generateIntegrationTasks(_requirement: string): Task[] {
    const tasks: Task[] = [];

    tasks.push({
      id: this.getTaskId(),
      title: 'Revisar Documentación de la API',
      description: 'Revisar documentación de la API externa y entender los endpoints disponibles',
      priority: 'alta',
      estimatedTime: '30-45 min'
    });

    tasks.push({
      id: this.getTaskId(),
      title: 'Configurar Variables de Entorno',
      description: 'Agregar credenciales y configuración necesaria en .env',
      priority: 'alta',
      dependencies: [tasks[0].id],
      estimatedTime: '15 min'
    });

    tasks.push({
      id: this.getTaskId(),
      title: 'Crear Servicio de Integración',
      description: 'Implementar servicio en src/application/services/ para manejar la comunicación con la API',
      layer: 'Application',
      priority: 'alta',
      dependencies: [tasks[1].id],
      estimatedTime: '60-90 min'
    });

    tasks.push({
      id: this.getTaskId(),
      title: 'Implementar Manejo de Errores',
      description: 'Agregar manejo robusto de errores, timeouts y reintentos si es necesario',
      priority: 'alta',
      dependencies: [tasks[2].id],
      estimatedTime: '30-45 min'
    });

    tasks.push({
      id: this.getTaskId(),
      title: 'Crear Endpoints de Integración',
      description: 'Crear controladores y rutas para exponer la funcionalidad de integración',
      layer: 'Presentation',
      priority: 'alta',
      dependencies: [tasks[3].id],
      estimatedTime: '30-45 min'
    });

    tasks.push({
      id: this.getTaskId(),
      title: 'Testing de Integración',
      description: 'Probar la integración en ambiente de desarrollo, verificar casos de éxito y error',
      priority: 'alta',
      dependencies: [tasks[4].id],
      estimatedTime: '45-60 min'
    });

    return tasks;
  }

  /**
   * Genera tareas genéricas
   */
  private generateGenericTasks(_requirement: string): Task[] {
    return this.generateNewFeatureTasks(_requirement);
  }

  /**
   * Obtiene sugerencias para nuevas funcionalidades
   */
  private getNewFeatureSuggestions(): string[] {
    return [
      'Seguir la arquitectura Clean Architecture del proyecto',
      'Revisar módulos similares existentes para mantener consistencia',
      'Usar inyección de dependencias con tsyringe',
      'Implementar validaciones tanto en el dominio como en la presentación',
      'Manejar errores de forma consistente usando el ErrorHandler existente',
      'Considerar autenticación y autorización si la funcionalidad lo requiere',
      'Documentar endpoints y parámetros importantes'
    ];
  }

  /**
   * Obtiene sugerencias para corrección de bugs
   */
  private getBugFixSuggestions(): string[] {
    return [
      'Revisar logs del servidor para más contexto',
      'Verificar que el error no esté relacionado con variables de entorno',
      'Comprobar que las dependencias estén correctamente inyectadas',
      'Revisar si el error afecta a otros módulos relacionados',
      'Considerar agregar tests para prevenir regresiones futuras'
    ];
  }

  /**
   * Obtiene sugerencias para refactorización
   */
  private getRefactorSuggestions(): string[] {
    return [
      'Mantener la misma interfaz pública para no romper dependencias',
      'Aplicar principios SOLID, especialmente Single Responsibility',
      'Mantener la cobertura de tests existente',
      'Revisar que la refactorización mejore la legibilidad y mantenibilidad',
      'Considerar documentar los cambios importantes'
    ];
  }

  /**
   * Obtiene sugerencias para integraciones
   */
  private getIntegrationSuggestions(): string[] {
    return [
      'Revisar WOMPI_INTEGRATION.md si es una integración con Wompi',
      'Usar variables de entorno para credenciales (nunca hardcodear)',
      'Implementar manejo robusto de errores y timeouts',
      'Considerar implementar un sistema de reintentos para llamadas fallidas',
      'Validar respuestas de la API externa antes de procesarlas',
      'Considerar implementar webhooks si la API lo soporta',
      'Documentar la configuración necesaria en el README o documentación del proyecto'
    ];
  }

  /**
   * Obtiene sugerencias genéricas
   */
  private getGenericSuggestions(): string[] {
    return [
      'Revisar la estructura del proyecto antes de comenzar',
      'Seguir las convenciones de nombres existentes',
      'Mantener consistencia con el código existente',
      'Considerar el impacto en otros módulos',
      'Documentar cambios importantes'
    ];
  }

  /**
   * Genera un ID único para la tarea
   */
  private getTaskId(): string {
    return `TASK-${this.taskIdCounter++}`;
  }

  /**
   * Formatea la lista de tareas como markdown
   */
  formatAsMarkdown(taskList: TaskList): string {
    let markdown = `# Lista de Tareas: ${taskList.description}\n\n`;
    markdown += `**Proyecto:** ${taskList.project}\n\n`;
    markdown += `**Fecha de Generación:** ${new Date().toLocaleString('es-ES')}\n\n`;
    
    markdown += `## 📋 Descripción\n\n${taskList.description}\n\n`;
    
    markdown += `## ✅ Tareas\n\n`;
    
    // Agrupar tareas por capa si aplica
    const tasksByLayer = new Map<string, Task[]>();
    const tasksWithoutLayer: Task[] = [];
    
    taskList.tasks.forEach(task => {
      if (task.layer) {
        if (!tasksByLayer.has(task.layer)) {
          tasksByLayer.set(task.layer, []);
        }
        tasksByLayer.get(task.layer)!.push(task);
      } else {
        tasksWithoutLayer.push(task);
      }
    });
    
    // Mostrar tareas sin capa primero
    if (tasksWithoutLayer.length > 0) {
      tasksWithoutLayer.forEach((task, index) => {
        markdown += this.formatTask(task, index + 1);
      });
    }
    
    // Mostrar tareas agrupadas por capa
    const layerOrder = ['Domain', 'Infrastructure', 'Application', 'Presentation'];
    layerOrder.forEach(layer => {
      if (tasksByLayer.has(layer)) {
        markdown += `\n### 🏗️ Capa: ${layer}\n\n`;
        tasksByLayer.get(layer)!.forEach((task, index) => {
          markdown += this.formatTask(task, index + 1);
        });
      }
    });
    
    markdown += `\n## 💡 Sugerencias\n\n`;
    taskList.suggestions.forEach((suggestion, index) => {
      markdown += `${index + 1}. ${suggestion}\n`;
    });
    
    markdown += `\n## 📊 Resumen\n\n`;
    markdown += `- **Total de tareas:** ${taskList.tasks.length}\n`;
    markdown += `- **Prioridad Alta:** ${taskList.tasks.filter(t => t.priority === 'alta').length}\n`;
    markdown += `- **Prioridad Media:** ${taskList.tasks.filter(t => t.priority === 'media').length}\n`;
    markdown += `- **Prioridad Baja:** ${taskList.tasks.filter(t => t.priority === 'baja').length}\n`;
    
    return markdown;
  }

  /**
   * Formatea una tarea individual
   */
  private formatTask(task: Task, number: number): string {
    let taskMarkdown = `### ${number}. ${task.title}\n\n`;
    taskMarkdown += `- **ID:** ${task.id}\n`;
    taskMarkdown += `- **Descripción:** ${task.description}\n`;
    if (task.layer) {
      taskMarkdown += `- **Capa:** ${task.layer}\n`;
    }
    taskMarkdown += `- **Prioridad:** ${task.priority.toUpperCase()}\n`;
    if (task.estimatedTime) {
      taskMarkdown += `- **Tiempo Estimado:** ${task.estimatedTime}\n`;
    }
    if (task.dependencies && task.dependencies.length > 0) {
      taskMarkdown += `- **Dependencias:** ${task.dependencies.join(', ')}\n`;
    }
    taskMarkdown += `\n`;
    
    return taskMarkdown;
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  const requirement = process.argv.slice(2).join(' ') || 'Implementar nueva funcionalidad';
  const generator = new TaskGenerator();
  const taskList = generator.generateTaskList(requirement);
  const markdown = generator.formatAsMarkdown(taskList);
  
  console.log(markdown);
  
  // Guardar en archivo
  const outputPath = path.join(process.cwd(), 'tareas-generadas.md');
  fs.writeFileSync(outputPath, markdown, 'utf-8');
  console.log(`\n✅ Lista de tareas guardada en: ${outputPath}`);
}

export { TaskGenerator, TaskList, Task };
