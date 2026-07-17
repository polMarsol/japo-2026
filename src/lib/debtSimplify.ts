import type { Currency } from "./expensesSync";

export type SplitMethod = "equal" | "exact" | "percentage";

export interface Share {
  name: string;
  amount: number;
}

export interface ExpenseLike {
  amount: number;
  currency: Currency;
  payers: Share[];
  shares: Share[];
}

export interface SettlementLike {
  from_person: string;
  to_person: string;
  amount_eur: number;
}

export interface SimplifiedTransaction {
  from: string;
  to: string;
  amountEur: number;
}

const EPS = 0.01;

/** Balance neto por persona en EUR: positivo = el grupo le debe, negativo =
 * ella debe al grupo. Cada gasto suma lo que pago cada payer y resta lo que
 * le toca a cada participante segun su share; cada settlement (pago real
 * entre dos personas) ajusta el balance de ambas hacia cero. */
export function computeNetBalances(
  expenses: ExpenseLike[],
  settlements: SettlementLike[],
  rate: number,
): Record<string, number> {
  const balances: Record<string, number> = {};
  const add = (name: string, delta: number) => {
    balances[name] = (balances[name] ?? 0) + delta;
  };

  for (const e of expenses) {
    const eur = (n: number) => (e.currency === "JPY" ? n / rate : n);
    for (const p of e.payers) add(p.name, eur(p.amount));
    for (const s of e.shares) add(s.name, -eur(s.amount));
  }
  for (const s of settlements) {
    add(s.from_person, s.amount_eur);
    add(s.to_person, -s.amount_eur);
  }
  return balances;
}

/** Algoritmo greedy clasico de "simplificar deudas": empareja el mayor
 * deudor con el mayor acreedor repetidamente hasta saldar a todos, para
 * minimizar el numero de transacciones sugeridas. */
export function simplifyDebts(balances: Record<string, number>): SimplifiedTransaction[] {
  const creditors: Share[] = [];
  const debtors: Share[] = [];
  for (const [name, amount] of Object.entries(balances)) {
    if (amount > EPS) creditors.push({ name, amount });
    else if (amount < -EPS) debtors.push({ name, amount: -amount });
  }
  creditors.sort((a, b) => b.amount - a.amount);
  debtors.sort((a, b) => b.amount - a.amount);

  const result: SimplifiedTransaction[] = [];
  let i = 0;
  let j = 0;
  while (i < debtors.length && j < creditors.length) {
    const debtor = debtors[i];
    const creditor = creditors[j];
    const amount = Math.round(Math.min(debtor.amount, creditor.amount) * 100) / 100;
    if (amount > EPS) {
      result.push({ from: debtor.name, to: creditor.name, amountEur: amount });
    }
    debtor.amount -= amount;
    creditor.amount -= amount;
    if (debtor.amount <= EPS) i++;
    if (creditor.amount <= EPS) j++;
  }
  return result;
}

/** Reparte `amount` entre los participantes segun el metodo elegido.
 * - equal: a partes iguales, repartiendo el resto de centimos uno a uno.
 * - exact: `value` de cada participante es directamente su importe.
 * - percentage: `value` de cada participante es su porcentaje (0-100). */
export function computeShares(
  method: SplitMethod,
  amount: number,
  participants: { name: string; value: number }[],
): Share[] {
  const round2 = (n: number) => Math.round(n * 100) / 100;

  if (method === "exact") {
    return participants.map((p) => ({ name: p.name, amount: round2(p.value) }));
  }
  if (method === "percentage") {
    return participants.map((p) => ({ name: p.name, amount: round2((p.value / 100) * amount) }));
  }

  const n = participants.length;
  if (n === 0) return [];
  const baseCents = Math.floor((amount * 100) / n);
  const totalCents = Math.round(amount * 100);
  let remainderCents = totalCents - baseCents * n;
  return participants.map((p) => {
    const extra = remainderCents > 0 ? 1 : 0;
    if (remainderCents !== 0) remainderCents -= extra;
    return { name: p.name, amount: (baseCents + extra) / 100 };
  });
}
