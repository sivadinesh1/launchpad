const isDebug = true;
export class SaninnLogger {
    private logPrefix = '';
    constructor(logPrefix?: string) {
        if (logPrefix) {
            this.logPrefix = `[${logPrefix}]: `;
        }
    }

    get log(): Function {
        if (!isDebug) {
            return () => { };
        }
        const logPrefix = this.logPrefix;
        if (logPrefix.length) {
            return console.log.bind(window.console, logPrefix);    
        } else {
            return console.log.bind(window.console);    
        }
    }

   get warn(): Function {
        if (!isDebug) {
            return () => { };
        }
        const logPrefix = this.logPrefix;
        if (logPrefix.length) {
            return console.warn.bind(window.console, logPrefix);    
        } else {
            return console.warn.bind(window.console);    
        }
   }
    
    get dir(): Function {
        if (!isDebug) {
            return () => { };
        }
        const logPrefix = this.logPrefix;
        if (logPrefix.length) {
            return console.dir.bind(window.console, logPrefix);    
        } else {
            return console.dir.bind(window.console);    
        }
    }

    get error(): Function {
        if (!isDebug) {
            return () => { };
        }
        const logPrefix = this.logPrefix;
        if (logPrefix.length) {
            return console.error.bind(window.console, logPrefix);    
        } else {
            return console.error.bind(window.console);    
        }
    }

}