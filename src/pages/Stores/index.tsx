import {
  ENTITY_STATUS_COLORS,
  ENTITY_STATUS_LABELS,
  STATUS,
} from '@/constants';
import type { Store, StorePayload } from '@/types/store';
import { compareDates, compareStrings, formatDateTime } from '@/utils/format';
import { validateStoresUploadFile } from '@/utils/xlsxValidation';
import {
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
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
  Form,
  Input,
  message,
  Modal,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  Upload,
  type UploadFile,
} from 'antd';
import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';

const Stores: React.FC = () => {
  const [form] = Form.useForm<StorePayload>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [exportLoading, setExportLoading] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileList, setFileList] = useState<File[]>([]);
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
    upload,
  } = useModel('stores');

  const openCreateModal = () => {
    setEditingStore(null);
    form.resetFields();
    form.setFieldsValue({ status: STATUS.ACTIVE });
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
    } catch (_) {
      // handled by apiRequest
    } finally {
      setModalSubmitting(false);
    }
  };

  const openUploadModal = () => {
    setFileList([]);
    setUploadModalOpen(true);
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setFileList([]);
  };

  const handleUpload = async () => {
    if (!fileList[0]) {
      message.warning('Selecciona un archivo .xlsx');
      return;
    }
    try {
      setUploading(true);
      await upload(fileList[0]);
      message.success(
        'Archivo recibido. Recibirás el reporte por correo cuando finalice el procesamiento.',
      );
      closeUploadModal();
    } catch (_) {
      // handled by global api handler
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadTemplate = () => {
    const data = [['Nombre', 'ID Externo', 'Estado']];
    const ws = XLSX.utils.aoa_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Tiendas');
    XLSX.writeFile(wb, 'stores-upload.xlsx');
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
        } catch (_) {
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
    } catch (error) {
      message.error(error?.message || 'No se pudo descargar el listado');
    } finally {
      setExportLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    searchRef.current = value.trim();
    actionRef.current?.reload();
  };

  const uploadUiFileList: UploadFile[] = fileList.map((f, idx) => ({
    uid: String(idx),
    name: f.name,
    status: 'done',
  }));

  const columns: ProColumns<Store>[] = [
    {
      title: 'Nombre de la tienda',
      dataIndex: 'name',
      sorter: (a, b) => compareStrings(a.name, b.name),
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (_, record) => (
        <Typography.Text strong>{record.name}</Typography.Text>
      ),
    },
    {
      title: 'ID Externo',
      dataIndex: 'external_id',
      sorter: (a, b) => compareStrings(a.external_id, b.external_id),
      ellipsis: true,
      responsive: ['sm', 'md', 'lg', 'xl'],
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      sorter: (a, b) =>
        ENTITY_STATUS_LABELS[a.status].localeCompare(
          ENTITY_STATUS_LABELS[b.status],
        ),
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
      valueType: 'option',
      width: 140,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
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
            onClick={openUploadModal}
          >
            Cargar listado
          </Button>,
          <Button
            key="new"
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Agregar tienda
          </Button>,
        ],
      }}
    >
      <Card>
        <ProTable<Store>
          rowKey="id"
          actionRef={actionRef}
          search={false}
          options={{
            reload: true,
            density: true,
            setting: true,
          }}
          columnsState={{
            persistenceKey: 'stores-table-columns',
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
            const result = await loadStores({
              page: params.current,
              size: params.pageSize,
              name: searchRef.current,
            });

            // Local sorting on the current page, based on column sorter selection
            let data = [...result.data];
            if (sort && Object.keys(sort).length > 0) {
              const [field, order] = Object.entries(sort)[0] as [
                keyof Store & string,
                'ascend' | 'descend' | null,
              ];
              if (order) {
                data.sort((a: Store, b: Store) => {
                  switch (field) {
                    case 'name':
                      return order === 'ascend'
                        ? compareStrings(a.name, b.name)
                        : compareStrings(b.name, a.name);
                    case 'external_id':
                      return order === 'ascend'
                        ? compareStrings(a.external_id, b.external_id)
                        : compareStrings(b.external_id, a.external_id);
                    case 'status':
                      return order === 'ascend'
                        ? ENTITY_STATUS_LABELS[a.status].localeCompare(
                            ENTITY_STATUS_LABELS[b.status],
                          )
                        : ENTITY_STATUS_LABELS[b.status].localeCompare(
                            ENTITY_STATUS_LABELS[a.status],
                          );
                    case 'created_at':
                      return order === 'ascend'
                        ? compareDates(a.created_at, b.created_at)
                        : compareDates(b.created_at, a.created_at);
                    case 'updated_at':
                      return order === 'ascend'
                        ? compareDates(a.updated_at, b.updated_at)
                        : compareDates(b.updated_at, a.updated_at);
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
        title="Cargar listado de tiendas (.xlsx)"
        open={uploadModalOpen}
        onCancel={closeUploadModal}
        onOk={handleUpload}
        okText="Enviar"
        cancelText="Cancelar"
        confirmLoading={uploading}
        destroyOnHidden
      >
        <div style={{ marginBottom: 12 }}>
          <div>
            Selecciona un archivo Excel (.xlsx) con las columnas obligatorias:
          </div>
          <ul style={{ marginTop: 6, paddingLeft: 18 }}>
            <li>
              <Tooltip
                title="Nombre visible de la tienda. Máximo 100 carácteres."
                placement="right"
              >
                <Space size={6}>
                  <InfoCircleOutlined
                    style={{ color: 'var(--brand-orange)' }}
                  />
                  <strong>Nombre</strong>
                </Space>
              </Tooltip>
            </li>
            <li>
              <Tooltip
                title="Identificar externo de la tienda. Único por tienda. Máximo 100 carácteres."
                placement="right"
              >
                <Space size={6}>
                  <InfoCircleOutlined
                    style={{ color: 'var(--brand-orange)' }}
                  />
                  <strong>ID Externo</strong>
                </Space>
              </Tooltip>
            </li>
            <li>
              <Tooltip
                title="Estado de la tienda. Opciones: ACTIVE: Marca la tienda como 'Activa'. INACTIVE: Marca la tienda como 'Inactiva'."
                placement="right"
              >
                <Space size={6}>
                  <InfoCircleOutlined
                    style={{ color: 'var(--brand-orange)' }}
                  />
                  <strong>Estado</strong>
                </Space>
              </Tooltip>
            </li>
          </ul>
          <Typography.Paragraph style={{ marginTop: 4 }}>
            Debe contener al menos una fila de datos.
          </Typography.Paragraph>
          <Button
            type="link"
            icon={<DownloadOutlined />}
            onClick={handleDownloadTemplate}
            style={{ paddingLeft: 0 }}
          >
            Descargar plantilla (.xlsx)
          </Button>
        </div>
        <Upload.Dragger
          multiple={false}
          maxCount={1}
          accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          beforeUpload={async (file) => {
            try {
              await validateStoresUploadFile(file as File);
              setFileList([file as File]);
              message.success('Archivo válido listo para subir');
            } catch (error) {
              setFileList([]);
              message.error(
                String(error.message ?? error ?? 'Archivo inválido'),
              );
            }
            // Prevent automatic upload, we handle it on modal OK
            return false;
          }}
          onRemove={() => {
            setFileList([]);
            return true;
          }}
          fileList={uploadUiFileList}
        >
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            Haz clic o arrastra el archivo a esta área para seleccionar
          </p>
          <p className="ant-upload-hint">Solo se admite un archivo .xlsx</p>
        </Upload.Dragger>
      </Modal>

      <Modal
        title={editingStore ? 'Editar tienda' : 'Agregar tienda'}
        open={modalOpen}
        okText={editingStore ? 'Guardar cambios' : 'Crear tienda'}
        cancelText="Cancelar"
        onCancel={closeModal}
        onOk={handleSubmit}
        confirmLoading={modalSubmitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="name"
            label="Nombre de la tienda"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Ingresa el nombre de la tienda',
              },
              { max: 100, message: 'Máximo 100 caracteres' },
            ]}
          >
            <Input placeholder="nike.com.ar" maxLength={100} />
          </Form.Item>
          <Form.Item
            name="external_id"
            label="ID Externo"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Ingresa el ID externo',
              },
              { max: 100, message: 'Máximo 100 caracteres' },
            ]}
          >
            <Input
              placeholder="Identificador único de la tienda"
              maxLength={100}
            />
          </Form.Item>
          <Form.Item
            name="status"
            label="Estado"
            rules={[{ required: true, message: 'Selecciona un estado' }]}
          >
            <Select
              options={[
                {
                  label: ENTITY_STATUS_LABELS[STATUS.ACTIVE],
                  value: STATUS.ACTIVE,
                },
                {
                  label: ENTITY_STATUS_LABELS[STATUS.INACTIVE],
                  value: STATUS.INACTIVE,
                },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default Stores;
