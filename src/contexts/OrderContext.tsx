'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

/** A "Sifariş et" click carries the unit name and its category (for prefilling
 * the contact form's equipment-type dropdown). */
export type OrderSelection = { name: string; category: string | null };

type OrderContextValue = {
  selectedOrder: OrderSelection | null;
  setSelectedOrder: (order: OrderSelection | null) => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [selectedOrder, setSelectedOrder] = useState<OrderSelection | null>(null);

  return (
    <OrderContext.Provider value={{ selectedOrder, setSelectedOrder }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within OrderProvider');
  return ctx;
}
