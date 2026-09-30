export class ErrorSolicitud extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErrorSolicitud';
  }
}

export class ErrorNoEncontrado extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ErrorNoEncontrado';
  }
}
