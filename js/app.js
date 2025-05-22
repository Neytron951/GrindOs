// ===== КОНФИГУРАЦИЯ ИГРЫ =====
const GameConfig = {
  // Основные настройки
  enableSounds: false,
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

    save() {
        const saveData = {
            ramCoins: this.ramCoins,
            unlockedApps: this.unlockedApps,
            currentTask: this.currentTask,
            items: this.items,
            transactions: this.transactions
        };
        localStorage.setItem('codeGrindSave', JSON.stringify(saveData));
    },

    load() {
        const saved = localStorage.getItem('codeGrindSave');
        if (saved) {
            const data = JSON.parse(saved);
            this.ramCoins = data.ramCoins || GameConfig.startingRamCoins;
            this.unlockedApps = data.unlockedApps || GameConfig.startingApps;
            this.currentTask = data.currentTask || null;
            this.items = data.items || {};
            this.transactions = data.transactions || [];

            for (const itemId in this.items) {
                if (GameConfig.items[itemId]) {
                    GameConfig.items[itemId].bought = true;
                }
            }
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
        document.getElementById('console-cmd').addEventListener('keydown', async (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                await this.executeCommand();
            }
        });

        this.print("GrindScript Console v1.0", 'system'); // Сохраняем оригинальное название
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

    async executeJavaScript(code) {
        // Ограничиваем доступные функции
        const sandbox = {
            console: { log: this.print.bind(this) },
            print: (text) => this.print(text, 'output'),
            input: GrindAPI.input,

            // Базовые конструкции
            var: null, let: null, const: null,
            if: null, else: null, for: null, while: null,
            function: null, return: null,

            // Математические операции
            Math: {
                abs: Math.abs, round: Math.round,
                floor: Math.floor, ceil: Math.ceil,
                max: Math.max, min: Math.min,
                random: Math.random
            },

            // Ограниченный API
            Array: {
                from: Array.from, isArray: Array.isArray,
                prototype: { push: Array.prototype.push, pop: Array.prototype.pop }
            }
        };

        // Запускаем код в песочнице
        const wrappedCode = `(async () => {
            with(sandbox) {
                ${code}
            }
        })()`;

        const result = await (new Function('sandbox', wrappedCode))(sandbox);
        if (result !== undefined) {
            this.print(String(result), 'output');
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
            this.print(`GrindScript Error: ${e.message}`, 'error'); // Сообщения об ошибках
        }
    },

    // Остальные методы остаются без изменений
    showHelp() {
        this.print("Доступные команды:", 'system');
        this.print("clear - очистить консоль", 'system');
        this.print("help - показать эту справку", 'system');
        this.print("run <file> - выполнить файл (.gs)", 'system'); // Указываем .gs
        this.print("<код> - выполнить код GrindScript", 'system'); // Сохраняем название
    },

    print(text, type = 'normal') {
        const output = document.getElementById('console-output');
        const line = document.createElement('div');
        line.className = `console-line console-${type}`;

        // Форматирование текста
        line.textContent = String(text).replace(/\s+/g, ' ').trim();

        output.appendChild(line);

        // Плавная прокрутка
        requestAnimationFrame(() => {
            output.scrollTop = output.scrollHeight;
        });
    },

    clear() {
        const output = document.getElementById('console-output');
        const systemMessages = Array.from(output.children).filter(line =>
            line.classList.contains('console-system') ||
            line.textContent.includes("GrindScript Console")
        );
        output.innerHTML = '';
        systemMessages.forEach(msg => output.appendChild(msg));
        this.print("Консоль очищена", 'system');
    }

};

const TaskSystem = {
    start(taskId) {
        const task = GameConfig.tasks[taskId];
        if (!task) return;

        GameState.currentTask = taskId;
        Notepad.newFile();
        document.getElementById('code-editor').value = `// Задание: ${task.description}\n\n`;
        document.getElementById('submit-task-btn').style.display = 'block';
        AppManager.open('notepad');
    },

    checkSolution() {
        const taskId = GameState.currentTask;
        if (!taskId) return false;

        const task = GameConfig.tasks[taskId];
        const code = document.getElementById('code-editor').value;

        try {
            const testVM = new GrindVM();
            const testOutput = [];
            testVM.setOutputHandler(text => testOutput.push(text));

            const lexer = new GrindLexer();
            const parser = new GrindParser(lexer.tokenize(code));
            testVM.execute(parser.parse());

            if (taskId === '1') {
                if (testVM.variables.add &&
                    typeof testVM.variables.add.value === 'function') {
                    const add = testVM.variables.add.value;
                    return add(2, 3) === 5 && add(-1, 1) === 0;
                }
            }
            // Аналогичные проверки для других заданий...

            return false;
        } catch (e) {
            Console.handleError(e, code);
            return false;
        }
    },

    submitSolution() {
        if (this.checkSolution()) {
            Wallet.addCoins(GameConfig.tasks[GameState.currentTask].reward,
                            `Задание ${GameState.currentTask}`);
            Modal.open('Успех', 'Задание выполнено правильно!');
            GameConfig.tasks[GameState.currentTask].completed = true;
        } else {
            Modal.open('Ошибка', 'Решение неверное, попробуйте ещё раз');
        }
    }
};

const Modal = {
    open(title, message, callback = null) {
        document.getElementById('os-modal-title').textContent = title;
        document.getElementById('os-modal-text').innerHTML = message;
        document.getElementById('os-modal').style.display = 'flex';

        setTimeout(() => {
            const btn = document.querySelector('.os-modal-footer button');
            if (btn) btn.focus();
        }, 100);

        if (callback) {
            this.callback = callback;
        }

        GameState.playSound('open');
    },

    close() {
        document.getElementById('os-modal').style.display = 'none';
        if (this.callback) {
            this.callback();
            this.callback = null;
        }
        GameState.playSound('close');
    },

    confirm(title, message, confirmCallback, cancelCallback = null) {
        this.open(title, message, () => {
            const modalFooter = document.querySelector('.os-modal-footer');
            modalFooter.innerHTML = `
                <button onclick="Modal.confirmAction(true)">Да</button>
                <button onclick="Modal.confirmAction(false)">Нет</button>
            `;

            this.confirmCallback = confirmCallback;
            this.cancelCallback = cancelCallback;
        });
    },

    confirmAction(confirmed) {
        this.close();
        if (confirmed && this.confirmCallback) {
            this.confirmCallback();
        } else if (!confirmed && this.cancelCallback) {
            this.cancelCallback();
        }
        this.confirmCallback = null;
        this.cancelCallback = null;
    }
};

const FileManager = {
    selectedFile: null,

    init() {
        this.renderDesktopFiles();

        document.getElementById('desktop').addEventListener('click', (e) => {
            if (!e.target.closest('.desktop-icon') && !e.target.closest('.context-menu')) {
                this.hideContextMenu();
            }
        });

        document.getElementById('desktop').addEventListener('contextmenu', (e) => {
            e.preventDefault();
            const icon = e.target.closest('.desktop-icon');
            if (icon) {
                this.selectedFile = icon.dataset.filename;
                this.showContextMenu(e.clientX, e.clientY);
            }
        });
    },

    renderDesktopFiles() {
        const desktop = document.getElementById('desktop');
        desktop.querySelectorAll('.desktop-icon').forEach(icon => icon.remove());

        Object.keys(Notepad.files).forEach((filename, index) => {
            const icon = document.createElement('div');
            icon.className = 'desktop-icon';
            icon.dataset.filename = filename;
            icon.innerHTML = `<img src="icons/file-gs.png"><div>${filename}</div>`;
            icon.addEventListener('dblclick', () => this.openFile(filename));

            const row = Math.floor(index / 5);
            const col = index % 5;
            icon.style.left = `${120 + col * 90}px`;
            icon.style.top = `${20 + row * 100}px`;

            desktop.appendChild(icon);
        });
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
        Modal.open('Переименовать файл', `
            <div class="rename-container">
                <input type="text" id="rename-input" value="${currentName}">
                <div class="file-extension">.gs</div>
            </div>
        `, () => {
            const newName = document.getElementById('rename-input').value.trim();
            if (newName && newName !== currentName) {
                Notepad.renameFile(this.selectedFile, newName);
            }
        });

        setTimeout(() => {
            const input = document.getElementById('rename-input');
            if (input) {
                input.focus();
                input.select();
            }
        }, 50);

        this.hideContextMenu();
    },

    deleteSelected() {
        if (!this.selectedFile) return;

        Modal.confirm('Удаление файла', `Вы уверены, что хотите удалить "${this.selectedFile}"?`,
            () => {
                Notepad.deleteFile(this.selectedFile);
                this.selectedFile = null;
                FileManager.renderDesktopFiles();
            },
            () => {
                this.selectedFile = null;
            }
        );
    },

    showContextMenu(x, y) {
        const menu = document.getElementById('context-menu');
        menu.style.display = 'block';
        menu.style.left = `${x}px`;
        menu.style.top = `${y}px`;
    },

    hideContextMenu() {
        document.getElementById('context-menu').style.display = 'none';
    }
};

const Notepad = {
    currentFile: null,
    files: {},

    init() {
        const savedFiles = localStorage.getItem('grindScriptFiles');
        this.files = savedFiles ? JSON.parse(savedFiles) : {};

        document.getElementById('code-editor').addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.save();
            }
        });
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
        document.getElementById('notepad-title').textContent = 'Блокнот - новый файл';
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
        document.getElementById('notepad-title').textContent = `Блокнот - ${filename}`;
    },

    save() {
        const content = document.getElementById('code-editor').value;
        if (!this.currentFile) {
            this.saveAs();
            return;
        }
        this.files[this.currentFile] = content;
        this.persistFiles();
        Modal.open('Успех', `Файл "${this.currentFile}" сохранен!`);
    },

    saveAs() {
        const content = document.getElementById('code-editor').value;

        // Дебаунс для избежания рекурсии
        let isSaving = false;

        Modal.open('Сохранить файл', `
            <div class="save-container">
                <input type="text" id="filename-input"
                       placeholder="новый_файл"
                       value="${this.currentFile?.replace('.gs', '') || ''}">
                <div class="file-extension">.gs</div>
            </div>
        `, () => {
            if (isSaving) return;
            isSaving = true;

            const filename = document.getElementById('filename-input').value.trim();
            if (!filename) {
                Modal.open('Ошибка', 'Имя файла не может быть пустым!');
                isSaving = false;
                return;
            }

            const fullName = filename.endsWith('.gs') ? filename : `${filename}.gs`;

            // Асинхронное сохранение
            setTimeout(() => {
                this.currentFile = fullName;
                this.files[fullName] = content;
                this.persistFiles();
                FileManager.renderDesktopFiles();
                Modal.close();
                isSaving = false;
            }, 100);
        });
    },

    persistFiles() {
        localStorage.setItem('grindScriptFiles', JSON.stringify(this.files));
        FileManager.renderDesktopFiles();
    },

    renameFile(oldName, newName) {
        if (!oldName || !newName || !this.files[oldName]) return;

        const fullNewName = newName.endsWith('.gs') ? newName : `${newName}.gs`;

        if (fullNewName === oldName) return;

        if (this.files[fullNewName]) {
            Modal.open('Ошибка', `Файл "${fullNewName}" уже существует!`);
            return;
        }

        this.files[fullNewName] = this.files[oldName];
        delete this.files[oldName];

        if (this.currentFile === oldName) {
            this.currentFile = fullNewName;
            document.getElementById('notepad-title').textContent = `Блокнот - ${fullNewName}`;
        }

        this.persistFiles();
        FileManager.renderDesktopFiles();
    },

    deleteFile(filename) {
        if (!filename || !this.files[filename]) return;

        delete this.files[filename];
        this.persistFiles();
        FileManager.renderDesktopFiles();

        if (this.currentFile === filename) {
            this.newFile();
        }
    },

    loadFile(filename) {
        if (!this.files[filename]) {
            Modal.open('Ошибка', 'Файл не найден!');
            return;
        }
        this.currentFile = filename;
        document.getElementById('code-editor').value = this.files[filename];
        document.getElementById('notepad-title').textContent = `Блокнот - ${filename}`;
        AppManager.open('notepad');
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


