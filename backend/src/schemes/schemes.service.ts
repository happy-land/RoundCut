import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Order } from 'src/orders/entities/order.entity';
import { Priceitem } from 'src/priceitems/entities/priceitem.entity';
import { User } from 'src/users/entities/user.entity';
import { Scheme, SchemeStatus } from './entities/scheme.entity';
import { SchemeItem } from './entities/scheme-item.entity';
import { layoutBars } from './scheme-layout';
import { UpdateSchemeStatusDto } from './dto/update-scheme-status.dto';

@Injectable()
export class SchemesService {
  constructor(
    @InjectRepository(Scheme)
    private readonly schemesRepo: Repository<Scheme>,
    @InjectRepository(Order)
    private readonly ordersRepo: Repository<Order>,
    @InjectRepository(Priceitem)
    private readonly priceitemsRepo: Repository<Priceitem>,
  ) {}

  /**
   * Сформировать схему резки из заказа.
   * Идемпотентно: повторный вызов возвращает уже существующую схему.
   */
  async generateFromOrder(orderId: number, user: User): Promise<Scheme> {
    const number = `л${orderId}`;
    const existing = await this.schemesRepo.findOne({ where: { number } });
    if (existing) return existing;

    const order = await this.ordersRepo.findOne({
      where: { id: orderId },
      relations: ['user'],
    });
    if (!order) {
      throw new NotFoundException(`Заказ #${orderId} не найден`);
    }

    const cuttable = order.items.filter(
      (i) =>
        i.billetData &&
        i.billetData.workpieces?.length > 0 &&
        i.billetData.numCircles > 0,
    );
    if (cuttable.length === 0) {
      throw new BadRequestException(
        'В заказе нет позиций с расчётом заготовок',
      );
    }

    // Длины кругов — из прайса по priceitemId
    const priceitems = await this.priceitemsRepo.findBy({
      id: In(cuttable.map((i) => i.priceitemId)),
    });
    const lengthByPriceitemId = new Map(
      priceitems.map((p) => [p.id, Number(p.length)]),
    );

    const items: Partial<SchemeItem>[] = cuttable.map((item, idx) => {
      const bd = item.billetData!;
      const barLengthMm = Math.round(
        (lengthByPriceitemId.get(item.priceitemId) ?? 0) * 1000,
      );
      const pieces = bd.workpieces.map((w) => ({
        lengthMm: Math.round(w.length),
        qty: w.quantity,
      }));
      const bars = layoutBars(pieces, barLengthMm, bd.cutThickness, bd.endCut);
      const lastBar = bars[bars.length - 1];
      const diameter = parseInt(item.size, 10) || 0;

      return {
        productName: `${item.name} ${item.size}`,
        gost: item.other,
        weightTons: item.weightTons,
        totalQty: bd.numCircles,
        cutQty: bd.numCircles,
        machine:
          diameter > 0
            ? diameter < 50
              ? 'Отрезной станок'
              : 'Лентопильный станок'
            : null,
        barLengthMm,
        kerfMm: bd.cutThickness,
        endCutMm: bd.endCut,
        remainderMm: lastBar ? lastBar.remainderMm : 0,
        pieces,
        bars,
        sortOrder: idx,
      };
    });

    const scheme = this.schemesRepo.create({
      number,
      order,
      status: SchemeStatus.DRAFT,
      warehouseName: cuttable[0].warehouseName,
      clientName: order.user?.username ?? null,
      managerName: user.username,
      items: items as SchemeItem[],
    });

    return this.schemesRepo.save(scheme);
  }

  /** Список схем, от новых к старым */
  findAll(): Promise<Scheme[]> {
    return this.schemesRepo.find({ order: { createdAt: 'DESC' } });
  }

  async findOne(id: number): Promise<Scheme> {
    const scheme = await this.schemesRepo.findOne({ where: { id } });
    if (!scheme) {
      throw new NotFoundException(`Схема #${id} не найдена`);
    }
    return scheme;
  }

  async updateStatus(id: number, dto: UpdateSchemeStatusDto): Promise<Scheme> {
    const scheme = await this.findOne(id);
    scheme.status = dto.status;
    return this.schemesRepo.save(scheme);
  }
}

