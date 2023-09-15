
export class WithdrawTx {
    constructor(
    public to: string,
    public amount: number,
    public approvals: number,
    public sent: boolean
    ){}
}