const GrindAPI = {
    input: (promptText) => {
        return new Promise((resolve) => {
            // Явный вывод приглашения с гарантией отображения
            Console.print(promptText, 'system');

            // Микро-задержка для синхронизации событий
            setTimeout(() => {
                const handler = (e) => {
                    if (e.key === 'Enter') {
                        const inputValue = e.target.value.trim();
                        e.target.value = '';
                        document.getElementById('console-cmd').removeEventListener('keydown', handler);
                        Console.activeInputPromise = null;
                        resolve(inputValue);
                    }
                };

                Console.activeInputPromise = { resolve };
                document.getElementById('console-cmd').addEventListener('keydown', handler);
            }, 0); // Запуск в следующем цикле событий
        });
    }
};
