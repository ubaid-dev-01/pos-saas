/** Round to 2 decimals   avoids cash payment button stuck when display matches input */
export function roundMoney(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

export function parseMoneyInput(value) {
  const cleaned = String(value ?? "")
    .trim()
    .replace(/,/g, "");
  if (!cleaned || cleaned === ".") return 0;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function isCashPaymentSufficient(received, due) {
  return roundMoney(received) + 0.001 >= roundMoney(due);
}

export function computeSaleTotals(items, discount) {
  const bases = items.map((i) => {
    const line = Number(i.unitPrice) * Number(i.quantity);
    const id = Number(i.discount) || 0;
    return line * (1 - Math.min(id, 100) / 100);
  });
  const subtotal = bases.reduce((a, b) => a + b, 0);
  let cartDiscountAmount = 0;
  if (discount?.type === "percentage") {
    cartDiscountAmount = (subtotal * (Number(discount.value) || 0)) / 100;
  } else {
    cartDiscountAmount = Math.min(Number(discount.value) || 0, subtotal);
  }
  const sumB = subtotal || 1;
  const afterCart = Math.max(0, subtotal - cartDiscountAmount);
  const scale = afterCart / sumB;
  const newBases = bases.map((b) => b * scale);
  const taxTotal = items.reduce((acc, item, idx) => {
    const tr = Number(item.taxRate) || 0;
    return acc + newBases[idx] * (tr / 100);
  }, 0);
  const grandTotal = roundMoney(afterCart + taxTotal);
  return {
    subtotal: roundMoney(subtotal),
    cartDiscountAmount: roundMoney(cartDiscountAmount),
    taxTotal: roundMoney(taxTotal),
    grandTotal,
    afterCart: roundMoney(afterCart),
    bases,
    newBases,
  };
}
