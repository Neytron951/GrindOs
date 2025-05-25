// ===== КОНФИГУРАЦИЯ ИГРЫ =====
const GameConfig = {
  // Основные настройки
  enableSounds: true,
  startingRamCoins: 100,
  adReward: 50,

  // Игровые предметы
  items: {
    syntax_highlight: {
      price: 100,
      bought: false,
      description: "Подсветка синтаксиса в редакторе"
    },
    debugger: {
      price: 200,
      bought: false,
      description: "Инструменты для отладки кода"
    }
  },

  // Покупка валюты
  yandexProducts: {
    100: {price: 10, amount: 100},
    250: {price: 20, amount: 250},
    600: {price: 50, amount: 600}
  },

  // Задания
  tasks: {
    1: {
      description: "Напиши функцию add(a, b), которая возвращает a + b.",
      solution: "function add(a, b) {\n  return a + b;\n}",
      reward: 50,
      completed: false
    },
    2: {
      description: "Напиши функцию isEven(n), которая проверяет, чётное ли число.",
      solution: "function isEven(n) {\n  return n % 2 === 0;\n}",
      reward: 80,
      completed: false
    }
  },

  // Доступные приложения
  startingApps: ['notepad', 'browser', 'wallet', 'console'],
};

// ===== СОСТОЯНИЕ ИГРЫ =====
const GameState = {
    ramCoins: GameConfig.startingRamCoins,
    unlockedApps: GameConfig.startingApps,
    currentTask: null,
    items: {},
    transactions: [],
    reputation: 0,
    level: 1,
    unlockedDifficulties: [1],
    purchasedSolutions: {},

    save() {
        const saveData = {
            ramCoins: this.ramCoins,
            unlockedApps: this.unlockedApps,
            currentTask: this.currentTask,
            items: this.items,
            transactions: this.transactions,
            reputation: this.reputation,
            level: this.level,
            unlockedDifficulties: this.unlockedDifficulties
        };
        // Временно отключаем localStorage для предотвращения ошибок
        try {
            localStorage.setItem('codeGrindSave', JSON.stringify(saveData));
        } catch (e) {
            console.log('Сохранение недоступно:', e);
        }
    },

    load() {
        try {
            const saved = localStorage.getItem('codeGrindSave');
            if (saved) {
                const data = JSON.parse(saved);
                this.ramCoins = data.ramCoins || GameConfig.startingRamCoins;
                this.unlockedApps = data.unlockedApps || GameConfig.startingApps;
                this.currentTask = data.currentTask || null;
                this.items = data.items || {};
                this.unlockedDifficulties = data.unlockedDifficulties || [1];
                this.transactions = data.transactions || [];
                this.reputation = data.reputation || 0;
                this.level = data.level || 1;


                for (const itemId in this.items) {
                    if (GameConfig.items[itemId]) {
                        GameConfig.items[itemId].bought = true;
                    }
                }
            }
        } catch (e) {
            console.log('Загрузка недоступна:', e);
        }
    },

    playSound(type) {
        if (!GameConfig.enableSounds) return;
        const sounds = {
            open: { url: 'sounds/open.mp3', volume: 0.5 },
            close: { url: 'sounds/close.mp3', volume: 0.5 },
            click: { url: 'sounds/click.mp3', volume: 0.3 },
            error: { url: 'sounds/error.mp3', volume: 0.5 },
            task: { url: 'sounds/task.mp3', volume: 0.5 },
            complete: { url: 'sounds/complete.mp3', volume: 0.7 },
            buy: { url: 'sounds/buy.mp3', volume: 0.5 },
            coins: { url: 'sounds/coins.mp3', volume: 0.7 },
            file: { url: 'sounds/file.mp3', volume: 0.4 }
        };

        if (sounds[type]) {
            try {
                const audio = new Audio(sounds[type].url);
                audio.volume = sounds[type].volume;
                audio.play().catch(e => console.log("Не удалось воспроизвести звук:", e));
            } catch (e) {
                console.log("Ошибка воспроизведения звука:", e);
            }
        }
    }
};

