export class CreateAdminUserCommand {
  constructor(
    public readonly name: string,
    public readonly email: string,
    public readonly password: string,
    public readonly role_id: number,
    public readonly employee_id?: string,
    public readonly department?: string,
    public readonly position?: string,
    public readonly access_level?: string,
    public readonly phone?: string
  ) {}
}


