import {
  ENTITY_STATUS,
  ENTITY_STATUS_LABELS,
  STORE_STATUS_COLORS,
} from '@/constants';
import type {
  SegmentationPayload,
  UserAccountType,
} from '@/types/segmentation';
import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import {
  PageContainer,
  ProColumns,
  ProTable,
  type ActionType,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import {
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Tag,
  message,
} from 'antd';
import React, { useRef, useState } from 'react';

const SegmentationPage: React.FC = () => {
  const [form] = Form.useForm<SegmentationPayload>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<UserAccountType | null>(null);
  const searchRef = useRef('');
  const actionRef = useRef<ActionType>();
  const { loadSegmentations, create, update, remove, loading, pagination } =
    useModel('segmentation');

  const openCreateModal = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      status: ENTITY_STATUS.ACTIVE,
      discount_percentage: 0,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: UserAccountType) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      label: item.label,
      discount_percentage: item.discount_percentage ?? 0,
      status: item.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingItem(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setModalSubmitting(true);
      if (editingItem) {
        await update(editingItem.id, values);
        message.success('Segmentación actualizada correctamente');
      } else {
        await create(values);
        message.success('Segmentación creada correctamente');
      }
      closeModal();
      actionRef.current?.reload();
    } catch (_e) {
      // handled by apiRequest globally
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDelete = (item: UserAccountType) => {
    Modal.confirm({
      title: '¿Eliminar segmentación? ',
      icon: <ExclamationCircleOutlined />,
      content: (
        <>
          Esto eliminará la segmentación <b>{item.label || item.name}</b>.
        </>
      ),
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      async onOk() {
        await remove(item.id); // same behavior as storeService delete
        message.success('Segmentación eliminada');
        actionRef.current?.reload();
      },
    });
  };

  const columns: ProColumns<UserAccountType>[] = [
    {
      title: 'Nombre de Segmentación',
      dataIndex: 'label',
      ellipsis: true,
      render: (_, r) => r.label || r.name,
    },
    {
      title: 'Nombre técnico',
      dataIndex: 'name',
      hideInSearch: true,
    },
    {
      title: 'Descuento (%)',
      dataIndex: 'discount_percentage',
      hideInSearch: true,
      renderText: (v) => (v ?? 0).toString(),
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: {
        options: Object.values(ENTITY_STATUS).map((s) => ({
          label: ENTITY_STATUS_LABELS[s],
          value: s,
        })),
      },
      render: (_, record) => (
        <Tag color={STORE_STATUS_COLORS[record.status]}>
          {ENTITY_STATUS_LABELS[record.status]}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      dataIndex: 'actions',
      valueType: 'option',
      width: 120,
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      header={{ title: 'Segmentación de Usuarios' }}
      loading={loading}
    >
      <ProTable<UserAccountType>
        headerTitle="Buscar segmentación"
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        search={false}
        pagination={pagination}
        toolBarRender={() => [
          <Input.Search
            key="search"
            placeholder="Buscar segmentación..."
            allowClear
            onSearch={(value) => {
              searchRef.current = value;
              actionRef.current?.reload();
            }}
          />,
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Agregar Segmentación
          </Button>,
        ]}
        request={async (params) => {
          const result = await loadSegmentations({
            page: params.current,
            size: params.pageSize,
            name: searchRef.current,
          });
          return {
            data: result.data,
            success: true,
            total: result.total,
          };
        }}
      />

      <Modal
        title={editingItem ? 'Editar Segmentación' : 'Agregar Segmentación'}
        open={modalOpen}
        onCancel={closeModal}
        confirmLoading={modalSubmitting}
        onOk={handleSubmit}
        okText={editingItem ? 'Guardar cambios' : 'Crear'}
        destroyOnHidden
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="label"
            label="Nombre de Segmentación"
            rules={[{ required: true, message: 'Ingresa el nombre' }]}
          >
            <Input maxLength={80} placeholder="Ej: Empleados" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Nombre técnico"
            rules={[{ required: true, message: 'Ingresa el nombre técnico' }]}
          >
            <Input maxLength={80} placeholder="Ej: EMPLEADOS" />
          </Form.Item>
          <Form.Item name="discount_percentage" label="Descuento (%)">
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item
            name="status"
            label="Estado"
            initialValue={ENTITY_STATUS.ACTIVE}
          >
            <Select
              options={Object.values(ENTITY_STATUS).map((s) => ({
                label: ENTITY_STATUS_LABELS[s],
                value: s,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SegmentationPage;