const Documentation = {
    init() {
        document.querySelectorAll('.doc-menu div[data-section]').forEach(btn => {
            btn.addEventListener('click', () => {
                this.show(btn.dataset.section);
            });
        });
    },

    show(section) {
        const doc = GrindDocs[section];
        if (!doc) return;

        const docContent = document.getElementById('doc-content');
        if (docContent) {
            docContent.innerHTML = `
                <h2>${doc.title}</h2>
                <div class="doc-content">${doc.content}</div>
            `;
            docContent.scrollTop = 0;
        }
    },

    search(query) {
        query = query.toLowerCase();
        let results = [];

        for (const [section, content] of Object.entries(GrindDocs)) {
            if (content.title.toLowerCase().includes(query) ||
                content.content.toLowerCase().includes(query)) {
                results.push(`
                    <div class="search-result" onclick="Documentation.show('${section}')">
                        <h4>${content.title}</h4>
                        <p>${content.content.substring(0, 100)}...</p>
                    </div>
                `);
            }
        }

        const docContent = document.getElementById('doc-content');
        if (docContent) {
            docContent.innerHTML = `
                <h3>Результаты поиска: "${query}"</h3>
                ${results.join('') || '<p>Ничего не найдено</p>'}
            `;
        }
    }
};

// ===== КОНСОЛЬ =====
const Console = {
    init() {

        window.print = () => {}; // Блокируем браузерную печать
        document.getElementById('console-cmd').addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                await this.executeCommand();
            }
        });

        this.print("GrindScript Console v1.0", 'system');
        this.print("Введите 'help' для списка команд", 'system');
    },

    async executeCommand() {
        const input = document.getElementById('console-cmd');
        const cmd = input.value.trim();
        input.value = '';

        if (!cmd) return;

        this.print(`> ${cmd}`, 'input');

        if (cmd === 'clear') {
            this.clear();
            return;
        }

        if (cmd === 'help') {
            this.showHelp();
            return;
        }

        if (cmd.startsWith('run ')) {
            const filename = cmd.substring(4).trim();
            if (!filename) {
                this.print("Ошибка: Укажите имя файла", 'error');
                return;
            }
            await this.runScript(filename);
            return;
        }

        try {
            await this.executeJavaScript(cmd);
        } catch (e) {
            this.print(`Ошибка: ${e.message}`, 'error');
        }
    },

    async executeJavaScript(code, customSandbox = {}) {
        const sandbox = {
            console: { log: this.print.bind(this) },
            print: (text) => this.print(text, 'output'), // Вывод в игровую консоль
            Math: {
                abs: Math.abs, round: Math.round,
                floor: Math.floor, ceil: Math.ceil,
                max: Math.max, min: Math.min,
                random: Math.random
            },
            Array: {
                from: Array.from, isArray: Array.isArray,
                prototype: { push: Array.prototype.push, pop: Array.prototype.pop }
            },
            ...customSandbox // Добавляем кастомные элементы
        };

        try {
            // Добавляем явное объявление глобальной функции
            const wrappedCode = `
                // Важно: использовать var вместо let/const для глобальной видимости
                ${code.replace(/^function add/g, 'var add = function')};
                this.add = add; // Явно привязываем к глобальному контексту
                return this;
            `;

            const result = await (new Function('sandbox', `
                with(sandbox) {
                    return (function() {
                        ${wrappedCode}
                    })();
                }
            `))(sandbox);

            return result;
        } catch (e) {
            throw e;
        }
    },

    async runScript(filename) {
        let finalFilename = filename.trim();
        if (!finalFilename.endsWith('.gs')) {
            finalFilename += '.gs';
        }

        if (!Notepad.files[finalFilename]) {
            this.print(`Ошибка: Файл "${finalFilename}" не найден`, 'error');
            return;
        }

        try {
            this.print(`> Запуск ${finalFilename}...`, 'system');
            await this.executeJavaScript(Notepad.files[finalFilename]);
        } catch (e) {
            this.print(`GrindScript Error: ${e.message}`, 'error');
        }
    },

    showHelp() {
        this.print("Доступные команды:", 'system');
        this.print("clear - очистить консоль", 'system');
        this.print("help - показать эту справку", 'system');
        this.print("run <file> - выполнить файл (.gs)", 'system');
        this.print("<код> - выполнить код GrindScript", 'system');
    },

    print(text, type = 'normal') {
        const output = document.getElementById('console-output');
        const line = document.createElement('div');
        line.className = `console-line console-${type}`;
        line.textContent = String(text).replace(/\s+/g, ' ').trim();
        output.appendChild(line);

        requestAnimationFrame(() => {
            output.scrollTop = output.scrollHeight;
        });
    },

    clear() {
        const output = document.getElementById('console-output');
        output.innerHTML = ''; // Полная очистка
        this.print("GrindScript Console v1.0", 'system');
        this.print("Введите 'help' для списка команд", 'system');
        GameState.playSound('file');
    }
};


Console.executeAndCapture = async function(code) {
    const originalPrint = this.print;
    let output = '';

    this.print = (text, type) => {
        if (type === 'output') output += text + '\n';
    };

    await this.executeJavaScript(code);
    this.print = originalPrint;
    return output;
};


