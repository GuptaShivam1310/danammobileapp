import type { Item } from '../../services/api/postApi';

export interface Product extends Item {
  type?: 'item' | 'banner' | 'spacer';
}
