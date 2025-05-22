const GrindAPI = {
    input: async (promptText) => {
        Console.print(promptText, 'system');
        return new Promise((resolve) => {
            const handler = (e) => {
                if (e.key === 'Enter') {
                    const inputValue = e.target.value.trim();
                    e.target.value = '';
                    document.getElementById('console-cmd').removeEventListener('keydown', handler);
                    resolve(inputValue);
                }
            };
            document.getElementById('console-cmd').addEventListener('keydown', handler);
        });
    }
};
