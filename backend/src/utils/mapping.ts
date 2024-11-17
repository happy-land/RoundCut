export const mapBaseName = (name: string): string | null => {
  switch (name) {
    case 'БЕЛГОРОД_КРЕЙДА':
      return 'БЕЛГОРОД';
    case 'ВСК':
      return null;
    case 'МАХАЧКАЛА ДОК':
      return null;
    case 'МЕЧЕЛ-СЕРВИС':
      return null;
    case 'МЕЧЕЛ-ТЮМЕНЬ':
      return null;
    case 'НИЖНИЙ':
      return 'НИЖНИЙ НОВГОРОД';
    case 'ПЕРЕВАЛКИ':
      return null;
    case 'ПИТЕР_ФОРНОСОВО':
      return 'САНКТ-ПЕТЕРБУРГ';
    case 'РОСТОВ':
      return 'РОСТОВ-НА-ДОНУ';
    case 'РОСТОВ2':
      return 'РОСТОВ-НА-ДОНУ2';
    case 'СТРОЙБАЗА':
      return null;
    case 'ТИТАРОВКА':
      return null; // склад Краснодар уже есть в таблице наценок
    case 'ТУЛА_ПЛЕХАНОВО':
      return 'ТУЛА';
    case 'УГЛИ':
      return 'ЭЛЕКТРОУГЛИ';
    case 'УГЛИ_Оконечники':
      return null;
    case 'ЧЕЛНЫ':
      return 'НАБЕРЕЖНЫЕ ЧЕЛНЫ';
    case 'ЧУЖОЙ СКЛАД':
      return null;
    default:
      return name;
  }
};