const TaskSystem = {
    currentTask: null,
    selectedFile: null,

    init() {
        document.getElementById('task-list').addEventListener('click', this.handleTaskClick);
    },

    handleTaskClick(e) {
        const taskElement = e.target.closest('.task');
        if (taskElement) {
            const taskId = taskElement.dataset.taskId;
            TaskSystem.showTaskDetails(taskId);
        }
    },

    showTaskDetails(taskId) {
        const task = GameTasks[taskId];
        const modalContent = `
            <h3>${task.description}</h3>
            <p>Сложность: ${task.difficulty}/10</p>
            <p>Награда: ${task.reward} RAM</p>
            <div class="task-actions">
                ${!GameState.purchasedSolutions[taskId] ?
                    `<button onclick="TaskSystem.buySolution(${taskId})">
                        Купить решение (${Math.floor(task.reward * 0.8)} RAM)
                    </button>` :
                    `<pre>${task.solution}</pre>`
                }
                <button onclick="TaskSystem.loadCode(${taskId})">Загрузить код</button>
            </div>
        `;
        Modal.open(`Задание #${taskId}`, modalContent);
    },

    buySolution(taskId) {
        const task = GameTasks[taskId];
        const cost = Math.floor(task.reward * 0.8);

        if (GameState.ramCoins < cost) {
            Modal.open('Ошибка', 'Недостаточно RAM-коинов!');
            return;
        }

        Modal.confirm(
            'Покупка решения',
            `Купить решение задания за ${cost} RAM?`,
            () => {
                Wallet.addCoins(-cost, `Покупка решения задания ${taskId}`);
                GameState.purchasedSolutions[taskId] = true;
                GameState.save();
                TaskSystem.showTaskDetails(taskId);
            }
        );
    },

    loadCode(taskId) {
        const fileList = Object.keys(Notepad.files)
            .map(filename => `
                <div class="file-item" onclick="TaskSystem.selectFile('${filename}', ${taskId})">
                    ${filename}
                </div>
            `).join('');

        Modal.open('Выберите файл', `<div class="file-list">${fileList}</div>`);
    },

    selectFile(filename, taskId) {
        this.selectedFile = filename;
        this.verifySolution(taskId);
    },

    async verifySolution(taskId) {
        const task = GameTasks[taskId];
        const code = Notepad.files[this.selectedFile];
        let result = false;

        try {
            if (task.required === 'output') {
                // Проверка заданий с выводом (например: print(5))
                const output = await Console.executeAndCapture(code);
                result = task.testCases.some(tc =>
                    output.trim() === tc.expectedOutput.trim()
                );
            } else if (task.required === 'function') {
            const sandbox = {
                console: { log: () => {} },
                print: (text) => Console.print(text, 'output')
            };

            // 1. Выполняем код и получаем глобальный контекст
            const executionContext = await Console.executeJavaScript(code, sandbox);

            // 2. Проверяем наличие add как глобальной функции
            if (typeof executionContext.add !== 'function') {
                throw new Error(`
                    Функция add не объявлена через function!
                    Используйте: function add(a, b) { ... }
                `);
            }

            // 3. Проверяем все тестовые случаи
            result = task.testCases.every(tc => {
                const actual = executionContext.add(...tc.args);
                return actual === tc.expected;
            });

            // 4. Отладочный вывод (можно удалить позже)
            Console.print(`Проверка завершена. Результат: ${result}`, 'debug');
        }
    } catch (e) {
        Console.print(`Ошибка: ${e.message}`, 'error');
        result = false;
    }

        // Обновляем статус игрока
        if (result) {
            GameState.reputation += 5;
            Wallet.addCoins(task.reward, `Задание ${taskId}`);
            Modal.open('✅ Успех', `Задание выполнено!<br>+5 к репутации<br>+${task.reward} RAM`);
        } else {
            GameState.reputation = Math.max(0, GameState.reputation - 3);
            Modal.open('❌ Ошибка', 'Неверное решение! -3 к репутации');
        }

        this.updateLevel();
        GameState.save();
        updateReputationUI();

        return result;
    },

    updateLevel() {
        const reputation = GameState.reputation;
        const newLevel = Math.min(Math.floor(reputation / 20) + 1, 10);

        if (newLevel > GameState.level) {
            GameState.level = newLevel;

            // Разблокируем новые уровни сложности
            if (!GameState.unlockedDifficulties.includes(newLevel)) {
                GameState.unlockedDifficulties.push(newLevel);
            }

            Modal.open('🎉 Уровень повышен!', `Новый уровень: ${newLevel}`);
            GameState.save(); // Сохраняем изменения
        }

        updateReputationUI();
    },

};

