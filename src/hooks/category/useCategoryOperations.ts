
import { useCategoryMutations } from './useCategoryMutations';
import type { Category } from '@/types/prompt';

interface UseCategoryOperationsProps {
  originalAddCategory: (name: string, parentId?: string) => Promise<boolean>;
  originalEditCategory: (id: string, newName: string, newParentId?: string) => Promise<boolean>;
  originalDeleteCategory: (id: string) => Promise<boolean>;
  loadCategories: () => Promise<void>;
}

export const useCategoryOperations = ({
  originalAddCategory,
  originalEditCategory,
  originalDeleteCategory,
  loadCategories
}: UseCategoryOperationsProps) => {
  const { addCategory: mutationAddCategory, editCategory: mutationEditCategory, deleteCategory: mutationDeleteCategory } = useCategoryMutations();

  const addCategory = async (name: string, parentId?: string): Promise<boolean> => {
    try {
      await mutationAddCategory(name, parentId);
      await loadCategories();
      return true;
    } catch (error) {
      return false;
    }
  };

  const editCategory = async (id: string, newName: string, newParentId?: string): Promise<boolean> => {
    try {
      await mutationEditCategory(id, newName, newParentId);
      await loadCategories();
      return true;
    } catch (error) {
      return false;
    }
  };

  const deleteCategory = async (id: string): Promise<boolean> => {
    try {
      await mutationDeleteCategory(id);
      await loadCategories();
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    addCategory,
    editCategory,
    deleteCategory
  };
};
