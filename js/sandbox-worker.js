// sandbox-worker.js
self.onmessage = async function(e) {
    const { id, code, sandbox = {}, timeout = 15000 } = e.data;
    let logs = [];
    let errors = [];
    let result = null;
    let context = {};

    // Создаем изолированный контекст выполнения
    const createContext = () => {
        const safeContext = {
            console: {
                log: (...args) => {
                    const message = args.map(arg =>
                        typeof arg === 'object' ? JSON.stringify(arg) : arg
                    ).join(' ');
                    logs.push(message);
                    self.postMessage({ id, type: 'log', data: message });
                }
            },
            print: (...args) => safeContext.console.log(...args),
            setTimeout: (fn, delay) => {
                const start = Date.now();
                const timerId = setTimeout(() => {
                    try {
                        fn();
                    } catch (err) {
                        errors.push(err.message);
                    }
                }, delay);
                return timerId;
            },
            clearTimeout: (id) => clearTimeout(id),
            Math: {
                abs: Math.abs,
                floor: Math.floor,
                ceil: Math.ceil,
                random: Math.random
            },
            Game: {
                sleep: (ms) => new Promise(resolve => setTimeout(resolve, ms))
            }
        };

        // Добавляем пользовательские разрешенные глобальные объекты
        if (sandbox.allowedGlobals) {
            for (const [key, value] of Object.entries(sandbox.allowedGlobals)) {
                safeContext[key] = {};
                for (const prop of value) {
                    if (globalThis[key] && globalThis[key][prop]) {
                        safeContext[key][prop] = globalThis[key][prop];
                    }
                }
            }
        }

        return safeContext;
    };

    // Проверка безопасности кода
    const validateCode = () => {
        const blockedPatterns = [
            'window', 'document', 'fetch', 'XMLHttpRequest', 'eval',
            'Function', 'WebSocket', 'localStorage', 'importScripts'
        ];

        const dangerPattern = new RegExp(
            blockedPatterns.join('|'),
            'gi'
        );

        if (dangerPattern.test(code)) {
            throw new Error(`Запрещенная операция: ${RegExp.lastMatch}`);
        }
    };

    // Обработчик таймаута
    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error(`Таймаут выполнения (${timeout}мс)`)), timeout)
    );

    try {
        // Проверка безопасности
        validateCode();

        // Создаем контекст
        context = createContext();

        // Обертка для кода
        const asyncFunction = new Function(`
            return (async function() {
                with(this) {
                    try {
                        ${code}
                    } catch(err) {
                        return { error: err.message };
                    }
                }
            })();
        `).bind(context);

        // Выполняем код с обработкой таймаута
        const executionPromise = asyncFunction();
        result = await Promise.race([executionPromise, timeoutPromise]);

        if (result && result.error) {
            errors.push(result.error);
        }

        self.postMessage({
            id,
            result,
            logs,
            context,
            errors
        });
    } catch (err) {
        errors.push(err.message);
        self.postMessage({
            id,
            error: err.message,
            logs,
            errors
        });
    }
};
