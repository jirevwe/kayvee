/**
 * Facilitates handling of promises 😂
 * @param {Function} resolve - Callback to run when resolved
 * @param {Function} reject - Callback to run when rejected
 */
export class PromiseOperation {
  resolve: Function;
  reject: Function;
  completed: boolean;

  constructor(resolve: Function, reject: Function) {
    this.resolve = resolve;
    this.reject = reject;
    this.completed = false;
  }

  /**
   * Add and resolve response
   * @param {string} res - Response
   */
  addResponse(res: string) {
    this.resolve(res);
    this.completed = true;
  }

  /**
   * Add and reject error
   * @param {Error} err - Error
   */
  addError(err: Error) {
    this.reject(err);
    this.completed = true;
  }
}