function updateReputationUI() {
    const levelElement = document.getElementById('player-level');
    const repElement = document.getElementById('player-rep');

    if (levelElement) levelElement.textContent = GameState.level;
    if (repElement) repElement.textContent = GameState.reputation;

    // Принудительное обновление списка заданий
    document.querySelectorAll('.task').forEach(task => {
        const taskId = task.dataset.taskId;
        const difficulty = GameTasks[taskId].difficulty;
        task.style.display = GameState.unlockedDifficulties.includes(difficulty)
            ? 'block'
            : 'none';
    });
}

const Modal = {
    confirmCallback: null,
    cancelCallback: null,
    inputCallback: null,

    open(title, message, callback = null) {
        document.getElementById('os-modal-title').textContent = title;
        document.getElementById('os-modal-text').innerHTML = message;
        document.getElementById('os-modal').style.display = 'flex';

        // Стандартная кнопка OK
        const modalFooter = document.querySelector('.os-modal-footer');
        modalFooter.innerHTML = '<button onclick="Modal.close()">OK</button>';

        // Фокус на input если есть
        const input = document.querySelector('.os-modal-body input');
        if (input) {
            setTimeout(() => {
                input.focus();
                input.select();
            }, 50);
        }

        if (callback) {
            this.inputCallback = callback;
        }

        GameState.playSound('open');
    },

    // Новый метод для инпута с колбэком
    input(title, message, defaultValue = '', callback = null) {
        document.getElementById('os-modal-title').textContent = title;
        document.getElementById('os-modal-text').innerHTML = `
            ${message}
            <input type="text" id="modal-input" value="${defaultValue}" style="width: 100%; margin-top: 10px; padding: 5px;">
        `;
        document.getElementById('os-modal').style.display = 'flex';

        const modalFooter = document.querySelector('.os-modal-footer');
        modalFooter.innerHTML = `
            <button onclick="Modal.submitInput()">OK</button>
            <button onclick="Modal.close()">Отмена</button>
        `;

        this.inputCallback = callback;

        setTimeout(() => {
            const input = document.getElementById('modal-input');
            if (input) {
                input.focus();
                input.select();
                input.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        Modal.submitInput();
                    }
                });
            }
        }, 50);

        GameState.playSound('open');
    },

    submitInput() {
        const input = document.getElementById('modal-input');
        if (input && this.inputCallback) {
            this.inputCallback(input.value);
        }
        this.close();
    },

    close() {
        document.getElementById('os-modal').style.display = 'none';
        this.confirmCallback = null;
        this.cancelCallback = null;
        this.inputCallback = null;
        GameState.playSound('close');
    },

    confirm(title, message, confirmCallback, cancelCallback = null) {
        document.getElementById('os-modal-title').textContent = title;
        document.getElementById('os-modal-text').innerHTML = message;
        document.getElementById('os-modal').style.display = 'flex';

        const modalFooter = document.querySelector('.os-modal-footer');
        modalFooter.innerHTML = `
            <button onclick="Modal.confirmAction(true)">Да</button>
            <button onclick="Modal.confirmAction(false)">Отмена</button>
        `;

        this.confirmCallback = confirmCallback;
        this.cancelCallback = cancelCallback || (() => Modal.close());

        GameState.playSound('open');
    },

    confirmAction(confirmed) {
        if (confirmed && this.confirmCallback) {
            this.confirmCallback();
        } else if (!confirmed && this.cancelCallback) {
            this.cancelCallback();
        }
        this.close();
    }
};

