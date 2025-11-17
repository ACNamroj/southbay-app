// Runtime configuration

// Global initial data configuration, used for initializing user info and permissions in the Layout
// For more information, see the documentation: https://umijs.org/docs/api/runtime-config#getinitialstate
import { LOGO_COMPACT, LOGO_ICON } from '@/assets';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import React from 'react';

type InitialState = {
  name: string;
  collapsed?: boolean;
  collapseType?: 'clickTrigger' | 'responsive';
};

export async function getInitialState(): Promise<InitialState> {
  return { name: 'Jorman', collapsed: false };
}

type LogoProps = {
  collapsed?: boolean;
};

const Logo: React.FC<LogoProps> = ({ collapsed }) => {
  const screens = useBreakpoint();
  const isMobile = !screens.md;

  const getLogo = () => {
    if (isMobile) {
      return LOGO_COMPACT;
    }
    return collapsed ? LOGO_ICON : LOGO_COMPACT;
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: isMobile ? 8 : 15,
        padding: isMobile ? '8px 0' : 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img
          src={getLogo()}
          alt="Southbay"
          style={{
            height: isMobile ? 40 : 50,
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
      {!isMobile && !collapsed && (
        <div
          style={{
            fontSize: 16,
            color: '#000',
            fontWeight: 'bold',
            textAlign: 'center',
            lineHeight: 1.2,
          }}
        >
          Descuento de Empleados
        </div>
      )}
    </div>
  );
};

export const layout: ({
  initialState,
  setInitialState,
}: {
  initialState: unknown;
  setInitialState: unknown;
}) => {
  title: boolean;
  menuHeaderRender: (
    _logoDom: React.ReactNode,
    _title: React.ReactNode,
    props: unknown,
  ) => React.JSX.Element;
  onCollapse: (
    collapsed: boolean,
    type?: 'clickTrigger' | 'responsive',
  ) => void;
} = ({ initialState, setInitialState }) => ({
  title: false,
  // Use a custom header to react to collapse state and responsive behavior
  menuHeaderRender: (
    _logoDom: React.ReactNode,
    _title: React.ReactNode,
    props: unknown,
  ) => <Logo collapsed={props?.collapsed ?? initialState?.collapsed} />,
  onCollapse: (collapsed: boolean, type?: 'clickTrigger' | 'responsive') => {
    setInitialState?.((s) => ({
      ...s,
      collapsed,
      collapseType: type,
    }));
    // For quick debugging
    // eslint-disable-next-line no-console
    console.log('Sidebar collapsed?:', collapsed, 'type:', type);
  },
});
