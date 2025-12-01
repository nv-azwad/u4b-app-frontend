// lib/voucherData.ts
// Edit this file to add/remove/update vouchers

export interface Voucher {
  id: number;
  brand: string;
  discount: string;
  points: number;
  color: string;
  code: string;
  expiryDate: string;
  terms: string[];
}

export const vouchers: Voucher[] = [
  {
    id: 1,
    brand: 'Starbucks',
    discount: '20% OFF',
    points: 50,
    color: '#00704A',
    code: 'STAR20U4B',
    expiryDate: '31 Dec 2024',
    terms: [
      'Valid for one-time use only',
      'Cannot be combined with other offers',
      'Valid at all participating stores',
      'No cash value',
    ],
  },
  {
    id: 2,
    brand: 'H&M',
    discount: '15% OFF',
    points: 40,
    color: '#E50010',
    code: 'HM15U4B',
    expiryDate: '31 Dec 2024',
    terms: [
      'Valid for one-time use only',
      'Cannot be combined with other offers',
      'Valid at all H&M stores in Malaysia',
      'No cash value',
    ],
  },
  {
    id: 3,
    brand: 'Nike',
    discount: '25% OFF',
    points: 60,
    color: '#000000',
    code: 'NIKE25U4B',
    expiryDate: '31 Dec 2024',
    terms: [
      'Valid for one-time use only',
      'Cannot be combined with other offers',
      'Valid at participating Nike stores',
      'Excludes sale items',
    ],
  },
  {
    id: 4,
    brand: 'Uniqlo',
    discount: '10% OFF',
    points: 30,
    color: '#FF0000',
    code: 'UNI10U4B',
    expiryDate: '31 Dec 2024',
    terms: [
      'Valid for one-time use only',
      'Cannot be combined with other offers',
      'Valid at all Uniqlo Malaysia stores',
      'No cash value',
    ],
  },
];

// Helper function to get voucher by ID
export function getVoucherById(id: number): Voucher | undefined {
  return vouchers.find(v => v.id === id);
}