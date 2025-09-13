export class LoginPhoneCommand {
  constructor(
    public readonly phone: string,
    public readonly country_code: number
  ) {}
}


