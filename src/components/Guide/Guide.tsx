import { Layout, Row, Typography } from 'antd';
import React from 'react';
import styles from './Guide.less';

interface Props {
  name: string;
}

// Example component for a scaffolding template
const Guide: React.FC<Props> = (props) => {
  const { name } = props;
  return (
    <Layout>
      <Row>
        <Typography.Title level={3} className={styles.title}>
          Bienvenido a <strong>{name}</strong>！
        </Typography.Title>
      </Row>
    </Layout>
  );
};

export default Guide;
