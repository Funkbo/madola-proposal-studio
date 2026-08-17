export interface ProductPriceItem {
  id: string;
  name: string;
  price: number;
  category?: string;
  included: boolean;
}

export interface PricingCalculationResult {
  baseSystemPrice: number;
  evChargerPrice: number;
  optionalProductsPrice: number;
  additionalProductsPrice: number;
  subtotal: number;
  vatRatePercent: number;
  vatAmount: number;
  finalTotal: number;
}

/**
 * Currency-safe dynamic pricing engine for Madola Energy interactive proposals.
 */
export function calculateProposalPricing(params: {
  baseSystemPrice: number;
  products: ProductPriceItem[];
  vatRatePercent?: number;
}): PricingCalculationResult {
  const basePrice = Math.max(0, Math.round(params.baseSystemPrice * 100) / 100);
  const vatRate = params.vatRatePercent !== undefined ? params.vatRatePercent : 0;

  let evChargerPrice = 0;
  let optionalProductsPrice = 0;
  let additionalProductsPrice = 0;

  params.products.forEach((p) => {
    if (!p.included) return;

    const itemTotal = Math.max(0, Math.round(p.price * 100) / 100);

    if (p.category === "ev") {
      evChargerPrice += itemTotal;
    } else if (p.category === "optional") {
      optionalProductsPrice += itemTotal;
    } else if (p.category === "additional" || p.category === "ancillary") {
      additionalProductsPrice += itemTotal;
    }
  });

  const subtotal = Math.round((basePrice + evChargerPrice + optionalProductsPrice + additionalProductsPrice) * 100) / 100;
  const vatAmount = Math.round((subtotal * (vatRate / 100)) * 100) / 100;
  const finalTotal = Math.round((subtotal + vatAmount) * 100) / 100;

  return {
    baseSystemPrice: basePrice,
    evChargerPrice,
    optionalProductsPrice,
    additionalProductsPrice,
    subtotal,
    vatRatePercent: vatRate,
    vatAmount,
    finalTotal,
  };
}
