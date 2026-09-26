export type MenuItemKind = 'DISH' | 'PRODUCT';

export class MenuItemDto {
  /** @example dish-12 */
  id: string;

  /** @example DISH */
  kind: MenuItemKind;

  /** @example 12 */
  entityId: number;

  /** @example Борщ */
  name: string;

  /** @example 3 */
  categoryId: number | null;

  /** @example 5000 */
  sellingPrice: number;

  /** @example 2800 */
  ownPrice: number;

  /** @example true */
  selling: boolean;

  /** @example 2024-08-14T00:00:00.000Z */
  updatedAt: string;
}
