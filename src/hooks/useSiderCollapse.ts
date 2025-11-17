import type { CollapseType, InitialState } from '@/app';
import { useModel } from '@umijs/max';
import { useCallback } from 'react';

type CollapseHookResult = {
  collapsed: boolean;
  collapseType?: CollapseType;
  setCollapsed: (next: boolean, type?: CollapseType) => void;
};

export const useSiderCollapse = (): CollapseHookResult => {
  const { initialState, setInitialState } = useModel('@@initialState');

  const collapsed = initialState?.collapsed ?? false;
  const collapseType = initialState?.collapseType;

  const setCollapsed = useCallback(
    (next: boolean, type?: CollapseType) => {
      setInitialState?.((prev?: InitialState) => ({
        ...prev,
        collapsed: next,
        collapseType: type,
      }));
    },
    [setInitialState],
  );

  return { collapsed, collapseType, setCollapsed };
};
