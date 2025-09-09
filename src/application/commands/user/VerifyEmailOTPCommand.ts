export class VerifyEmailOTPCommand {
  constructor(
    public readonly email: string,
    public readonly token: string
  ) {}
}