const FileManager = {
    selectedFile: null,

    init() {
        console.log('Инициализация FileManager');
        this.renderDesktopFiles();

        // Обработчик клика по рабочему столу (скрытие контекстного меню)
        document.getElementById('desktop').addEventListener('click', (e) => {
            if (!e.target.closest('.desktop-icon') && !e.target.closest('.context-menu')) {
                this.hideContextMenu();
            }
        });

        // Обработчик правого клика по файлам
        document.getElementById('desktop').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const icon = e.target.closest('.desktop-icon');
            if (icon && icon.dataset.filename) {
                console.log('Правый клик по файлу:', icon.dataset.filename);
                this.selectedFile = icon.dataset.filename;
                this.showContextMenu(e.clientX, e.clientY);
            }
        });
    },

    renderDesktopFiles() {
        console.log('Обновляем файлы на рабочем столе');
        const desktop = document.getElementById('desktop');

        // Удаляем только файловые иконки (с data-filename)
        const fileIcons = desktop.querySelectorAll('.desktop-icon[data-filename]');
        console.log('Найдено файловых иконок для удаления:', fileIcons.length);
        fileIcons.forEach(icon => {
            console.log('Удаляем иконку:', icon.dataset.filename);
            icon.remove();
        });

        // Создаем новые иконки для всех файлов
        const files = Object.keys(Notepad.files);
        console.log('Создаем иконки для файлов:', files);

        files.forEach((filename, index) => {
            const icon = document.createElement('div');
            icon.className = 'desktop-icon';
            icon.dataset.filename = filename;
            icon.innerHTML = `
                <img src="icons/file-gs.png" onerror="this.style.display='none'">
                <div>${filename}</div>
            `;

            // Добавляем обработчик двойного клика
            icon.addEventListener('dblclick', () => {
                console.log('Двойной клик по файлу:', filename);
                this.openFile(filename);
            });

            // Позиционирование иконки
            const row = Math.floor(index / 5);
            const col = index % 5;
            icon.style.left = `${120 + col * 90}px`;
            icon.style.top = `${20 + row * 100}px`;

            desktop.appendChild(icon);
            console.log('Добавлена иконка для файла:', filename);
        });

        console.log('Обновление рабочего стола завершено');
    },

    openFile(filename) {
        Notepad.openFile(filename);
        AppManager.open('notepad');
    },

    openSelected() {
        if (this.selectedFile) {
            this.openFile(this.selectedFile);
            this.hideContextMenu();
        }
    },

    renameSelected() {
        if (!this.selectedFile) return;

        const currentName = this.selectedFile.replace('.gs', '');
        const oldFileName = this.selectedFile;

        Modal.input(
            'Переименовать файл',
            `Новое имя файла:`,
            currentName,
            (newName) => {
                if (newName && newName.trim()) {
                    Notepad.renameFile(oldFileName, newName.trim());
                }
            }
        );

        this.hideContextMenu();
    },

    deleteSelected() {
        console.log('deleteSelected вызван для файла:', this.selectedFile);

        if (!this.selectedFile) {
            console.log('Нет выбранного файла');
            return;
        }

        const filename = this.selectedFile;

        Modal.confirm(
            'Удаление файла',
            `Вы уверены, что хотите удалить "${filename}"?`,
            () => {
                console.log('Подтверждено удаление файла:', filename);
                Notepad.deleteFile(filename);
                this.selectedFile = null;
            },
            () => {
                console.log('Удаление отменено');
                this.hideContextMenu();
            }
        );
    },

    showContextMenu(x, y) {
        console.log('Показываем контекстное меню в позиции:', x, y);
        console.log('Выбранный файл:', this.selectedFile);

        const menu = document.getElementById('context-menu');
        if (menu) {
            menu.style.display = 'block';
            menu.style.left = `${x}px`;
            menu.style.top = `${y}px`;
            console.log('Контекстное меню показано');
        } else {
            console.error('Элемент context-menu не найден!');
        }
    },

    hideContextMenu() {
        console.log('Скрываем контекстное меню');
        const menu = document.getElementById('context-menu');
        if (menu) {
            menu.style.display = 'none';
        }
        this.selectedFile = null;
        console.log('Контекстное меню скрыто, selectedFile сброшен');
    }
};

