window.GrindError = class GrindError extends Error {
    constructor(message, pos) {
        super(`GrindScript Error: ${message}`);
        this.name = "GrindError";
        this.pos = pos;
    }
    static format(code, pos) {
        if (typeof code !== "string" || typeof pos !== "number") return "";
        const lines = code.split('\n');
        let total = 0;
        for (let i = 0; i < lines.length; i++) {
            const lineLength = lines[i].length + 1;
            if (pos < total + lineLength) {
                const col = pos - total;
                return `Строка ${i + 1}: ${lines[i]}\n${' '.repeat(col)}^`;
            }
            total += lineLength;
        }
        return `Строка ${lines.length}: ${lines[lines.length - 1]}\n${' '.repeat(lines[lines.length - 1]?.length || 0)}^`;
    }
}
