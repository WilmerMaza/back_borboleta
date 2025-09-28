export class UpdatePasswordCommand {
  constructor(
    public readonly email: string,
    public readonly token: string,
    public readonly password: string,
    public readonly password_confirmation: string
  ) {}
}


