'use client';

import { createContext, useContext, useState, type ReactNode } from 'react';

type OrderContextValue = {
  selectedEquipment: string | null;
  setSelectedEquipment: (name: string | null) => void;
};

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const [selectedEquipment, setSelectedEquipment] = useState<string | null>(null);

  return (
    <OrderContext.Provider value={{ selectedEquipment, setSelectedEquipment }}>
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder() {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error('useOrder must be used within OrderProvider');
  return ctx;
}
