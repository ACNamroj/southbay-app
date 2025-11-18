import { PageContainer } from '@ant-design/pro-components';
import React from 'react';

const AccessPage: React.FC = () => {
  // const access = useAccess();
  return (
    <PageContainer
      ghost
      header={{
        title: 'Gestión de Personas',
      }}
    >
      {/*
       <Access accessible={access.canSeeAdmin}>
        <Button>Butón para administradores</Button>
      </Access>
      */}
    </PageContainer>
  );
};

export default AccessPage;
