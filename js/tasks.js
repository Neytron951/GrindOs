// tasks.js
const GameTasks = {
    1: {
        difficulty: 1,
        description: "Вывести число 5 в консоль",
        reward: 50,
        solution: "print(5);", // Скрытое решение
        testCases: [
            {input: [], expectedOutput: "5"},
            {input: [], expectedOutput: "5\n"} // Разные варианты вывода
        ],
        required: "output"
    },
    2: {
        difficulty: 2,
        description: "Создать функцию add(a, b) возвращающую сумму. P.s Не вызывайте функцию в коде!",
        reward: 80,
        solution: "function add(a, b) { return a + b; }",
        testCases: [
            {args: [2, 3], expected: 5},
            {args: [-1, 5], expected: 4},
            {args: [0, 0], expected: 0} // Добавьте больше тестов
        ],
        required: "function"
    }
    // Добавьте остальные задания по аналогии
};
