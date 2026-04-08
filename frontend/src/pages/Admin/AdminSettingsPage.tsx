import { FC, useState, useEffect } from 'react';
import { useGetSettingsQuery, useUpdateSettingMutation } from '../../services/settingsApi';
import block from 'bem-cn';
import './AdminSettingsPage.scss';

const cn = block('admin-settings');

interface SettingField {
  key: string;
  label: string;
  description: string;
  inputType: 'number';
  step?: string;
}

const FIELDS: SettingField[] = [
  {
    key: 'billet_markup_percent',
    label: 'Наценка на часть круга',
    description: 'Доля от базовой цены. Например: 0.12 = 12%',
    inputType: 'number',
    step: '0.01',
  },
  {
    key: 'min_billet_markup_rub',
    label: 'Минимальная наценка на часть круга, ₽',
    description: 'Минимальная сумма надбавки в рублях при продаже части круга',
    inputType: 'number',
    step: '1',
  },
];

const AdminSettingsPage: FC = () => {
  const { data: settings, isLoading } = useGetSettingsQuery();
  const [updateSetting] = useUpdateSettingMutation();

  const [values, setValues] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (settings) {
      setValues(settings);
    }
  }, [settings]);

  const handleChange = (key: string, val: string) => {
    setValues((prev) => ({ ...prev, [key]: val }));
    setSaved((prev) => ({ ...prev, [key]: false }));
  };

  const handleSave = async (key: string) => {
    await updateSetting({ key, value: values[key] });
    setSaved((prev) => ({ ...prev, [key]: true }));
  };

  if (isLoading) return <p>Загрузка...</p>;

  return (
    <div className={cn()}>
      <h2 className={cn('title')}>Настройки расчётов</h2>
      <div className={cn('fields')}>
        {FIELDS.map((field) => (
          <div key={field.key} className={cn('field')}>
            <label className={cn('label')}>{field.label}</label>
            <p className={cn('description')}>{field.description}</p>
            <div className={cn('row')}>
              <input
                className={cn('input')}
                type={field.inputType}
                step={field.step}
                value={values[field.key] ?? ''}
                onChange={(e) => handleChange(field.key, e.target.value)}
              />
              <button
                className={cn('btn', { saved: !!saved[field.key] })}
                onClick={() => handleSave(field.key)}
              >
                {saved[field.key] ? '✓ Сохранено' : 'Сохранить'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminSettingsPage;
