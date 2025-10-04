export class GetAdminUsersQuery {
  constructor(
    public readonly page: number = 1,
    public readonly limit: number = 15,
    public readonly search?: string,
    public readonly roleId?: number
  ) {}
}


