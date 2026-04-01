import reducer, {
  addRecentSearch,
  clearRecentSearches,
} from '../../src/store/slices/searchSlice';

describe('searchSlice', () => {
  it('adds recent searches and deduplicates', () => {
    let state = reducer(undefined, addRecentSearch('Shoes'));
    state = reducer(state, addRecentSearch('Shoes'));
    state = reducer(state, addRecentSearch('  '));
    state = reducer(state, addRecentSearch('Bags'));

    expect(state.recentSearches).toEqual(['Bags', 'Shoes']);
  });

  it('limits recent searches to max and clears', () => {
    let state = reducer(undefined, addRecentSearch('1'));
    state = reducer(state, addRecentSearch('2'));
    state = reducer(state, addRecentSearch('3'));
    state = reducer(state, addRecentSearch('4'));
    state = reducer(state, addRecentSearch('5'));
    state = reducer(state, addRecentSearch('6'));

    expect(state.recentSearches.length).toBe(5);

    state = reducer(state, clearRecentSearches());
    expect(state.recentSearches).toEqual([]);
  });
});
