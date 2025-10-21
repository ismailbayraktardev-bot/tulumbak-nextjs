'use client';

import React from 'react';
import Image from 'next/image';
import { formatTL } from '@/lib/format';

interface OrderSummaryProps {
  items?: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
    image: string;
  }>;
  subtotal?: number;
  shipping?: number;
  taxes?: number;
  total?: number;
  className?: string;
}

export function OrderSummary({ 
  items = [],
  subtotal = 44.98,
  shipping = 5.00,
  taxes = 3.60,
  total = 53.58,
  className = ''
}: OrderSummaryProps) {
  // Mock data if no items provided
  const mockItems = [
    {
      id: '1',
      name: 'Assorted Turkish Delight',
      quantity: 1,
      price: 24.99,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDr6y6A9-iMJFAxPEZkRKV-nMY2-ws5xPlqpsuygH_ITs0nqwjWnoMJukx-bxhM4jdtr9H5svA45gb8JXLOpW6Zr3TRoQIVm6YAo8dBxQDuhUG8LHYVPAtPG1Th_Q5vNz6BqvVjF8DKd8uAUWWN0axdbIpyPuyyPPlfH-Hlscnx-bpDwU9bmWvl3H5I9FFesC3J_IAfJFsLRUfpASBXwOGiPgUFUj3m39sekO91S5IjyGrtjvhMRE5gIbFiJ0_yRIETN0f7Dvq_MSY'
    },
    {
      id: '2',
      name: 'Pistachio Baklava',
      quantity: 1,
      price: 19.99,
      image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBQBQUilkCFNLUN6XztDhuB5GY0JxeD0VMicNqjP_5U8p6bPuem_QkEkvzFiSQyft4uD1Nmb8ABguyBMeu6Pod_xjHRWxcW2GzOKSZL4QtfdfekKcEo3h7i1LeLVEvSzQSkxh87oL4jUCefregOzhry94UsjcRciygGdAo56DsD-yJQDR0N94ztW-M7ZoGAkH83teFb1HfZAUS_g7SN0dIwFoJwhZ37p-SqRk0dM4Gm5rg-7JjJ2J_hWGh-0IIgDZFZ0FD-OHP_Fn4'
    }
  ];

  const displayItems = items.length > 0 ? items : mockItems;

  return (
    <div className={`bg-stitch-background-light rounded-xl border border-stitch-border-color shadow-sm p-6 flex flex-col gap-4 sticky top-28 ${className}`}>
      <h3 className="text-xl font-bold text-stitch-text-primary font-display">Sipariş Özeti</h3>
      
      {/* Product Items */}
      <div className="flex flex-col gap-4 border-b border-stitch-border-color pb-4">
        {displayItems.map((item) => (
          <div key={item.id} className="flex items-center gap-4">
            <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-stitch-border-color/20">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="(max-width: 80px) 100vw, 80px"
              />
            </div>
            
            <div className="flex-1">
              <p className="font-semibold text-stitch-text-primary font-display">
                {item.name}
              </p>
              <p className="text-sm text-stitch-text-secondary">
                {item.quantity} {item.quantity === 1 ? 'adet' : 'adet'}
              </p>
            </div>
            
            <p className="font-semibold text-stitch-text-primary font-display">
              {formatTL(item.price)}
            </p>
          </div>
        ))}
      </div>

      {/* Pricing Details */}
      <div className="flex flex-col gap-2 border-b border-stitch-border-color pb-4">
        <div className="flex justify-between">
          <p className="text-stitch-text-secondary">Ara Toplam</p>
          <p className="text-stitch-text-primary">{formatTL(subtotal)}</p>
        </div>
        
        <div className="flex justify-between">
          <p className="text-stitch-text-secondary">Kargo</p>
          <p className="text-stitch-text-primary">{formatTL(shipping)}</p>
        </div>
        
        <div className="flex justify-between">
          <p className="text-stitch-text-secondary">Vergiler</p>
          <p className="text-stitch-text-primary">{formatTL(taxes)}</p>
        </div>
      </div>

      {/* Total */}
      <div className="flex justify-between font-bold text-lg">
        <p className="text-stitch-text-primary font-display">Genel Toplam</p>
        <p className="text-stitch-text-primary font-display">{formatTL(total)}</p>
      </div>
    </div>
  );
}