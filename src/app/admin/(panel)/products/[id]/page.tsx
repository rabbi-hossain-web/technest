import { notFound } from 'next/navigation';
import { ProductForm } from '@/components/admin/product-form';
import { ProductDeleteButton } from '@/components/admin/product-row-actions';
import { getAdminProduct, getCategories } from '@/lib/queries';

export const metadata = { title: 'Edit product' };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [product, categories] = await Promise.all([getAdminProduct(id), getCategories()]);
  if (!product) notFound();
  return (
    <>
      <ProductForm product={product} categories={categories} />
      <div className="flex justify-end">
        <ProductDeleteButton id={product._id} name={product.name} redirectTo="/admin/products" iconOnly={false} />
      </div>
    </>
  );
}
