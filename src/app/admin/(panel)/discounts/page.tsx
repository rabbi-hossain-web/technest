import { CouponManager } from '@/components/admin/coupon-manager';
import { PageHeader } from '@/components/admin/page-header';
import { getCoupons } from '@/lib/queries';

export const metadata = { title: 'Discounts' };

export default async function DiscountsPage() {
  const coupons = await getCoupons();
  return (
    <>
      <PageHeader title="Discounts" description="Coupon codes customers can apply in the cart and at checkout. Sale prices are set per product (compare-at price)." />
      <CouponManager coupons={coupons} />
    </>
  );
}
