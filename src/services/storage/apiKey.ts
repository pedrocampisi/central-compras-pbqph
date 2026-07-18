/**
 * Chave da API OpenRouter — armazenada POR DISPOSITIVO no localStorage.
 *
 * Antes ela vivia em config.openrouter_api_key dentro do JSON compartilhado,
 * o que a espalhava para o OneDrive, backups rotativos e cache. Agora cada
 * computador guarda a própria chave localmente; o JSON compartilhado não
 * carrega mais segredos.
 *
 * Retrocompat: no boot, o App migra automaticamente uma chave encontrada no
 * JSON para o localStorage e a remove do JSON no próximo save.
 */

const STORAGE_KEY = 'central-compras-openrouter-key';

export function getApiKey(): string {
  try {
    return localStorage.getItem(STORAGE_KEY) ?? '';
  } catch {
    return '';
  }
}

export function setApiKey(value: string): void {
  try {
    if (value) localStorage.setItem(STORAGE_KEY, value);
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* localStorage indisponível — chave só não persiste */
  }
}
