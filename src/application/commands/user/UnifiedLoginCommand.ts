export class UnifiedLoginCommand {
  constructor(
    public readonly email: string,
    public readonly password: string,
    public readonly loginType: 'frontend' | 'backoffice'
  ) {}
}
