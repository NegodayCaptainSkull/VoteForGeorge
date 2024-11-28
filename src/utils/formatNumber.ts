const formatNumber = (num: number): string => {
  if (num < 1000000) return num.toFixed(1).replace(/\.0$/, ''); // Если число меньше миллиона, просто возвращаем его как строку.

  const suffixes = ["", "миллион", "миллиард", "триллион", "квадриллион", "квинтиллион", "секстиллион", "септиллион", "октиллион", "нониллион", "дециллион"];
  
  let i = 0;

  // Пока число больше 1000, делим его
  while (num >= 1000) {
    if (i === 0) {
      num /= 1000000; // Для миллионов сразу делим на 1,000,000
    } else {
      num /= 1000; // Для миллиардов, триллионов и так далее — на 1000
    }
    i++;
  }

  // Округляем число и убираем лишние нули
  const formattedNum = num.toFixed(4).replace(/\.0000$/, '');

  return `${formattedNum} ${suffixes[i]}${getPlural(num, suffixes[i])}`; // Используем исходное значение
}

// Функция для выбора правильного склонения
const getPlural = (num: number, word: string): string => {
  if (word === '') return ''; // Для чисел меньших миллиона, просто без суффикса

  const lastDigit = Math.floor(num % 10);
  const lastTwoDigits = Math.floor(num % 100);

  if (lastDigit === 1 && lastTwoDigits !== 11) {
    return ''; // Единичная форма
  } else if (lastDigit >= 2 && lastDigit <= 4 && (lastTwoDigits < 10 || lastTwoDigits >= 20)) {
    return 'а'; // Форма для 2, 3, 4
  } else {
    return 'ов'; // Форма для всех остальных
  }
};

export default formatNumber;
