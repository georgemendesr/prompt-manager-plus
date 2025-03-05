
// This file serves as an aggregator of all category service functionality
// to maintain backward compatibility with existing code

export { 
  fetchCategories,
  addCategoryToDb,
  updateCategoryInDb,
  getAllSubcategoriesIds
} from './category/categoryFetchService';

export {
  deleteCategoryFromDb,
  forceDeleteCategoryById
} from './category/categoryDeleteService';

export {
  fetchPrompts,
  getPromptsInCategories,
  deletePromptsInCategories,
  deletePromptFromDb,
  updatePromptInDb
} from './prompt/promptService';

export {
  fetchComments
} from './comment/commentService';
