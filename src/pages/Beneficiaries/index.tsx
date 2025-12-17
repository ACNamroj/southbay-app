import {
  ENTITY_STATUS_COLORS,
  ENTITY_STATUS_LABELS,
  STATUS,
} from '@/constants';
import type {
  Beneficiary,
  BeneficiaryCreateRequest,
  BeneficiaryUpdateRequest,
} from '@/types/beneficiary';
import type { Segmentation } from '@/types/segmentation';
import { compareDates, compareStrings, formatDateTime } from '@/utils/format';
import { validateStoresUploadFile } from '@/utils/xlsxValidation';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import {
  type ActionType,
  PageContainer,
  ProColumns,
  ProTable,
} from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import {
  Button,
  Card,
  DatePicker,
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  Upload,
} from 'antd';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import React, { useMemo, useRef, useState } from 'react';

// Enable strict custom date parsing for non-ISO backend formats
dayjs.extend(customParseFormat);

const REQUIRED_HEADERS = [
  'first_name',
  'last_name',
  'email',
  'document_number',
  'phone_number',
  'segmentation',
  'status',
  'allocated_amount',
  'expires_at',
];

const formatCurrency = (v?: number | string | null, currency = '$') => {
  if (v === undefined || v === null || v === '') return '-';
  const n = typeof v === 'string' ? Number(v) : v;
  if (Number.isNaN(n as number)) return '-';
  return `${currency} ${(n as number).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

type BeneficiaryFormValues = {
  id?: number;
  first_name?: string;
  last_name?: string;
  email?: string;
  document_number?: string;
  phone_number?: string;
  segmentation?: string;
  status?: any;
  allocated_amount?: number;
  expires_at?: any;
};

const BeneficiariesPage: React.FC = () => {
  const [form] = Form.useForm<BeneficiaryFormValues>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [editing, setEditing] = useState<Beneficiary | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<File[]>([]);
  const actionRef = useRef<ActionType>();
  const searchRef = useRef('');

  const {
    beneficiaries,
    loadBeneficiaries,
    create,
    update,
    remove,
    exportBeneficiaries,
    upload,
    loading,
    pagination,
  } = useModel('beneficiaries');
  const { items: segmentations, loadSegmentations } = useModel('segmentation');

  const segmentationOptions = useMemo(
    () =>
      (segmentations || []).map((s: Segmentation) => ({
        value: (s as any).name ?? String((s as any).id),
        label: (s as any).label ?? (s as any).name,
      })),
    [segmentations],
  );

  const openCreateModal = () => {
    setEditing(null);
    form.resetFields();
    form.setFieldsValue({ status: STATUS.ACTIVE });
    setModalOpen(true);
  };

  const openEditModal = (record: Beneficiary) => {
    setEditing(record);
    form.resetFields();
    form.setFieldsValue({
      id: (record as any).id,
      first_name: (record as any).profile?.first_name,
      last_name: (record as any).profile?.last_name,
      email: record.email ?? undefined,
      document_number: (record as any).profile?.document_number ?? undefined,
      // Form expects the option value (usually code or name). Prefer name, fallback to label.
      segmentation:
        (record as any).segmentation?.name ??
        (record as any).segmentation?.label ??
        undefined,
      // Prefer wallet.status from the new payload, fallback to legacy top-level status
      status: ((record as any).wallet?.status ?? (record as any).status) as any,
      allocated_amount: record.wallet?.allocated_balance as any,
      // DatePicker expects a Dayjs value. Convert string to Dayjs when editing.
      expires_at: record.wallet?.expires_at
        ? (() => {
            const raw = record.wallet!.expires_at as string;
            // Try strict parse with expected backend format first, then fallback to ISO
            const d = dayjs(raw, 'YYYY-MM-DD HH:mm:ss', true) || dayjs(raw);
            return (d.isValid() ? (d as any) : undefined) as any;
          })()
        : undefined,
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setModalSubmitting(true);
      if (editing) {
        const payload: BeneficiaryUpdateRequest = {
          id: (editing as any).id as any,
          email: values.email,
          profile: {
            first_name: values.first_name,
            last_name: values.last_name,
            document_number: values.document_number,
          },
          segmentation: values.segmentation,
          wallet: {
            status: values.status,
          },
          allocated_amount: values.allocated_amount,
          expires_at: (values as any).expires_at
            ? (values as any).expires_at.format('YYYY-MM-DD HH:mm:ss')
            : undefined,
        } as any;
        await update(payload as any);
        message.success('Beneficiario actualizado correctamente');
      } else {
        const payload: BeneficiaryCreateRequest = {
          email: values.email,
          profile: {
            first_name: values.first_name,
            last_name: values.last_name,
            document_number: values.document_number,
            phone_number: values.phone_number,
          },
          segmentation: values.segmentation,
          wallet: {
            status: values.status,
          },
          allocated_amount: values.allocated_amount,
          expires_at: (values as any).expires_at
            ? (values as any).expires_at.format('YYYY-MM-DD HH:mm:ss')
            : undefined,
        } as any;
        await create(payload as any);
        message.success('Beneficiario creado correctamente');
      }
      closeModal();
      actionRef.current?.reload();
    } catch (_) {
      // handled globally
    } finally {
      setModalSubmitting(false);
    }
  };

  const openUpload = () => {
    setFileList([]);
    setUploadModalOpen(true);
  };

  const handleUpload = async () => {
    if (!fileList.length) return;
    setUploading(true);
    try {
      await validateStoresUploadFile(fileList[0], REQUIRED_HEADERS);
      await upload(fileList[0]);
      message.success(
        'Archivo subido correctamente. Recibirás un reporte por correo.',
      );
      setUploadModalOpen(false);
    } catch (e: any) {
      message.error(e?.message || 'Error al subir el archivo');
    } finally {
      setUploading(false);
    }
  };

  const handleExport = async () => {
    setExportLoading(true);
    try {
      const { blob, filename } = await exportBeneficiaries();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'beneficiary.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExportLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    searchRef.current = value.trim();
    actionRef.current?.reload();
  };

  const confirmDelete = (record: Beneficiary) => {
    Modal.confirm({
      title: 'Eliminar Persona',
      icon: <ExclamationCircleOutlined />,
      content: '¿Estás seguro de eliminar esta persona?',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await remove((record as any).id);
          message.success('Persona eliminada correctamente');
          actionRef.current?.reload();
        } catch (_) {
          // handled globally
        }
      },
    });
  };

  const columns: ProColumns<Beneficiary>[] = [
    {
      title: 'Nombre Completo',
      dataIndex: ['profile', 'first_name'],
      render: (_, r) => (
        <Space direction="vertical" size={0}>
          <Typography.Text>
            {`${(r as any).profile?.first_name ?? ''} ${
              (r as any).profile?.last_name ?? ''
            }`.trim() || '-'}
          </Typography.Text>
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            {r.email || '-'}
          </Typography.Text>
        </Space>
      ),
      sorter: (a, b) =>
        compareStrings(
          `${(a as any).profile?.first_name ?? ''} ${
            (a as any).profile?.last_name ?? ''
          }`,
          `${(b as any).profile?.first_name ?? ''} ${
            (b as any).profile?.last_name ?? ''
          }`,
        ),
    },
    {
      title: 'DNI',
      dataIndex: ['profile', 'document_number'],
      render: (_, r) => (r as any).profile?.document_number || '-',
      sorter: (a, b) =>
        compareStrings(
          (a as any).profile?.document_number || '',
          (b as any).profile?.document_number || '',
        ),
    },
    {
      title: 'Segmentación',
      key: 'segmentation_label',
      dataIndex: ['segmentation', 'label'],
      width: 160,
      ellipsis: true,
      render: (_, r) => (r as any).segmentation?.label || '-',
      sorter: (a, b) =>
        compareStrings(
          (a as any).segmentation?.label || '',
          (b as any).segmentation?.label || '',
        ),
    },
    {
      title: 'Estado',
      dataIndex: ['wallet', 'status'],
      render: (_, record) => {
        const s = ((record as any).wallet?.status ?? (record as any).status) as
          | keyof typeof ENTITY_STATUS_LABELS
          | undefined;
        const color = s ? ENTITY_STATUS_COLORS[s] : 'default';
        const label = s ? ENTITY_STATUS_LABELS[s] : '-';
        return <Tag color={color}>{label}</Tag>;
      },
      sorter: (a, b) => {
        const sa = ((a as any).wallet?.status ?? (a as any).status) as
          | keyof typeof ENTITY_STATUS_LABELS
          | undefined;
        const sb = ((b as any).wallet?.status ?? (b as any).status) as
          | keyof typeof ENTITY_STATUS_LABELS
          | undefined;
        const la = sa ? ENTITY_STATUS_LABELS[sa] : '';
        const lb = sb ? ENTITY_STATUS_LABELS[sb] : '';
        return la.localeCompare(lb);
      },
    },
    {
      title: 'Monto Asignado',
      dataIndex: ['wallet', 'allocated_balance'],
      render: (_, r) => formatCurrency(r.wallet?.allocated_balance as any),
      sorter: (a, b) =>
        Number(a.wallet?.allocated_balance || 0) -
        Number(b.wallet?.allocated_balance || 0),
    },
    {
      title: 'Fecha Fin de Válidez',
      dataIndex: ['wallet', 'expires_at'],
      render: (_, r) => formatDateTime(r.wallet?.expires_at),
      sorter: (a, b) =>
        compareDates(a.wallet?.expires_at, b.wallet?.expires_at),
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
        title: 'Gestión de Personas',
        extra: [
          <Button
            key="download"
            icon={<DownloadOutlined />}
            loading={exportLoading}
            onClick={handleExport}
            shape="default"
            type="default"
            aria-label="Descargar listado de beneficiarios"
            title="Descargar listado de beneficiarios"
          />,
          <Button key="upload" icon={<UploadOutlined />} onClick={openUpload}>
            Cargar Listado
          </Button>,
          <Button
            key="new"
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Agregar Persona
          </Button>,
        ],
      }}
    >
      <Card>
        <ProTable<Beneficiary>
          rowKey="id"
          actionRef={actionRef}
          loading={loading}
          search={false}
          options={{
            reload: true,
            density: true,
            setting: true,
            fullScreen: true,
          }}
          columnsState={{
            persistenceKey: 'beneficiary-table-columns',
            persistenceType: 'localStorage',
          }}
          scroll={{ x: 'max-content' }}
          tableLayout="fixed"
          dataSource={beneficiaries}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: pagination.total,
            showSizeChanger: true,
          }}
          request={async (params) => {
            const page = params.current ?? 1;
            const size = params.pageSize ?? 10;
            const result = await loadBeneficiaries({
              page,
              size,
              text: searchRef.current,
            });
            return {
              data: result.data,
              success: true,
              total: result.total,
            };
          }}
          columns={columns}
          toolbar={{
            search: {
              allowClear: true,
              placeholder: 'Buscar por nombre, DNI o email...',
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
        open={modalOpen}
        title={editing ? 'Editar Persona' : 'Cargar Persona'}
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={modalSubmitting}
        okText={editing ? 'Guardar cambios' : 'Crear'}
        cancelText="Cancelar"
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          {editing && <Form.Item name="id" hidden />}
          <Form.Item
            name="first_name"
            label="Nombre"
            rules={[{ required: true, message: 'Ingrese el nombre' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="last_name"
            label="Apellido"
            rules={[{ required: true, message: 'Ingrese el apellido' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              { type: 'email', required: true, message: 'Email inválido' },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="document_number"
            label="DNI"
            rules={[
              { required: true, message: 'Ingrese el número de documento' },
            ]}
          >
            <Input />
          </Form.Item>
          {!editing && (
            <Form.Item name="phone_number" label="Teléfono">
              <Input />
            </Form.Item>
          )}
          <Form.Item
            name="segmentation"
            label="Segmentación"
            rules={[{ required: true, message: 'Seleccione una segmentación' }]}
          >
            <Select
              showSearch
              placeholder="Seleccione..."
              options={segmentationOptions}
              onDropdownVisibleChange={(open) => {
                if (open && (!segmentations || segmentations.length === 0)) {
                  // Load first page
                  loadSegmentations({ page: 1, size: 100 });
                }
              }}
              filterOption={(input, option) =>
                (option?.label as string)
                  ?.toLowerCase()
                  .includes(input.toLowerCase())
              }
            />
          </Form.Item>
          <Form.Item name="status" label="Estado" rules={[{ required: true }]}>
            <Select
              options={Object.values(STATUS)
                .filter((s) => s !== STATUS.DELETED)
                .map((s) => ({
                  value: s,
                  label: ENTITY_STATUS_LABELS[s],
                }))}
            />
          </Form.Item>
          <Form.Item name="allocated_amount" label="Monto Asignado">
            <Input type="number" min={0} step="0.01" />
          </Form.Item>
          <Form.Item name="expires_at" label="Fecha Fin de Válidez">
            <DatePicker
              style={{ width: '100%' }}
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="Seleccione fecha y hora"
            />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        open={uploadModalOpen}
        title="Cargar Listado"
        onCancel={() => setUploadModalOpen(false)}
        onOk={handleUpload}
        okText="Subir"
        confirmLoading={uploading}
        destroyOnHidden
      >
        <Upload.Dragger
          multiple={false}
          maxCount={1}
          beforeUpload={(file) => {
            setFileList([file as unknown as File]);
            return false;
          }}
          onRemove={() => setFileList([])}
          accept=".xlsx"
        >
          <p>Sube un archivo .xlsx con las columnas requeridas.</p>
          <p style={{ fontSize: 12, color: '#888' }}>
            Encabezados: {REQUIRED_HEADERS.join(', ')}
          </p>
        </Upload.Dragger>
      </Modal>
    </PageContainer>
  );
};

export default BeneficiariesPage;
