import { LOGO_COMPACT, LOGO_ICON } from '@/assets';
import { useSiderCollapse } from '@/hooks/useSiderCollapse';
import useBreakpoint from 'antd/lib/grid/hooks/useBreakpoint';
import React from 'react';

export type LogoVariant = 'sider' | 'header';

export type LogoProps = {
  collapsed?: boolean;
  variant?: LogoVariant;
};

const Logo: React.FC<LogoProps> = ({
  collapsed: collapsedProp,
  variant = 'sider',
}) => {
  const { collapsed } = useSiderCollapse();
  const effectiveCollapsed = collapsedProp ?? collapsed;
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const showTagline =
    variant !== 'header' && (isMobile ? !collapsed : !effectiveCollapsed);

  const getLogo = () => {
    if (isMobile) {
      return LOGO_COMPACT;
    }
    return effectiveCollapsed ? LOGO_ICON : LOGO_COMPACT;
  };

  const logoClassNames = [
    'sidebar-logo',
    effectiveCollapsed ? 'collapsed' : '',
    isMobile ? 'mobile' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={logoClassNames}>
      <div>
        <img
          src={getLogo()}
          alt="Southbay"
          style={{
            height: isMobile ? 42 : 56,
            maxWidth: '100%',
            objectFit: 'contain',
          }}
        />
      </div>
      {showTagline && <div className="tagline">Descuento de Empleados</div>}
    </div>
  );
};

export default Logo;
