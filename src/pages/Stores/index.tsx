import type { Store, StorePayload, StoreStatus } from '@/types/store';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  UploadOutlined,
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
  Card,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import React, { useRef, useState } from 'react';

const STATUS_COLOR_MAP: Record<StoreStatus, string> = {
  ACTIVE: 'green',
  INACTIVE: 'orange',
  DELETED: 'red',
};

const STATUS_LABELS: Record<StoreStatus, string> = {
  ACTIVE: 'Activa',
  INACTIVE: 'Inactiva',
  DELETED: 'Eliminada',
};

const Stores: React.FC = () => {
  const [form] = Form.useForm<StorePayload>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const searchRef = useRef('');
  const actionRef = useRef<ActionType>();
  const {
    loadStores,
    create,
    update,
    remove,
    loading,
    pagination,
    exportStores,
  } = useModel('stores');

  const openCreateModal = () => {
    setEditingStore(null);
    form.resetFields();
    form.setFieldsValue({ status: 'ACTIVE' });
    setModalOpen(true);
  };

  const openEditModal = (store: Store) => {
    setEditingStore(store);
    form.setFieldsValue({
      name: store.name,
      external_id: store.external_id,
      status: store.status,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingStore(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setModalSubmitting(true);
      if (editingStore) {
        await update(editingStore.id, values);
        message.success('Tienda actualizada correctamente');
      } else {
        await create(values);
        message.success('Tienda creada correctamente');
      }
      closeModal();
      actionRef.current?.reload();
    } catch (error) {
      // handled by apiRequest
    } finally {
      setModalSubmitting(false);
    }
  };

  const confirmDelete = (store: Store) => {
    Modal.confirm({
      title: 'Eliminar tienda',
      icon: <ExclamationCircleOutlined />,
      content:
        'La tienda se marcará como eliminada y no estará disponible para nuevos usuarios.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await remove(store.id);
          message.success('Tienda eliminada');
          actionRef.current?.reload();
        } catch (error) {
          // handled by apiRequest
        }
      },
    });
  };

  const handleExport = async () => {
    try {
      setExportLoading(true);
      const { blob, filename } = await exportStores();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename || 'stores.xlsx';
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      message.success('Listado descargado');
    } catch (error: any) {
      // Surface the actual reason captured by downloadStores (e.g., backend message)
      message.error(error?.message || 'No se pudo descargar el listado');
    } finally {
      setExportLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    const nextValue = value.trim();
    searchRef.current = nextValue;
    actionRef.current?.reload();
  };

  const columns: ProColumns<Store>[] = [
    {
      title: 'Nombre de la tienda',
      dataIndex: 'name',
      render: (_, record) => (
        <Typography.Text strong>{record.name}</Typography.Text>
      ),
    },
    {
      title: 'ID externo',
      dataIndex: 'external_id',
      ellipsis: true,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      render: (_, record) => (
        <Tag color={STATUS_COLOR_MAP[record.status]}>
          {STATUS_LABELS[record.status]}
        </Tag>
      ),
    },
    {
      title: 'Acciones',
      valueType: 'option',
      width: 140,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => openEditModal(record)}
          />
          <Button
            type="text"
            danger
            icon={<DeleteOutlined />}
            onClick={() => confirmDelete(record)}
          />
        </Space>
      ),
    },
  ];

  return (
    <PageContainer
      ghost
      header={{
        title: 'Gestión de Tiendas',
        extra: [
          <Button
            key="download"
            icon={<DownloadOutlined />}
            loading={exportLoading}
            onClick={handleExport}
            shape="default"
            type="default"
            aria-label="Descargar listado de tiendas"
            title="Descargar listado de tiendas"
          />,
          <Button
            key="upload"
            icon={<UploadOutlined />}
            onClick={() =>
              message.info(
                'La carga masiva de tiendas estará disponible pronto.',
              )
            }
          >
            Cargar listado
          </Button>,
          <Button
            key="new"
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Cargar una tienda
          </Button>,
        ],
      }}
    >
      <Card>
        <ProTable<Store>
          rowKey="id"
          actionRef={actionRef}
          search={false}
          options={false}
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          request={async (params) => {
            const result = await loadStores({
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
          columns={columns}
          rowSelection={{}}
          toolbar={{
            search: {
              allowClear: true,
              placeholder: 'Buscar por nombre de tienda...',
              onSearch: handleSearch,
              onChange: (event) => {
                if (!event?.target?.value) {
                  handleSearch('');
                }
              },
            },
          }}
        />
      </Card>

      <Modal
        title={editingStore ? 'Editar tienda' : 'Agregar tienda'}
        open={modalOpen}
        okText={editingStore ? 'Guardar cambios' : 'Crear tienda'}
        cancelText="Cancelar"
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={modalSubmitting}
        destroyOnClose
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="name"
            label="Nombre de la tienda"
            rules={[
              { required: true, message: 'Ingresa el nombre de la tienda' },
            ]}
          >
            <Input placeholder="Ej: Nike.com.ar" />
          </Form.Item>
          <Form.Item
            name="external_id"
            label="ID externo"
            rules={[{ required: true, message: 'Ingresa el ID externo' }]}
          >
            <Input placeholder="Identificador único de la tienda" />
          </Form.Item>
          <Form.Item
            name="status"
            label="Estado"
            rules={[{ required: true, message: 'Selecciona un estado' }]}
          >
            <Select
              options={[
                { label: STATUS_LABELS.ACTIVE, value: 'ACTIVE' },
                { label: STATUS_LABELS.INACTIVE, value: 'INACTIVE' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Stores;
