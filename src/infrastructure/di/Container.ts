export class Container {
  private static instance: Container;
  private dependencies: Map<string, any>;

  private constructor() {
    this.dependencies = new Map();
  }

  public static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  public register(key: string, dependency: any): void {
    this.dependencies.set(key, dependency);
  }

  public resolve<T>(key: string): T {
    const dependency = this.dependencies.get(key);
    if (!dependency) {
      throw new Error(`Dependencia no encontrada: ${key}`);
    }
    return dependency;
  }
}