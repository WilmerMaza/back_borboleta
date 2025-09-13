export class VerifyPhoneOTPCommand {
  constructor(
    public readonly phone: string,
    public readonly country_code: number,
    public readonly token: string
  ) {}
}