const Notepad = {
    currentFile: null,
    files: {},

    init() {
        try {
            const savedFiles = localStorage.getItem('grindScriptFiles');
            this.files = savedFiles ? JSON.parse(savedFiles) : {};
        } catch (e) {
            console.log('Загрузка файлов недоступна:', e);
            this.files = {};
        }

        const editor = document.getElementById('code-editor');
        if (editor) {
            editor.addEventListener('keydown', (e) => {
                if (e.ctrlKey && e.key === 's') {
                    e.preventDefault();
                    this.save();
                }
            });
        }
    },

    newFile() {
        if (this.currentFile && document.getElementById('code-editor').value !== this.files[this.currentFile]) {
            Modal.confirm(
                'Несохранённые изменения',
                'Сохранить изменения в текущем файле?',
                () => {
                    this.save();
                    this._clearEditor();
                },
                () => this._clearEditor()
            );
        } else {
            this._clearEditor();
        }
    },

    _clearEditor() {
        this.currentFile = null;
        document.getElementById('code-editor').value = '';
        const title = document.getElementById('notepad-title');
        if (title) {
            title.textContent = 'Блокнот - новый файл';
        }
        AppManager.open('notepad');
    },

    open() {
        let fileList = '<div class="file-list">';
        for (const filename in this.files) {
            fileList += `
                <div class="file-item"
                     onclick="Notepad.loadFile('${filename}'); Modal.close()">
                    ${filename}
                </div>`;
        }
        fileList += '</div>';
        Modal.open('Открыть файл', fileList);
    },

    openFile(filename) {
        if (!this.files[filename]) {
            Modal.open('Ошибка', 'Файл не найден!');
            return;
        }
        this.currentFile = filename;
        document.getElementById('code-editor').value = this.files[filename];
        const title = document.getElementById('notepad-title');
        if (title) {
            title.textContent = `Блокнот - ${filename}`;
        }
    },

    save() {
        const editor = document.getElementById('code-editor');
        if (!editor) return;

        const content = editor.value;
        if (!this.currentFile) {
            this.saveAs();
            return;
        }
        this.files[this.currentFile] = content;
        this.persistFiles();
        Modal.open('Успех', `Файл "${this.currentFile}" сохранен!`);
    },

    saveAs() {
        const editor = document.getElementById('code-editor');
        if (!editor) return;

        const content = editor.value;
        const defaultName = this.currentFile ? this.currentFile.replace('.gs', '') : 'новый_файл';

        Modal.input(
            'Сохранить как',
            'Имя файла:',
            defaultName,
            (filename) => {
                if (filename && filename.trim()) {
                    this._finalizeSave(filename.trim(), content);
                }
            }
        );
    },

    _finalizeSave(filename, content) {
        const fullName = filename.endsWith('.gs') ? filename : `${filename}.gs`;

        if (this.files[fullName] && fullName !== this.currentFile) {
            Modal.confirm(
                'Перезаписать файл?',
                `Файл "${fullName}" уже существует. Перезаписать?`,
                () => {
                    this.currentFile = fullName;
                    this.files[fullName] = content;
                    this.persistFiles();
                    const title = document.getElementById('notepad-title');
                    if (title) {
                        title.textContent = `Блокнот - ${fullName}`;
                    }
                    FileManager.renderDesktopFiles();
                    Modal.open('Успех', `Файл "${fullName}" сохранён!`);
                }
            );
        } else {
            this.currentFile = fullName;
            this.files[fullName] = content;
            this.persistFiles();
            const title = document.getElementById('notepad-title');
            if (title) {
                title.textContent = `Блокнот - ${fullName}`;
            }
            FileManager.renderDesktopFiles();
            Modal.open('Успех', `Файл "${fullName}" сохранён!`);
        }
    },

    persistFiles() {
        try {
            console.log('Сохраняем файлы:', Object.keys(this.files));
            localStorage.setItem('grindScriptFiles', JSON.stringify(this.files));
            console.log('Файлы успешно сохранены в localStorage');

            // Обновляем рабочий стол после сохранения
            FileManager.renderDesktopFiles();
        } catch (e) {
            console.log('Сохранение файлов недоступно:', e);
        }
    },

    // ИСПРАВЛЕННЫЙ МЕТОД ПЕРЕИМЕНОВАНИЯ
    renameFile(oldName, newName) {
        // Валидация входных данных
        if (!oldName || !newName || !this.files[oldName]) {
            Modal.open('Ошибка', 'Неверные параметры для переименования!');
            return;
        }

        // Очистка имени и проверка
        newName = newName.trim();
        if (newName === "") {
            Modal.open('Ошибка', 'Имя файла не может быть пустым!');
            return;
        }

        // Проверка на запрещённые символы
        const forbiddenChars = /[<>:"/\\|?*]/;
        if (forbiddenChars.test(newName)) {
            Modal.open('Ошибка', 'Имя содержит недопустимые символы!');
            return;
        }

        // Добавление расширения
        const fullNewName = newName.endsWith('.gs') ? newName : `${newName}.gs`;

        // Проверка на совпадение
        if (fullNewName === oldName) {
            Modal.open('Информация', 'Новое имя совпадает со старым!');
            return;
        }

        // Проверка существования
        if (this.files[fullNewName]) {
            Modal.open('Ошибка', `Файл "${fullNewName}" уже существует!`);
            return;
        }

        try {
            // Переименование
            this.files[fullNewName] = this.files[oldName];
            delete this.files[oldName];

            // Обновление текущего файла
            if (this.currentFile === oldName) {
                this.currentFile = fullNewName;
                const title = document.getElementById('notepad-title');
                if (title) {
                    title.textContent = `Блокнот - ${fullNewName}`;
                }
            }

            // Сохранение и обновление
            this.persistFiles();
            FileManager.renderDesktopFiles();

            Modal.open('Успех', `Файл переименован в: ${fullNewName}`);

        } catch (error) {
            console.error('Ошибка переименования:', error);
            Modal.open('Ошибка', `Не удалось переименовать файл: ${error.message}`);
        }
    },

    // ИСПРАВЛЕННЫЙ МЕТОД УДАЛЕНИЯ
    deleteFile(filename) {
        console.log('Попытка удалить файл:', filename);

        if (!filename || !this.files[filename]) {
            console.log('Файл не найден:', filename);
            Modal.open('Ошибка', 'Файл не найден!');
            return;
        }

        try {
            console.log('Удаляем файл:', filename);

            // Удаление файла из объекта
            delete this.files[filename];

            // Если удаляемый файл открыт в редакторе
            if (this.currentFile === filename) {
                console.log('Закрываем открытый файл');
                this.currentFile = null;
                document.getElementById('code-editor').value = '';
                const title = document.getElementById('notepad-title');
                if (title) {
                    title.textContent = 'Блокнот - новый файл';
                }
            }

            // Сохраняем изменения
            this.persistFiles();

            // Обновляем интерфейс
            FileManager.renderDesktopFiles();

            // Скрываем контекстное меню
            FileManager.hideContextMenu();

            console.log('Файл успешно удален');
            Modal.open('Успех', `Файл "${filename}" удален!`);

        } catch (error) {
            console.error('Ошибка удаления файла:', error);
            Modal.open('Ошибка', `Не удалось удалить файл: ${error.message}`);
        }
    },

    loadFile(filename) {
        if (!this.files[filename]) {
            Modal.open('Ошибка', 'Файл не найден!');
            return;
        }
        this.openFile(filename);
    }
};

const AppManager = {
    open(appId) {
        if (!GameState.unlockedApps.includes(appId)) {
            Modal.open('Ошибка', 'Приложение заблокировано!');
            return;
        }
        document.querySelectorAll('.window').forEach(w => w.style.display = 'none');
        const appWindow = document.getElementById(appId);
        appWindow.style.display = 'block';
        this.bringToFront(appWindow);
        GameState.playSound('open');

        if (appId === 'notepad') {
            setTimeout(() => document.getElementById('code-editor').focus(), 100);
        }

        if (appId === 'wallet') {
            Wallet.updateBalance();
        }
    },

    close(appId) {
        document.getElementById(appId).style.display = 'none';
        GameState.playSound('close');
    },

    bringToFront(windowElement) {
        document.querySelectorAll('.window').forEach(w => {
            w.style.zIndex = 1;
        });
        windowElement.style.zIndex = 10;
    }
};

const TabManager = {
    show(tabId) {
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.style.display = 'none';
        });
        const tab = document.getElementById(tabId);
        if (tab) {
            tab.style.display = 'block';
            tab.classList.add('active');
        }
        GameState.playSound('click');
    }
};

