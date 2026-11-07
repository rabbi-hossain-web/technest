import { CategoryManager } from '@/components/admin/category-manager';
import { PageHeader } from '@/components/admin/page-header';
import { connectDB } from '@/lib/db';
import { getCategories } from '@/lib/queries';
import { Product } from '@/models';

export const metadata = { title: 'Categories' };

export default async function CategoriesPage() {
  const categories = await getCategories();
  await connectDB();
  const rows = await Product.aggregate<{ _id: unknown; n: number }>([{ $group: { _id: '$category', n: { $sum: 1 } } }]);
  const counts = Object.fromEntries(rows.map((r) => [String(r._id), r.n]));
  return (
    <>
      <PageHeader title="Categories" description="Organize products and the “Shop by Category” section on the homepage." />
      <CategoryManager categories={categories} counts={counts} />
    </>
  );
}
