self.onmessage = function(e) {
  const { id, code, sandbox } = e.data;

  // Перехватчик console.log
  const logs = [];
  const consoleProxy = {
    log: (...args) => {
      logs.push(args.join(' ')); // Сохраняем логи
      self.postMessage({ type: 'log', data: args.join(' ') }); // Отправляем в основной поток
    }
  };

  try {
    const context = {
      console: consoleProxy, // Используем прокси
      print: consoleProxy.log // Алиас для print
    };

    // Добавляем разрешенные глобальные объекты
    for (const [objName, methods] of Object.entries(sandbox.allowedGlobals)) {
      context[objName] = {};
      for (const method of methods) {
        if (typeof globalThis[objName][method] === 'function') {
          context[objName][method] = globalThis[objName][method].bind(globalThis[objName]);
        }
      }
    }

    // Выполняем код
    const func = new Function(...Object.keys(context), `"use strict"; ${code}`);
    func(...Object.values(context));

    self.postMessage({
      id,
      result: logs.join('\n') // Возвращаем все логи
    });

  } catch (e) {
    self.postMessage({ id, error: e.message });
  }
};
