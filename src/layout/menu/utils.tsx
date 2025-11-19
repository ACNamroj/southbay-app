import {
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuDataItem } from '@ant-design/pro-components';
import React from 'react';

const MENU_ICON_MAP: Record<string, React.ComponentType> = {
  stores: ShopOutlined,
  people: TeamOutlined,
  users: UserOutlined,
  segmentation: SettingOutlined,
};

export const normalizeMenuItems = (
  menuItems: MenuDataItem[] = [],
): MenuDataItem[] =>
  menuItems.map((item) => {
    const patchedChildren = item.children
      ? normalizeMenuItems(item.children)
      : undefined;
    const iconKey =
      typeof item.icon === 'string' ? MENU_ICON_MAP[item.icon] : undefined;

    return {
      ...item,
      disabledTooltip: true,
      icon: iconKey ? React.createElement(iconKey) : item.icon,
      children: patchedChildren,
    };
  });
