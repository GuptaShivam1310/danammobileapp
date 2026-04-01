import reducer, {
  clearSelectedCategory,
  setSelectedCategory,
} from '../../src/store/slices/homeFilterSlice';

describe('homeFilterSlice', () => {
  it('sets and clears selected category', () => {
    const category = { id: '1', name: 'Cat', item_count: 0 };

    const withCategory = reducer(undefined, setSelectedCategory(category as any));
    expect(withCategory.selectedCategory).toEqual(category);

    const cleared = reducer(withCategory, clearSelectedCategory());
    expect(cleared.selectedCategory).toBeNull();
  });
});
