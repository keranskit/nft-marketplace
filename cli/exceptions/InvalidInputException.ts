export class InvalidInputException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Invalid input exception';
    }
}
