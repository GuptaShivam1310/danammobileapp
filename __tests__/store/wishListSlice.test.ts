import reducer, {
  addToWishList,
  clearWishList,
  removeFromWishList,
  selectWishList,
  selectWishListIds,
  toggleWishListItem,
} from '../../src/store/slices/wishListSlice';

describe('wishListSlice', () => {
  const item = { id: '1', title: 'Item', date: '2024-01-01' };

  it('adds and removes items', () => {
    let state = reducer(undefined, addToWishList(item));
    expect(state.wishList).toEqual([item]);

    state = reducer(state, removeFromWishList('1'));
    expect(state.wishList).toEqual([]);
  });

  it('toggles items', () => {
    let state = reducer(undefined, toggleWishListItem(item));
    expect(state.wishList).toEqual([item]);

    state = reducer(state, toggleWishListItem('1'));
    expect(state.wishList).toEqual([]);
  });

  it('does not duplicate on addToWishList and ignores toggle with unknown id', () => {
    let state = reducer(undefined, addToWishList(item));
    state = reducer(state, addToWishList(item));
    expect(state.wishList).toEqual([item]);

    const unchanged = reducer(state, toggleWishListItem('unknown'));
    expect(unchanged.wishList).toEqual([item]);
  });

  it('clears list and selectors work', () => {
    const state = reducer(undefined, addToWishList(item));
    const rootState = { wishList: state } as any;

    expect(selectWishList(rootState)).toEqual([item]);
    expect(selectWishListIds(rootState)).toEqual(['1']);

    const cleared = reducer(state, clearWishList());
    expect(cleared.wishList).toEqual([]);
  });
});
