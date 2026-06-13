export function profitPerUnit(price: number, cost: number) { return price - cost }
export function marginPct(price: number, cost: number) { return price > 0 ? ((price - cost) / price) * 100 : 0 }
export function saleRevenue(qty: number, price: number) { return qty * price }
export function saleProfit(qty: number, price: number, cost: number) { return qty * (price - cost) }
export function ownershipPct(investment: number, totalInvestment: number) { return totalInvestment > 0 ? (investment / totalInvestment) * 100 : 0 }
export function partnerEarnings(totalProfit: number, pct: number) { return totalProfit * (pct / 100) }
export function reinvestAmount(totalProfit: number, sliderPct: number) { return totalProfit * sliderPct / 100 }
export function withdrawAmount(totalProfit: number, sliderPct: number) { return totalProfit - reinvestAmount(totalProfit, sliderPct) }
export function unitsPossible(reinvest: number, avgCost: number) { return avgCost > 0 ? Math.floor(reinvest / avgCost) : 0 }
export function fmtCOP(n: number) { return '$' + Math.round(n).toLocaleString('es-CO') }