const Shop = {
    buy(itemId) {
        const item = GameConfig.items[itemId];
        if (item.bought) {
            Modal.open('Информация', 'Уже куплено!');
            return;
        }
        if (GameState.ramCoins < item.price) {
            Modal.open('Ошибка', 'Не хватает RAM-коинов!');
            return;
        }

        Modal.confirm(
            'Подтверждение покупки',
            `Купить "${itemId}" за ${item.price} RAM?`,
            () => {
                item.bought = true;
                Wallet.addCoins(-item.price, `Покупка: ${itemId}`);
                GameState.items[itemId] = true;

                if (itemId === 'syntax_highlight') {
                    this.enableSyntaxHighlighting();
                }

                this.updateUI();
                GameState.save();
                Modal.open('Успех', 'Покупка совершена!');
                GameState.playSound('buy');
            }
        );
    },

    enableSyntaxHighlighting() {
        console.log('Подсветка синтаксиса активирована!');
    },

    updateUI() {
        document.querySelectorAll('.item').forEach(el => {
            const itemId = el.dataset.itemId;
            el.style.opacity = GameConfig.items[itemId].bought ? 0.5 : 1;
        });
        document.getElementById('ram-coins').textContent = GameState.ramCoins;
    }
};

const Wallet = {
    init() {
        this.updateBalance();
    },

    updateBalance() {
        document.querySelectorAll('#wallet-balance, #ram-coins').forEach(el => {
            el.textContent = GameState.ramCoins;
        });
    },

    watchAd() {
        const btn = document.querySelector('.earn-btn');
        btn.disabled = true;
        btn.textContent = 'Загрузка рекламы...';

        setTimeout(() => {
            this.addCoins(GameConfig.adReward, "Просмотр рекламы");
            btn.textContent = `Посмотреть рекламу (+${GameConfig.adReward} RAM)`;
            btn.disabled = false;
            Modal.open('Успех', `Спасибо за просмотр! +${GameConfig.adReward} RAM`);
        }, 3000);
    },

    buyCoins(amount) {
        const product = GameConfig.yandexProducts[amount];
        if (!product) return;

        if (typeof Ya !== 'undefined' && Ya.Payments) {
            Ya.Payments.purchase({
                id: product.id,
                success: () => {
                    this.addCoins(product.amount, `Покупка RAM (${product.amount} за ${product.price}₽)`);
                    Modal.open('Успех', "Покупка успешна!");
                },
                error: (err) => {
                    console.error("Ошибка покупки:", err);
                    Modal.open('Ошибка', "Ошибка при покупке");
                }
            });
        } else {
            Modal.confirm(
                'Подтверждение покупки',
                `Купить ${product.amount} RAM за ${product.price}₽? (эмуляция)`,
                () => {
                    this.addCoins(product.amount, `Покупка RAM (${product.amount} за ${product.price}₽)`);
                    Modal.open('Успех', "Покупка успешна!");
                }
            );
        }
    },

    addCoins(amount, description) {
        GameState.ramCoins += amount;
        const transaction = {
            amount,
            description,
            date: new Date().toISOString()
        };
        GameState.transactions.unshift(transaction);
        this.updateBalance();
        GameState.save();
        if (amount > 0) GameState.playSound('coins');
    }
};

