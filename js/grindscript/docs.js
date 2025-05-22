// js/grindscript/docs.js
const GrindDocs = {
    basics: {
        title: "🟢 Основы",
        content: `
            <h3>Структура программы</h3>
            <pre>// Однострочный комментарий
function main() {
    print("Hello World!");
}</pre>

            <h3>Особенности</h3>
            <ul>
                <li>Динамическая типизация</li>
                <li>Автоматическое приведение типов</li>
                <li>Максимум 3 уровня вложенности</li>
            </ul>
        `
    },

    types: {
        title: "📦 Типы данных",
        content: `
            <h3>Базовые типы</h3>
            <pre>x = 5;          // Число
name = "Иван";   // Строка
active = true;   // Логическое</pre>

            <h3>Преобразование типов</h3>
            <pre>"5" + 3 = "53"  // Конкатенация
true + 5 = 6      // Логическое → число</pre>
        `
    },

    functions: {
        title: "ƒ Функции",
        content: `
            <h3>Объявление</h3>
            <pre>function sum(a, b) {
    return a + b;
}</pre>

            <h3>Ограничения</h3>
            <ul>
                <li>Максимум 5 параметров</li>
                <li>Нельзя передавать функции как аргументы</li>
                <li>Глубина рекурсии до 10 уровней</li>
            </ul>
        `
    },

    conditions: {
        title: "❓ Условия",
        content: `
            <h3>Синтаксис if/else</h3>
            <pre>if (x > 10) {
    print("Больше 10");
} else if (x > 5) {
    print("Больше 5");
} else {
    print("Меньше 6");
}</pre>
        `
    },

    loops: {
        title: "🔄 Циклы",
        content: `
            <h3>Цикл while</h3>
            <pre>i = 0;
while (i < 5) {
    print(i);
    i += 1;
}</pre>

            <h3>Цикл for</h3>
            <pre>for (i = 0; i < 3; i += 1) {
    print(i * 10);
}</pre>

            <h3>Ограничения</h3>
            <ul>
                <li>Максимум 1000 итераций</li>
                <li>Нет break/continue</li>
            </ul>
        `
    },

    errors: {
        title: "❌ Ошибки",
        content: `
            <div class="error-item">
                <code>TypeError</code> - несовместимость типов
            </div>
            <div class="error-item">
                <code>StackOverflow</code> - переполнение стека
            </div>
            <div class="error-item">
                <code>MaxLoops</code> - превышено число итераций
            </div>
        `
    },

    io: {
        title: "📤 Ввод/Вывод",
        content: `
            <h3>Базовые функции</h3>
            <pre>print("Текст");  // Вывод в консоль
input();        // Чтение строки</pre>

            <h3>Пример</h3>
            <pre>name = input();
print("Привет, " + name);</pre>
        `
    },

    // Добавляем в конец объекта GrindDocs
operators: {
    title: "🔧 Операторы",
    content: `
        <h3>Основные операторы</h3>
        <pre>+  -  *  /  %  ==  !=  >  <  >=  <=  &&  || !</pre>

        <h3>Примеры</h3>
        <pre>5 + 3 * 2  // 11
(5 + 3) * 2 // 16
"Hello" + " " + "World" // "Hello World"</pre>
    `
}

};
