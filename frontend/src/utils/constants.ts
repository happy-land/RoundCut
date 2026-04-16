export const baseUrl: string = import.meta.env.DEV
  ? 'http://localhost:3000/api'
  : '/api';
export const proxyPathToCSV: string = '/import/prise_last.csv';

export const remoteUrl: string = 'https://www.metallotorg.ru';
export const remotePathToCSV: string = remoteUrl + '/import/prise_last.csv';

export const CUT_CODE_LABELS: Record<string, string> = {
  bandsaw: 'Лентопильная',
  cutoff: 'Отрезной станок',
  gas: 'Газовая резка',
  guillotine: 'Гильотина',
  plasma: 'Плазменная резка',
  thermal: 'Термическая резка',
  laser: 'Лазерная резка',
};

export const testUser = {
  username: 'Ruslan6',
  password: '123456',
}

export const PAGE_SIZE = 20;