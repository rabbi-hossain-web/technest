import { ProductForm } from '@/components/admin/product-form';
import { getCategories } from '@/lib/queries';

export const metadata = { title: 'New product' };

export default async function NewProductPage() {
  const categories = await getCategories();
  return <ProductForm categories={categories} />;
}
