export class InvalidEnvironmentDataException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'Invalid environment data exception';
    }
}
