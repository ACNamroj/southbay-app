import {
  PASSWORD_POLICY_REQUIREMENTS,
  type PasswordPolicyStatus,
} from '@/utils/passwordPolicy';
import { theme } from 'antd';
import React from 'react';

type PasswordPolicyChecklistProps = {
  status: PasswordPolicyStatus;
  style?: React.CSSProperties;
};

const PasswordPolicyChecklist: React.FC<PasswordPolicyChecklistProps> = ({
  status,
  style,
}) => {
  const { token } = theme.useToken();
  return (
    <div style={{ marginBottom: 24, marginTop: 8, ...style }}>
      {PASSWORD_POLICY_REQUIREMENTS.map((requirement) => (
        <div
          key={requirement.key}
          style={{
            display: 'flex',
            gap: 8,
            alignItems: 'center',
            fontSize: 12,
            color: status[requirement.key]
              ? token.colorSuccess
              : token.colorError,
            lineHeight: 1.6,
          }}
        >
          <span>•</span>
          <span>{requirement.label}</span>
        </div>
      ))}
    </div>
  );
};

export default PasswordPolicyChecklist;
