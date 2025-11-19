// Runtime configuration

// Global initial data configuration, used for initializing user info and permissions in the Layout
// For more information, see the documentation: https://umijs.org/docs/api/runtime-config#getinitialstate
import Logo from '@/layout/components/Logo';
import UserMenuFooter from '@/layout/components/UserMenuFooter';
import { normalizeMenuItems } from '@/layout/menu/utils';
import { createRequestConfig } from '@/layout/request/interceptors';
import {
  persistSidebarCollapsed,
  readSidebarCollapsed,
} from '@/utils/sidebarStorage';
import { Link, type RequestConfig, type RunTimeLayoutConfig } from '@umijs/max';
import React from 'react';

export type CollapseType = 'clickTrigger' | 'responsive';

export type InitialState = {
  name: string;
  collapsed?: boolean;
  collapseType?: CollapseType;
};

export async function getInitialState(): Promise<InitialState> {
  const storedCollapsed = readSidebarCollapsed();
  return { name: '', collapsed: storedCollapsed ?? false };
}

const resolveLogoVariant = (logoDom: React.ReactNode): 'header' | 'sider' => {
  if (
    React.isValidElement(logoDom) &&
    (logoDom.props?.className ?? '').includes('ant-pro-global-header-logo')
  ) {
    return 'header';
  }
  return 'sider';
};

const wrapLogo = (
  logoDom: React.ReactNode,
  content: React.ReactNode,
): React.ReactNode => {
  if (React.isValidElement(logoDom)) {
    const { className, style } = logoDom.props ?? {};
    return (
      <div className={className} style={style}>
        {content}
      </div>
    );
  }
  return content;
};

export const layout: RunTimeLayoutConfig<InitialState> = ({
  initialState,
  setInitialState,
}) => ({
  title: false,
  menuHeaderRender: (
    logoDom: React.ReactNode,
    _title: React.ReactNode,
    props: any,
  ) => {
    const variant = resolveLogoVariant(logoDom);
    const logoNode = (
      <Logo
        collapsed={props?.collapsed ?? initialState?.collapsed}
        variant={variant}
      />
    );

    return wrapLogo(logoDom, logoNode);
  },
  onCollapse: (collapsed: boolean, type?: CollapseType) => {
    setInitialState?.((s: object) => ({
      ...s,
      collapsed,
      collapseType: type,
    }));
    persistSidebarCollapsed(collapsed);
  },
  menuDataRender: normalizeMenuItems,
  menuItemRender: (itemProps, defaultDom, menuProps) => {
    let content = defaultDom;
    if (
      !menuProps?.isMobile &&
      menuProps?.collapsed &&
      React.isValidElement(defaultDom)
    ) {
      const nextClassName = [defaultDom.props?.className, 'menu-item-icon-only']
        .filter(Boolean)
        .join(' ');
      content = React.cloneElement(defaultDom, { className: nextClassName });
    }

    const handleMenuClick = (
      event?: React.MouseEvent<
        HTMLDivElement | HTMLAnchorElement | HTMLSpanElement
      >,
    ) => {
      if (React.isValidElement(content)) {
        content.props?.onClick?.(event);
      }
      if (menuProps?.isMobile) {
        itemProps?.onClick?.();
      }
    };

    if (itemProps?.isUrl && itemProps?.itemPath) {
      return (
        <a
          href={itemProps.itemPath}
          target="_blank"
          rel="noreferrer"
          onClick={handleMenuClick}
        >
          {content}
        </a>
      );
    }

    if (itemProps?.itemPath) {
      return (
        <Link
          to={itemProps.itemPath}
          replace={itemProps?.replace}
          onClick={handleMenuClick}
        >
          {content}
        </Link>
      );
    }

    if (React.isValidElement(content)) {
      return React.cloneElement(content, {
        onClick: handleMenuClick,
      });
    }

    return content;
  },
  menuFooterRender: () => <UserMenuFooter />,
});

export const request: RequestConfig = createRequestConfig();
