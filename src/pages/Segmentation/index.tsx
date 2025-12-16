import {
  ENTITY_STATUS_COLORS,
  ENTITY_STATUS_LABELS,
  STATUS,
} from '@/constants';
import type { Segmentation, SegmentationPayload } from '@/types/segmentation';
import { compareDates, compareStrings, formatDateTime } from '@/utils/format';
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
  Card,
  Form,
  Input,
  InputNumber,
  Modal,
  Select,
  Space,
  Switch,
  Tag,
  message,
} from 'antd';
import React, { useRef, useState } from 'react';

const SegmentationPage: React.FC = () => {
  const [form] = Form.useForm<SegmentationPayload>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState<Segmentation | null>(null);
  const searchRef = useRef('');
  const actionRef = useRef<ActionType>();
  const { loadSegmentations, create, update, remove, loading, pagination } =
    useModel('segmentation');

  const openCreateModal = () => {
    setEditingItem(null);
    form.resetFields();
    form.setFieldsValue({
      status: STATUS.ACTIVE,
      discount_percentage_cap: 0,
      monthly_recharge_enabled: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (item: Segmentation) => {
    setEditingItem(item);
    form.setFieldsValue({
      name: item.name,
      label: item.label,
      discount_percentage_cap: item.discount_percentage_cap ?? 0,
      allocated_balance: item.allocated_balance ?? null,
      monthly_recharge_enabled: item.monthly_recharge_enabled ?? false,
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
        if (editingItem.id === undefined || editingItem.id === null) {
          message.error('No se puede actualizar: ID no disponible');
          return;
        }
        await update(editingItem.id, values);
        message.success('Segmentación actualizada correctamente');
      } else {
        await create(values);
        message.success('Segmentación creada correctamente');
      }
      closeModal();
      actionRef.current?.reload();
    } catch (_) {
      // handled by apiRequest globally
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleSearch = (value: string) => {
    const nextValue = value.trim();
    searchRef.current = nextValue;
    actionRef.current?.reload();
  };

  const compareNumbers = (a?: number, b?: number) => {
    if (a === undefined && b === undefined) {
      return 0;
    }
    if (a === undefined) {
      return 1;
    }
    if (b === undefined) {
      return -1;
    }
    return a - b;
  };

  const formatCurrency = (v?: number | null) => {
    if (v === undefined || v === null) return '—';
    try {
      return new Intl.NumberFormat('es-AR', {
        style: 'currency',
        currency: 'ARS',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(v);
    } catch {
      return `${v}`;
    }
  };

  const handleDelete = (item: Segmentation) => {
    if (item.id === undefined || item.id === null) {
      message.error('No se puede eliminar: ID no disponible');
      return;
    }
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
        await remove(item.id!);
        message.success('Segmentación eliminada');
        actionRef.current?.reload();
      },
    });
  };

  const columns: ProColumns<Segmentation>[] = [
    {
      title: 'Nombre de Segmentación',
      dataIndex: 'label',
      sorter: (a, b) => compareStrings(a.label || a.name, b.label || b.name),
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (_, r) => <b>{r.label || r.name}</b>,
    },
    {
      title: 'Nombre Técnico',
      dataIndex: 'name',
      sorter: (a, b) => compareStrings(a.name, b.name),
      hideInSearch: true,
      ellipsis: true,
      responsive: ['sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Tope de Descuento (%)',
      dataIndex: 'discount_percentage_cap',
      sorter: (a, b) =>
        compareNumbers(a.discount_percentage_cap, b.discount_percentage_cap),
      hideInSearch: true,
      responsive: ['sm', 'md', 'lg', 'xl'],
      renderText: (v) => (v ?? 0).toString(),
    },
    {
      title: 'Monto Límite',
      dataIndex: 'allocated_balance',
      sorter: (a, b) =>
        compareNumbers(
          a.allocated_balance ?? undefined,
          b.allocated_balance ?? undefined,
        ),
      hideInSearch: true,
      responsive: ['md', 'lg', 'xl'],
      render: (_, r) => <span>{formatCurrency(r.allocated_balance)}</span>,
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      sorter: (a, b) =>
        ENTITY_STATUS_LABELS[a.status].localeCompare(
          ENTITY_STATUS_LABELS[b.status],
        ),
      valueType: 'select',
      fieldProps: {
        options: Object.values(STATUS).map((s) => ({
          label: ENTITY_STATUS_LABELS[s],
          value: s,
        })),
      },
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (_, record) => (
        <Tag color={ENTITY_STATUS_COLORS[record.status]}>
          {ENTITY_STATUS_LABELS[record.status]}
        </Tag>
      ),
    },
    {
      title: 'Fecha de creación',
      dataIndex: 'created_at',
      sorter: (a, b) => compareDates(a.created_at, b.created_at),
      responsive: ['lg', 'xl'],
      render: (_, record) => <span>{formatDateTime(record.created_at)}</span>,
    },
    {
      title: 'Fecha de actualización',
      dataIndex: 'updated_at',
      sorter: (a, b) => compareDates(a.updated_at, b.updated_at),
      responsive: ['lg', 'xl'],
      render: (_, record) => <span>{formatDateTime(record.updated_at)}</span>,
    },
    {
      title: 'Acciones',
      dataIndex: 'actions',
      valueType: 'option',
      width: 120,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
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
      ghost
      header={{
        title: 'Segmentación de Usuarios',
        extra: [
          <Button
            key="new"
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Agregar Segmentación
          </Button>,
        ],
      }}
    >
      <Card>
        <ProTable<Segmentation>
          rowKey="id"
          actionRef={actionRef}
          search={false}
          options={{
            reload: true,
            density: true,
            setting: true,
            fullScreen: true,
          }}
          columnsState={{
            persistenceKey: 'segmentation-table-columns',
            persistenceType: 'localStorage',
          }}
          scroll={{ x: 'max-content' }}
          tableLayout="fixed"
          loading={loading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          request={async (params, sort) => {
            const result = await loadSegmentations({
              page: params.current,
              size: params.pageSize,
              name: searchRef.current,
            });

            // Local sorting on the current page, based on column sorter selection
            let data = [...result.data];
            if (sort && Object.keys(sort).length > 0) {
              const [field, order] = Object.entries(sort)[0] as [
                keyof Segmentation & string,
                'ascend' | 'descend' | null,
              ];
              if (order) {
                data.sort((a: Segmentation, b: Segmentation) => {
                  switch (field) {
                    case 'label':
                      return order === 'ascend'
                        ? compareStrings(a.label || a.name, b.label || b.name)
                        : compareStrings(b.label || b.name, a.label || a.name);
                    case 'name':
                      return order === 'ascend'
                        ? compareStrings(a.name, b.name)
                        : compareStrings(b.name, a.name);
                    case 'discount_percentage_cap':
                      return order === 'ascend'
                        ? compareNumbers(
                            a.discount_percentage_cap,
                            b.discount_percentage_cap,
                          )
                        : compareNumbers(
                            b.discount_percentage_cap,
                            a.discount_percentage_cap,
                          );
                    case 'allocated_balance':
                      return order === 'ascend'
                        ? compareNumbers(
                            a.allocated_balance ?? undefined,
                            b.allocated_balance ?? undefined,
                          )
                        : compareNumbers(
                            b.allocated_balance ?? undefined,
                            a.allocated_balance ?? undefined,
                          );
                    case 'status':
                      return order === 'ascend'
                        ? ENTITY_STATUS_LABELS[a.status].localeCompare(
                            ENTITY_STATUS_LABELS[b.status],
                          )
                        : ENTITY_STATUS_LABELS[b.status].localeCompare(
                            ENTITY_STATUS_LABELS[a.status],
                          );
                    default:
                      return 0;
                  }
                });
              }
            }

            return {
              data,
              success: true,
              total: result.total,
            };
          }}
          columns={columns}
          rowSelection={{}}
          toolbar={{
            search: {
              allowClear: true,
              placeholder: 'Buscar segmentación...',
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
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Ingresa el nombre',
              },
              { max: 100, message: 'Máximo 100 caracteres' },
            ]}
          >
            <Input maxLength={100} placeholder="EMPLEADO" />
          </Form.Item>
          <Form.Item
            name="name"
            label="Nombre Técnico"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Ingresa el nombre técnico',
              },
              { max: 50, message: 'Máximo 50 caracteres' },
            ]}
          >
            <Input maxLength={50} placeholder="EMPLOYEE" />
          </Form.Item>
          <Form.Item
            name="discount_percentage_cap"
            label="Tope de Descuento (%)"
            rules={[
              { required: true, message: 'Ingresa el tope de descuento' },
              {
                type: 'number',
                min: 0,
                max: 100,
                message: 'Debe estar entre 0 y 100',
              },
              () => ({
                validator(_, value) {
                  if (
                    value === undefined ||
                    value === null ||
                    Number.isInteger(value)
                  ) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Debe ser un número entero'));
                },
              }),
            ]}
          >
            <InputNumber min={0} max={100} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="allocated_balance" label="Monto Límite">
            <InputNumber
              min={0}
              style={{ width: '100%' }}
              precision={2}
              formatter={(value) => {
                if (value === undefined || value === null || value === '') {
                  return '' as any;
                }
                const n = Number(
                  String(value)
                    .replace(/[^0-9.,-]/g, '')
                    .replace('.', '')
                    .replace(',', '.'),
                );
                if (Number.isNaN(n)) {
                  return value as any;
                }
                return new Intl.NumberFormat('es-AR', {
                  style: 'currency',
                  currency: 'ARS',
                  minimumFractionDigits: 2,
                }).format(n);
              }}
              parser={(value) => {
                if (!value) {
                  return null as any;
                }
                const cleaned = value
                  .replace(/[^0-9,-]/g, '')
                  .replace('.', '')
                  .replace(',', '.');
                const num = parseFloat(cleaned);
                return Number.isNaN(num) ? null : num;
              }}
            />
          </Form.Item>
          <Form.Item
            name="monthly_recharge_enabled"
            label="Recarga mensual habilitada"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item name="status" label="Estado" initialValue={STATUS.ACTIVE}>
            <Select
              options={
                editingItem
                  ? [
                      {
                        label: ENTITY_STATUS_LABELS[STATUS.ACTIVE],
                        value: STATUS.ACTIVE,
                      },
                      {
                        label: ENTITY_STATUS_LABELS[STATUS.INACTIVE],
                        value: STATUS.INACTIVE,
                      },
                    ]
                  : Object.values(STATUS).map((s) => ({
                      label: ENTITY_STATUS_LABELS[s],
                      value: s,
                    }))
              }
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default SegmentationPage;
