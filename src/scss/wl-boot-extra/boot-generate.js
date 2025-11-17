import { writeFileSync } from "fs";

const startNumber = 65; // начальное число
const iterations = 80; // сколько блоков создать
const filename = "boot.scss";

let content = "";

for (let i = 0; i < iterations; i += 5) {
	const currentNumber = startNumber + i;

	const block = `
/* --  ${currentNumber} -- */
.g-${currentNumber},
.gx-${currentNumber} { 
    --bs-gutter-x: ${currentNumber}px;  
}
.g-${currentNumber},
.gy-${currentNumber} {  
    --bs-gutter-y: ${currentNumber}px;
}
`;
	content += block;
}

// Записываем содержимое в файл
writeFileSync(filename, content, "utf8");

console.log(`Файл ${filename} успешно создан с ${iterations} блоками.`);
