import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CartItem } from './entities/cartitem.entity';
import { CreateCartItemDto, BilletCartData } from './dto/create-cartitem.dto';
import { User } from 'src/users/entities/user.entity';
import { MailerService } from 'src/mailer/mailer.service';
import { SendGuestOrderDto } from './dto/send-guest-order.dto';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(CartItem)
    private readonly cartRepository: Repository<CartItem>,
    private readonly mailerService: MailerService,
  ) {}

  async getCart(user: User): Promise<CartItem[]> {
    return this.cartRepository.find({
      where: { user: { id: user.id } },
      order: { createdAt: 'ASC' },
    });
  }

  async addItem(dto: CreateCartItemDto, user: User): Promise<CartItem> {
    const item = this.cartRepository.create({ ...dto, user });
    return this.cartRepository.save(item);
  }

  async removeItem(id: number, user: User): Promise<void> {
    const item = await this.cartRepository.findOne({
      where: { id, user: { id: user.id } },
    });
    if (!item) {
      throw new NotFoundException(`Позиция ${id} не найдена в корзине`);
    }
    await this.cartRepository.remove(item);
  }

  async clearCart(user: User): Promise<void> {
    await this.cartRepository.delete({ user: { id: user.id } });
  }

  async sendOrderToSelf(user: User): Promise<void> {
    const items = await this.getCart(user);
    if (!items.length) throw new Error('Корзина пуста');

    try {
      const totalGoods = items.reduce(
        (s, i) => s + Number(i.totalGoodsPrice),
        0,
      );
      const totalCutting = items.reduce(
        (s, i) => s + Number(i.totalCuttingCost),
        0,
      );
      const totalAll = totalGoods + totalCutting;

    const rows = items
      .map((item, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
        const bd = 'border-bottom:1px solid #e5e7eb';

        // Строка заготовок (для позиций из вкладки "Расчёт заготовок")
        const billetRow = item.billetData
          ? (() => {
              const bd_ = item.billetData;
              const wpList = bd_.workpieces
                .map((w) => `${w.length} мм × ${w.quantity} шт`)
                .join(', ');

              const circlesPricePart =
                bd_.numCompleteCircles > 0 && bd_.wholeCirclesPricePerTon
                  ? `целые: ${bd_.wholeCirclesPricePerTon.toLocaleString('ru-RU')} ₽/т`
                  : '';
              const partPricePart =
                bd_.partWeight > 0 && bd_.partPricePerTon
                  ? `часть: ${bd_.partPricePerTon.toLocaleString('ru-RU')} ₽/т`
                  : '';
              const priceInfo = [circlesPricePart, partPricePart]
                .filter(Boolean)
                .join(' &nbsp;|&nbsp; ');

              const circlesInfo =
                bd_.partWeight > 0
                  ? `${bd_.numCompleteCircles} цел. + 1 часть (${bd_.partWeight.toFixed(3)} т)`
                  : `${bd_.numCompleteCircles} шт`;

              return `<tr style="background:${bg}">
                <td colspan="7" style="padding:4px 14px 10px;font-size:12px;color:#6b7280;${bd}">
                  🔧 Заготовки: ${wpList} &nbsp;|&nbsp;
                  Кругов: ${circlesInfo} &nbsp;|&nbsp;
                  ${priceInfo}${priceInfo ? ' &nbsp;|&nbsp; ' : ''}
                  Рез: ${bd_.cutThickness} мм${bd_.endCut ? ` &nbsp;|&nbsp; Торец: ${bd_.endCut} мм` : ''} &nbsp;|&nbsp;
                  Резов: ${bd_.totalCuts} шт
                </td>
              </tr>`;
            })()
          : item.cuttingDescription
            ? `<tr style="background:${bg}">
                <td colspan="7" style="padding:4px 14px 10px;font-size:12px;color:#6b7280;${bd}">
                  ✂ Резка: ${item.cuttingDescription}
                </td>
              </tr>`
            : '';

        return `
        <tr style="background:${bg}">
          <td style="padding:12px 14px;${bd};font-size:14px;color:#111">${item.name} ${item.size}${item.warehouseName ? `<br><span style="font-size:11px;color:#9ca3af">&#128230; ${item.warehouseName}</span>` : ''}</td>
          <td style="padding:12px 14px;${bd};font-size:14px;color:#374151;text-align:center">${item.quantity} шт</td>
          <td style="padding:12px 14px;${bd};font-size:14px;color:#374151;text-align:center">${Number(item.weightTons).toFixed(3)} т</td>
          <td style="padding:12px 14px;${bd};font-size:14px;color:#374151;text-align:right">${Number(item.pricePerTon).toFixed(0)} ₽/т</td>
          <td style="padding:12px 14px;${bd};font-size:14px;color:#374151;text-align:right">${Number(item.totalGoodsPrice).toFixed(0)} ₽</td>
          <td style="padding:12px 14px;${bd};font-size:14px;color:#374151;text-align:right">${Number(item.totalCuttingCost) > 0 ? Number(item.totalCuttingCost).toFixed(0) + ' ₽' : '—'}</td>
          <td style="padding:12px 14px;${bd};font-size:14px;font-weight:600;color:#111;text-align:right">${(Number(item.totalGoodsPrice) + Number(item.totalCuttingCost)).toFixed(0)} ₽</td>
        </tr>
        ${billetRow}`;
      })
      .join('');

    const cuttingRow =
      totalCutting > 0
        ? `<tr>
            <td colspan="5" style="padding:8px 14px;text-align:right;font-size:14px;color:#6b7280">Резка:</td>
            <td colspan="2" style="padding:8px 14px;text-align:right;font-size:14px;color:#374151;font-weight:500">${totalCutting.toFixed(0)} ₽</td>
           </tr>`
        : '';

    const html = `
<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px">
    <tr><td align="center">
      <table width="680" cellpadding="0" cellspacing="0" style="max-width:680px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07)">

        <!-- Header -->
        <tr>
          <td style="background:linear-gradient(135deg,#4e60ff 0%,#6b7bff 100%);padding:28px 32px">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px">RoundCut</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px">Ваш заказ</p>
          </td>
        </tr>

        <!-- Greeting -->
        <tr>
          <td style="padding:24px 32px 8px">
            <p style="margin:0;font-size:15px;color:#374151">Здравствуйте, <strong>${user.username}</strong>!</p>
            <p style="margin:8px 0 0;font-size:14px;color:#6b7280">Вы сохранили состав заказа на электронную почту.</p>
          </td>
        </tr>

        <!-- Table -->
        <tr>
          <td style="padding:16px 32px">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
              <thead>
                <tr style="background:#f9fafb">
                  <th style="padding:11px 14px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb">Наименование</th>
                  <th style="padding:11px 14px;text-align:center;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb">Кол-во</th>
                  <th style="padding:11px 14px;text-align:center;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb">Вес</th>
                  <th style="padding:11px 14px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb">Цена/т</th>
                  <th style="padding:11px 14px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb">Металл</th>
                  <th style="padding:11px 14px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb">Резка</th>
                  <th style="padding:11px 14px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb">Итого</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
              <tfoot>
                ${cuttingRow}
                <tr style="background:#f0f4ff">
                  <td colspan="5" style="padding:14px;text-align:right;font-size:15px;font-weight:600;color:#374151">Итого к оплате:</td>
                  <td colspan="2" style="padding:14px;text-align:right;font-size:18px;font-weight:700;color:#4e60ff">${totalAll.toFixed(0)} ₽</td>
                </tr>
              </tfoot>
            </table>
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="padding:20px 32px 28px;border-top:1px solid #f3f4f6">
            <p style="margin:0;font-size:13px;color:#9ca3af">Письмо сформировано автоматически системой RoundCut</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await this.mailerService.sendEmail({
      recipients: [{ name: user.username, address: user.email }],
      subject: `Заказ RoundCut — ${new Date().toLocaleDateString('ru-RU')}`,
      html,
    });
    } catch (error) {
      console.error('[CART] Error in sendOrderToSelf:', error);
      throw error;
    }
  }

  async sendGuestOrder(dto: SendGuestOrderDto): Promise<void> {
    const { email, name, items } = dto;
    if (!items.length) throw new Error('Корзина пуста');

    try {
      const totalGoods = items.reduce((s, i) => s + Number(i.totalGoodsPrice), 0);
      const totalCutting = items.reduce((s, i) => s + Number(i.totalCuttingCost), 0);
      const totalAll = totalGoods + totalCutting;

    const rows = items
      .map((item, idx) => {
        const bg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
        const bd = 'border-bottom:1px solid #e5e7eb';

        const billetRow = item.billetData
          ? (() => {
              const bd_ = item.billetData as BilletCartData;
              const wpList = bd_.workpieces
                .map((w) => `${w.length} мм × ${w.quantity} шт`)
                .join(', ');
              const circlesInfo =
                bd_.partWeight > 0
                  ? `${bd_.numCompleteCircles} цел. + 1 часть (${bd_.partWeight.toFixed(3)} т)`
                  : `${bd_.numCompleteCircles} шт`;
              return `<tr style="background:${bg}">
                <td colspan="7" style="padding:4px 14px 10px;font-size:12px;color:#6b7280;${bd}">
                  🔧 Заготовки: ${wpList} &nbsp;|&nbsp; Кругов: ${circlesInfo}
                  &nbsp;|&nbsp; Рез: ${bd_.cutThickness} мм
                  ${bd_.endCut ? `&nbsp;|&nbsp; Торец: ${bd_.endCut} мм` : ''}
                  &nbsp;|&nbsp; Резов: ${bd_.totalCuts} шт
                </td>
              </tr>`;
            })()
          : item.cuttingDescription
            ? `<tr style="background:${bg}">
                <td colspan="7" style="padding:4px 14px 10px;font-size:12px;color:#6b7280;${bd}">
                  ✂ Резка: ${item.cuttingDescription}
                </td>
              </tr>`
            : '';

        return `
        <tr style="background:${bg}">
          <td style="padding:12px 14px;${bd};font-size:14px;color:#111">${item.name} ${item.size}${item.warehouseName ? `<br><span style="font-size:11px;color:#9ca3af">&#128230; ${item.warehouseName}</span>` : ''}</td>
          <td style="padding:12px 14px;${bd};font-size:14px;color:#374151;text-align:center">${item.quantity} шт</td>
          <td style="padding:12px 14px;${bd};font-size:14px;color:#374151;text-align:center">${Number(item.weightTons).toFixed(3)} т</td>
          <td style="padding:12px 14px;${bd};font-size:14px;color:#374151;text-align:right">${Number(item.pricePerTon).toFixed(0)} ₽/т</td>
          <td style="padding:12px 14px;${bd};font-size:14px;color:#374151;text-align:right">${Number(item.totalGoodsPrice).toFixed(0)} ₽</td>
          <td style="padding:12px 14px;${bd};font-size:14px;color:#374151;text-align:right">${Number(item.totalCuttingCost) > 0 ? Number(item.totalCuttingCost).toFixed(0) + ' ₽' : '—'}</td>
          <td style="padding:12px 14px;${bd};font-size:14px;font-weight:600;color:#111;text-align:right">${(Number(item.totalGoodsPrice) + Number(item.totalCuttingCost)).toFixed(0)} ₽</td>
        </tr>
        ${billetRow}`;
      })
      .join('');

    const cuttingRow =
      totalCutting > 0
        ? `<tr><td colspan="5" style="padding:8px 14px;text-align:right;font-size:14px;color:#6b7280">Резка:</td>
           <td colspan="2" style="padding:8px 14px;text-align:right;font-size:14px;color:#374151;font-weight:500">${totalCutting.toFixed(0)} ₽</td></tr>`
        : '';

    const displayName = name && name.trim() ? name : 'Гость';

    const html = `<!DOCTYPE html>
<html lang="ru">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px">
    <tr><td align="center">
      <table width="680" cellpadding="0" cellspacing="0" style="max-width:680px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.07)">
        <tr>
          <td style="background:linear-gradient(135deg,#4e60ff 0%,#6b7bff 100%);padding:28px 32px">
            <h1 style="margin:0;color:#fff;font-size:22px;font-weight:700;letter-spacing:-0.3px">RoundCut</h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.8);font-size:14px">Ваш заказ</p>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 8px">
            <p style="margin:0;font-size:15px;color:#374151">Здравствуйте, <strong>${displayName}</strong>!</p>
            <p style="margin:8px 0 0;font-size:14px;color:#6b7280">Вы сохранили состав заказа на электронную почту.</p>
          </td>
        </tr>
        <tr>
          <td style="padding:16px 32px">
            <table width="100%" cellpadding="0" cellspacing="0" style="border-radius:10px;overflow:hidden;border:1px solid #e5e7eb">
              <thead>
                <tr style="background:#f9fafb">
                  <th style="padding:11px 14px;text-align:left;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb">Наименование</th>
                  <th style="padding:11px 14px;text-align:center;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb">Кол-во</th>
                  <th style="padding:11px 14px;text-align:center;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb">Вес</th>
                  <th style="padding:11px 14px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb">Цена/т</th>
                  <th style="padding:11px 14px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb">Металл</th>
                  <th style="padding:11px 14px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb">Резка</th>
                  <th style="padding:11px 14px;text-align:right;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;border-bottom:1px solid #e5e7eb">Итого</th>
                </tr>
              </thead>
              <tbody>${rows}</tbody>
              <tfoot>
                ${cuttingRow}
                <tr style="background:#f0f4ff">
                  <td colspan="5" style="padding:14px;text-align:right;font-size:15px;font-weight:600;color:#374151">Итого к оплате:</td>
                  <td colspan="2" style="padding:14px;text-align:right;font-size:18px;font-weight:700;color:#4e60ff">${totalAll.toFixed(0)} ₽</td>
                </tr>
              </tfoot>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 32px 28px;border-top:1px solid #f3f4f6">
            <p style="margin:0;font-size:13px;color:#9ca3af">Письмо сформировано автоматически системой RoundCut</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    await this.mailerService.sendEmail({
      recipients: [{ name: displayName, address: email }],
      subject: `Заказ RoundCut — ${new Date().toLocaleDateString('ru-RU')}`,
      html,
    });
    } catch (error) {
      console.error('[CART] Error in sendGuestOrder:', error);
      throw error;
    }
  }
}

