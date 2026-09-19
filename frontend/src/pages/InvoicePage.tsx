import { FC, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useGetOrdersQuery } from "../services/ordersApi";
import { TOrderItem } from "../utils/types";
import { CUT_CODE_LABELS } from "../utils/constants";
import "./InvoicePage.scss";

// ─── Константы продавца ──────────────────────────────────────────────────────
const SELLER = {
  name: 'АО "Металлоторг"',
  inn: "7118018781",
  kpp: "997350001",
  address:
    "150023, РФ, Ярославская область, г. Ярославль, ул. Гагарина д.75",
  phone: "(495) 727-07-04",
  email: "kulish@metallotorg.ru",
  bank: 'ПАО "СБЕРБАНК"',
  account: "40702810640260032945",
  corrAccount: "30101810400000000225",
  bik: "044525225",
};

const VAT_RATE = 0.22;

// ─── Число прописью (русский) ─────────────────────────────────────────────────
const ONES_M = ["", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
const ONES_F = ["", "одна", "две", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"];
const TEENS  = ["десять", "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"];
const TENS   = ["", "", "двадцать", "тридцать", "сорок", "пятьдесят", "шестьдесят", "семьдесят", "восемьдесят", "девяносто"];
const HUNDS  = ["", "сто", "двести", "триста", "четыреста", "пятьсот", "шестьсот", "семьсот", "восемьсот", "девятьсот"];

function chunk3(n: number, feminine: boolean): string {
  const h = Math.floor(n / 100);
  const rem = n % 100;
  const t = Math.floor(rem / 10);
  const o = rem % 10;
  const parts: string[] = [];
  if (h) parts.push(HUNDS[h]);
  if (t === 1) {
    parts.push(TEENS[o]);
  } else {
    if (t) parts.push(TENS[t]);
    if (o) parts.push(feminine ? ONES_F[o] : ONES_M[o]);
  }
  return parts.join(" ");
}

function plural(n: number, one: string, few: string, many: string): string {
  const abs = Math.abs(n) % 100;
  const unit = abs % 10;
  if (abs > 10 && abs < 20) return many;
  if (unit === 1) return one;
  if (unit >= 2 && unit <= 4) return few;
  return many;
}

function numberToWords(amount: number): string {
  const rubles = Math.floor(amount);
  const kopecks = Math.round((amount - rubles) * 100);
  const parts: string[] = [];

  const mil  = Math.floor(rubles / 1_000_000);
  const thou = Math.floor((rubles % 1_000_000) / 1000);
  const rem  = rubles % 1000;

  if (mil > 0) {
    const w = chunk3(mil, false);
    if (w) parts.push(w);
    parts.push(plural(mil, "миллион", "миллиона", "миллионов"));
  }
  if (thou > 0) {
    const w = chunk3(thou, true);
    if (w) parts.push(w);
    parts.push(plural(thou, "тысяча", "тысячи", "тысяч"));
  }
  if (rem > 0) {
    const w = chunk3(rem, false);
    if (w) parts.push(w);
  } else if (rubles === 0) {
    parts.push("ноль");
  }

  parts.push(plural(rubles, "рубль", "рубля", "рублей"));
  parts.push(kopecks.toString().padStart(2, "0"));
  parts.push(plural(kopecks, "копейка", "копейки", "копеек"));

  return parts.join(" ").toUpperCase();
}

// ─── Форматирование ───────────────────────────────────────────────────────────
function fmt2(n: number): string {
  return n.toLocaleString("ru-RU", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function fmt3(n: number): string {
  return n.toLocaleString("ru-RU", {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  });
}

function noVat(total: number): number {
  return total / (1 + VAT_RATE);
}

function vatAmt(total: number): number {
  return total - noVat(total);
}

function formatInvoiceDate(iso: string): string {
  return new Date(iso).toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function localizeDesc(desc: string): string {
  return Object.entries(CUT_CODE_LABELS).reduce(
    (str, [code, label]) => str.replace(new RegExp(code, "gi"), label),
    desc,
  );
}

// ─── Строка таблицы счёта ─────────────────────────────────────────────────────
interface InvoiceRow {
  name: string;
  qty: string;
  unit: string;
  priceWithVat: number; // Цена с НДС (Variant 1)
  priceNoVat: number;  // Цена без НДС (Variant 2)
  sumNoVat: number;
  vatPct: string;
  vatSum: number;
  total: number;
  pieces: string;
}

function buildRows(items: TOrderItem[]): InvoiceRow[] {
  const rows: InvoiceRow[] = [];

  items.forEach((item) => {
    const weight     = Number(item.weightTons);
    const goodsTotal = Number(item.totalGoodsPrice);
    const cutTotal   = Number(item.totalCuttingCost);

    // Кол-во штук
    let pieces = "";
    if (item.billetData) {
      const bd = item.billetData;
      pieces = String(bd.numCompleteCircles + (bd.partWeight > 0 ? 1 : 0));
    } else {
      pieces = String(item.quantity);
    }

    // Строка металла
    let goodsName = `${item.name} ${item.size}`.trim();
    if (item.surface) goodsName += ` ${item.surface}`;
    if (item.other)   goodsName += ` ${item.other}`;
    if (item.billetData) {
      const bd = item.billetData;
      const wpStr = bd.workpieces
        .map((w) => `${w.length} мм × ${w.quantity} шт`)
        .join(", ");
      goodsName += ` | заготовки: ${wpStr}`;
    }

    rows.push({
      name:         goodsName,
      qty:          fmt3(weight),
      unit:         "тн",
      priceWithVat: weight > 0 ? goodsTotal / weight : 0,
      priceNoVat:   weight > 0 ? noVat(goodsTotal) / weight : 0,
      sumNoVat:     noVat(goodsTotal),
      vatPct:       "22%",
      vatSum:       vatAmt(goodsTotal),
      total:        goodsTotal,
      pieces,
    });

    // Строка резки (если есть)
    if (cutTotal > 0) {
      let cutName = "Резка";
      if (item.billetData) {
        const bd = item.billetData;
        cutName = `Резка заготовок: ${bd.totalCuts} рез${bd.totalCuts === 1 ? "" : bd.totalCuts < 5 ? "а" : "ов"}, толщина реза ${bd.cutThickness} мм`;
      } else if (item.cuttingDescription) {
        cutName = `Резка: ${localizeDesc(item.cuttingDescription)}`;
      }

      rows.push({
        name:         cutName,
        qty:          "1",
        unit:         "усл",
        priceWithVat: cutTotal,
        priceNoVat:   noVat(cutTotal),
        sumNoVat:     noVat(cutTotal),
        vatPct:       "22%",
        vatSum:       vatAmt(cutTotal),
        total:        cutTotal,
        pieces:       "",
      });
    }
  });

  return rows;
}

// ─── Компонент ────────────────────────────────────────────────────────────────
const InvoicePage: FC = () => {
  const { id }      = useParams<{ id: string }>();
  const navigate    = useNavigate();
  const { data: orders, isLoading } = useGetOrdersQuery();
  const order = orders?.find((o) => o.id === Number(id));
  const [withVat, setWithVat] = useState(true);

  useEffect(() => {
    if (order) document.title = `Счёт №${order.id}`;
    return () => { document.title = "RoundCut"; };
  }, [order]);

  if (isLoading) {
    return <div className="inv__loading">Загрузка...</div>;
  }
  if (!order) {
    return (
      <div className="inv__error">
        Заказ не найден.{" "}
        <button onClick={() => navigate("/orders")}>← Назад к заказам</button>
      </div>
    );
  }

  const rows        = buildRows(order.items);
  const totalWeight = order.items.reduce((s, i) => s + Number(i.weightTons), 0);
  const totalAll    = Number(order.totalAll);
  const totalNoVat  = noVat(totalAll);
  const totalVat    = vatAmt(totalAll);

  return (
    <div className="inv">
      {/* Кнопки действий — не печатаются */}
      <div className="inv__actions no-print">
        <button
          className="inv__btn inv__btn--back"
          onClick={() => navigate("/orders")}
        >
          ← Назад к заказам
        </button>

        {/* Тоггл НДС */}
        <div className="inv__vat-toggle">
          <button
            className={`inv__vat-btn${withVat ? " inv__vat-btn--active" : ""}`}
            onClick={() => setWithVat(true)}
          >
            С НДС (22%)
          </button>
          <button
            className={`inv__vat-btn${!withVat ? " inv__vat-btn--active" : ""}`}
            onClick={() => setWithVat(false)}
          >
            Без НДС
          </button>
        </div>

        <button
          className="inv__btn inv__btn--print"
          onClick={() => window.print()}
        >
          🖨 Печать / Сохранить PDF
        </button>
      </div>

      {/* ══════════════════════ ДОКУМЕНТ ══════════════════════ */}
      <div className="inv__doc">

        {/* Шапка */}
        <div className="inv__header">
          <div className="inv__company-name">
            {SELLER.name}&emsp;ИНН:&nbsp;{SELLER.inn}&emsp;КПП&nbsp;{SELLER.kpp}
          </div>
          <div className="inv__company-contacts">
            Тел/Факс:&nbsp;{SELLER.phone}&emsp;&emsp;E-mail:&nbsp;{SELLER.email}
          </div>
        </div>

        {/* Название счёта */}
        <div className="inv__title">
          Счёт №{order.id} от {formatInvoiceDate(order.createdAt)}
        </div>

        {/* Поставщик и плательщик */}
        <table className="inv__parties">
          <tbody>
            <tr>
              <td className="inv__party-label">Поставщик:</td>
              <td className="inv__party-value">
                {SELLER.name}, ИНН&nbsp;{SELLER.inn}, КПП&nbsp;{SELLER.kpp},{" "}
                {SELLER.address}. Р/с&nbsp;{SELLER.account} в&nbsp;{SELLER.bank},
                к/с&nbsp;{SELLER.corrAccount}, БИК&nbsp;{SELLER.bik}
              </td>
            </tr>
            <tr>
              <td className="inv__party-label">Плательщик:</td>
              <td className="inv__party-value">&nbsp;</td>
            </tr>
          </tbody>
        </table>

        {/* Таблица позиций */}
        <table className="inv__table">
          <thead>
            {withVat ? (
              <>
                <tr className="inv__thead-labels">
                  <th>№</th>
                  <th>Товар</th>
                  <th>Кол-во</th>
                  <th>Ед.изм</th>
                  <th>Цена с НДС</th>
                  <th>НДС</th>
                  <th>Сумма<br/>НДС</th>
                  <th>Всего<br/>с НДС</th>
                  <th>~Шт</th>
                </tr>
                <tr className="inv__thead-nums">
                  {["1","2","3","4","5","6","7","8","9"].map((n) => <th key={n}>{n}</th>)}
                </tr>
              </>
            ) : (
              <>
                <tr className="inv__thead-labels">
                  <th>№</th>
                  <th>Наименование товара</th>
                  <th>Кол-во</th>
                  <th>Ед.изм</th>
                  <th>Цена без НДС</th>
                  <th>Сумма без НДС</th>
                  <th>НДС</th>
                  <th>Сумма<br/>НДС</th>
                  <th>Всего<br/>с НДС</th>
                  <th>~Шт</th>
                </tr>
                <tr className="inv__thead-nums">
                  {["1","2","3","4","5","6","7","8","9","10"].map((n) => <th key={n}>{n}</th>)}
                </tr>
              </>
            )}
          </thead>
          <tbody>
            {rows.map((row, i) =>
              withVat ? (
                <tr key={i}>
                  <td className="inv__td-num">{i + 1}</td>
                  <td className="inv__td-name">{row.name}</td>
                  <td className="inv__td-num">{row.qty}</td>
                  <td className="inv__td-num">{row.unit}</td>
                  <td className="inv__td-num">{fmt2(row.priceWithVat)}</td>
                  <td className="inv__td-num">{row.vatPct}</td>
                  <td className="inv__td-num">{fmt2(row.vatSum)}</td>
                  <td className="inv__td-num">{fmt2(row.total)}</td>
                  <td className="inv__td-num">{row.pieces}</td>
                </tr>
              ) : (
                <tr key={i}>
                  <td className="inv__td-num">{i + 1}</td>
                  <td className="inv__td-name">{row.name}</td>
                  <td className="inv__td-num">{row.qty}</td>
                  <td className="inv__td-num">{row.unit}</td>
                  <td className="inv__td-num">{fmt2(row.priceNoVat)}</td>
                  <td className="inv__td-num">{fmt2(row.sumNoVat)}</td>
                  <td className="inv__td-num">{row.vatPct}</td>
                  <td className="inv__td-num">{fmt2(row.vatSum)}</td>
                  <td className="inv__td-num">{fmt2(row.total)}</td>
                  <td className="inv__td-num">{row.pieces}</td>
                </tr>
              )
            )}
          </tbody>
          <tfoot>
            {withVat ? (
              <tr className="inv__tfoot-row">
                <td colSpan={2} className="inv__tfoot-label">ИТОГО</td>
                <td className="inv__td-num">{fmt3(totalWeight)}</td>
                <td></td>
                <td></td>
                <td></td>
                <td className="inv__td-num">{fmt2(totalVat)}</td>
                <td className="inv__td-num">{fmt2(totalAll)}</td>
                <td></td>
              </tr>
            ) : (
              <tr className="inv__tfoot-row">
                <td colSpan={2} className="inv__tfoot-label">ИТОГО</td>
                <td className="inv__td-num">{fmt3(totalWeight)}</td>
                <td></td>
                <td></td>
                <td className="inv__td-num">{fmt2(totalNoVat)}</td>
                <td></td>
                <td className="inv__td-num">{fmt2(totalVat)}</td>
                <td className="inv__td-num">{fmt2(totalAll)}</td>
                <td></td>
              </tr>
            )}
          </tfoot>
        </table>

        {/* Итого */}
        <div className="inv__summary">
          <p>
            <strong>
              Итого к оплате: {fmt2(totalAll)} руб.&emsp;В том числе НДС:&nbsp;{fmt2(totalVat)}&nbsp;руб.
            </strong>
          </p>
          <p>
            <strong>Всего на: {numberToWords(totalAll)}</strong>
          </p>
        </div>

        {/* Условия */}
        <div className="inv__conditions">
          <p>1. Счёт действителен для оплаты в день выписки и на следующие за ним один рабочий день. По истечении вышеуказанного срока цена на товар может измениться.</p>
          <p>2. ЧАСТИЧНОЙ ОПЛАТЕ НЕ ПОДЛЕЖИТ.&nbsp; Об оплате сообщить по тел. {SELLER.phone}</p>
          <p>3. В случае оплаты настоящего счета в целях исполнения (соисполнения) государственного контракта Покупатель обязуется указать&nbsp; идентификатор государственного контракта в&nbsp;назначении платежа платёжного поручения</p>
          <p>4. Датой оплаты считается день поступления денежных средств на расчётный счёт Поставщика.</p>
          <p>5. Товар должен быть вывезен со склада в течении 10 рабочих дней после поступления оплаты. В противном случае Поставщик не&nbsp;может гарантировать поставку товара на указанных в счете условиях.</p>
          <p>6. В случае оплаты Покупателем транспортных услуг доставка товара автотранспортом производится в течении 10 дней с момента поступления оплаты&nbsp;и предоставления Покупателем транспортных реквизитов. Время выгрузки товара у Покупателя НЕ БОЛЕЕ 3-х часов.<br />
          За превышение нормы времени на разгрузку автомобильного транспортного средства Покупатель уплачивает штраф в размере 1&nbsp;000 (Одна тысяча) рублей за каждый час сверхнормативного простоя</p>
          <p>7. При оформлении п/п в графе НАЗНАЧЕНИЕ ПЛАТЕЖА обязательна ссылка на номер счёта.</p>
          <p>8. <strong>Отпуск металла производится только при наличии ДОВЕРЕННОСТИ от покупателя и ПАСПОРТА доверенного лица. Согласуйте с Вашим менеджером дату и время отгрузки.</strong></p>
          <p>9. Покупатель подтверждает, что его представитель, имеющий в своём распоряжении круглую печать Покупателя уполномочен Покупателем на получение продукции и подписание первичных документов.</p>
          <p>10. Порезанный металлопрокат возврату не подлежит.</p>
          <p>11. При отгрузке фасонного проката допускается 5&nbsp;% немерной длины&nbsp;.</p>
          <p className="inv__conditions-underline">12. Отгрузка металла осуществляется только на машины с открытым верхом</p>
          <p className="inv__conditions-underline">13. В случае указания в счете&nbsp;на поставку продукции по теоретической массе&nbsp;(ТМ) приемка поставленной продукции по количеству осуществляется Покупателем по теоретической массе (ТМ) в соответствии с сертификатом качества изготовителя без использования средств измерения (весов)</p>
          <p className="inv__conditions-underline">14. В случае оплаты доставки в период действия&nbsp;временного ограничения или прекращения движения, в т.ч. в весенний период, Покупатель принимает на себя все риски, связанные с возможной&nbsp;задержкой поставки. Покупатель обязуется&nbsp;содержать погрузочно-разгрузочные площадки, а также подъездные пути к ним в исправном состоянии в любое время года для обеспечения беспрепятственного проезда и маневрирования транспортных средств.</p>
        </div>

        {/* Подписи */}
        <div className="inv__signatures">
          <div className="inv__sig">
            <span className="inv__sig-role">Генеральный директор</span>
            <span className="inv__sig-line">________________________</span>
            <span className="inv__sig-name">/ Кадников М.В. /</span>
          </div>
          <div className="inv__sig">
            <span className="inv__sig-role">Бухгалтер</span>
            <span className="inv__sig-line">________________________</span>
            <span className="inv__sig-name">/ Андреева Г.Ю. /</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InvoicePage;