const WindowDrag = {
    init() {
        document.querySelectorAll('.window-header').forEach(header => {
            header.addEventListener('mousedown', this.startDrag);
        });
    },

    startDrag(e) {
        if (e.target.classList.contains('close-btn')) return;

        const window = this.parentElement;
        AppManager.bringToFront(window);

        const startX = e.clientX;
        const startY = e.clientY;
        const startLeft = window.offsetLeft;
        const startTop = window.offsetTop;

        function moveWindow(e) {
            let newX = startLeft + (e.clientX - startX);
            let newY = startTop + (e.clientY - startY);

            newX = Math.max(0, Math.min(newX, window.parentElement.offsetWidth - window.offsetWidth));
            newY = Math.max(0, Math.min(newY, window.parentElement.offsetHeight - window.offsetHeight));

            window.style.left = newX + 'px';
            window.style.top = newY + 'px';
        }

        function stopDrag() {
            document.removeEventListener('mousemove', moveWindow);
            document.removeEventListener('mouseup', stopDrag);
        }

        document.addEventListener('mousemove', moveWindow);
        document.addEventListener('mouseup', stopDrag);
    }
};


WindowDrag.init = function() {
  document.querySelectorAll('.window-header').forEach(header => {
    header.addEventListener('mousedown', this.startDrag);
  });

  // Фикс для обновления консоли при изменении размера
  const observer = new ResizeObserver(entries => {
    entries.forEach(entry => {
      if (entry.target.id === 'console') {
        const input = document.getElementById('console-cmd');
        input.style.width = entry.contentRect.width - 20 + 'px'; // Ширина минус отступы
      }
    });
  });

  window.addEventListener('resize', () => {
      const output = document.getElementById('console-output');
      output.style.width = '100%'; // Сбрасываем ширину
      output.scrollTop = output.scrollHeight; // Перепозиционируем скролл
  });

  // Наблюдаем за изменением размеров консоли
  observer.observe(document.getElementById('console'));
};

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', () => {
    GameState.load();
    WindowDrag.init();
    Shop.updateUI();
    Documentation.init();
    Wallet.init();
    Notepad.init();
    FileManager.init();
    FileManager.renderDesktopFiles();
    Console.init();


    updateReputationUI(); // Инициализация UI
    setInterval(updateReputationUI, 1000); // Обновление каждую секунду

    const output = document.getElementById('console-output');
    output.scrollTop = output.scrollHeight;

    setTimeout(() => {
        const consoleWindow = document.getElementById('console');
        consoleWindow.style.display = 'none';
        consoleWindow.style.display = 'block';
    }, 10);

    document.querySelectorAll('.doc-menu div[data-section]').forEach(btn => {
        btn.addEventListener('click', () => {
            Documentation.show(btn.dataset.section);
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' || e.key === 'Enter') {
            const modal = document.getElementById('os-modal');
            if (modal.style.display === 'flex') {
                Modal.close();
                e.preventDefault();
            }
        }
    });

    if (typeof Ya !== 'undefined') {
        YaGames.init().then(ysdk => {
            window.ysdk = ysdk;
            console.log('Yandex SDK initialized');
        });
    }
});


