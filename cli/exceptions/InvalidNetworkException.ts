export class InvalidNetworkException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Invalid network exception';
    }
}
