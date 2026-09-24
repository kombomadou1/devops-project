export class Association {
  constructor(
    public id: number,
    public name: string,
    public members: Member[],
    
  ) {}
}

export class Member {
  constructor(
    public name: string,
    public firstname: string,
    public age: number,
    public role: string,
    
  ) {}
}
