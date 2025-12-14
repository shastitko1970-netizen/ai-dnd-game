// Функции валидации данных

export function validateCharacterName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Имя не может быть пустым' };
  }
  if (name.length < 2) {
    return { valid: false, error: 'Имя должно содержать крайне минимум 2 символа' };
  }
  if (name.length > 50) {
    return { valid: false, error: 'Имя слишком длинное' };
  }
  return { valid: true };
}

export function validateCustomRaceName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Название расы не может быть пустым' };
  }
  if (name.length < 2) {
    return { valid: false, error: 'Название расы должно содержать крайне минимум 2 символа' };
  }
  if (name.length > 50) {
    return { valid: false, error: 'Название расы слишком длинное' };
  }
  return { valid: true };
}

export function validateSpeed(speed: number): { valid: boolean; error?: string } {
  if (speed < 0) {
    return { valid: false, error: 'Скорость не может быть отрицательной' };
  }
  if (speed > 120) {
    return { valid: false, error: 'Скорость слишком высокая' };
  }
  return { valid: true };
}
