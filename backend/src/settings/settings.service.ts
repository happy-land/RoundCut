import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setting } from './entities/setting.entity';

const DEFAULTS: Omit<Setting, 'updatedAt'>[] = [
  {
    key: 'billet_markup_percent',
    value: '0.12',
    description: 'Наценка на часть круга (доля, например 0.12 = 12%)',
  },
  {
    key: 'min_billet_markup_rub',
    value: '1999',
    description: 'Минимальная наценка на часть круга, ₽',
  },
];

@Injectable()
export class SettingsService implements OnModuleInit {
  constructor(
    @InjectRepository(Setting)
    private readonly settingsRepo: Repository<Setting>,
  ) {}

  async onModuleInit() {
    for (const def of DEFAULTS) {
      const exists = await this.settingsRepo.findOne({ where: { key: def.key } });
      if (!exists) {
        await this.settingsRepo.save(this.settingsRepo.create(def));
      }
    }
  }

  async findAll(): Promise<Record<string, string>> {
    const settings = await this.settingsRepo.find();
    return Object.fromEntries(settings.map((s) => [s.key, s.value]));
  }

  async update(key: string, value: string): Promise<Setting> {
    const setting = await this.settingsRepo.findOne({ where: { key } });
    if (!setting) throw new NotFoundException(`Setting "${key}" not found`);
    setting.value = value;
    return this.settingsRepo.save(setting);
  }
}
