import {
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  PlusOutlined,
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
  Modal,
  Select,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import React, { useMemo, useRef, useState } from 'react';

import type { User, UserPayload, UserRole } from '@/types/user';
import { compareDates, compareStrings, formatDateTime } from '@/utils/format';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  TECH: 'Tech',
  MARKETING: 'Marketing',
  USER: 'User',
  INTEGRATION: 'Integration',
};

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'purple',
  TECH: 'geekblue',
  MARKETING: 'magenta',
  USER: 'blue',
  INTEGRATION: 'cyan',
};

const getRoleLabel = (role?: string) => {
  if (!role) return '—';
  return ROLE_LABELS[role] ?? role;
};

const getRoleColor = (role?: string) => {
  if (!role) return undefined;
  return ROLE_COLORS[role] ?? 'default';
};

const getPrimaryRole = (roles?: UserRole[]) => roles?.[0];

const UsersPage: React.FC = () => {
  const [form] = Form.useForm<UserPayload>();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSubmitting, setModalSubmitting] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const searchRef = useRef('');
  const actionRef = useRef<ActionType>();

  const { loadUsers, create, update, remove, loading, pagination } =
    useModel('users');

  const roleOptions: UserRole[] = useMemo(() => {
    const baseRoles: UserRole[] = [
      'ADMIN',
      'TECH',
      'MARKETING',
      'USER',
      'INTEGRATION',
    ];
    const currentRoles = editingUser?.roles ?? [];
    const extras = currentRoles.filter((r) => !baseRoles.includes(r));
    return [...baseRoles, ...extras];
  }, [editingUser]);

  const openCreateModal = () => {
    setEditingUser(null);
    form.resetFields();
    form.setFieldsValue({
      roles: ['USER'],
      first_name: '',
      last_name: '',
      document_number: '',
      phone_number: '',
    });
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    form.setFieldsValue({
      email: user.email,
      roles: user.roles ?? [],
      first_name: user.profile?.first_name ?? '',
      last_name: user.profile?.last_name ?? '',
      document_number: user.profile?.document_number ?? '',
      phone_number: user.profile?.phone_number ?? '',
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingUser(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: UserPayload = {
        email: values.email.trim(),
        roles: values.roles,
        segmentation: editingUser?.segmentation ?? null,
        profile: {
          first_name: values.first_name?.trim() ?? '',
          last_name: values.last_name?.trim() ?? '',
          document_number: values.document_number?.trim() ?? '',
          phone_number: values.phone_number?.trim() ?? '',
          photo: '',
          thumbnail: '',
        },
      };

      setModalSubmitting(true);
      if (editingUser) {
        if (editingUser.id === undefined || editingUser.id === null) {
          message.error('No se puede actualizar: ID no disponible');
          return;
        }
        await update(editingUser.id, payload);
        message.success('Usuario actualizado correctamente');
      } else {
        await create(payload);
        message.success('Usuario creado correctamente');
      }
      closeModal();
      actionRef.current?.reload();
    } catch (_e) {
      // handled by global api handler
    } finally {
      setModalSubmitting(false);
    }
  };

  const handleDelete = (user: User) => {
    if (user.id === undefined || user.id === null) {
      message.error('No se puede eliminar: ID no disponible');
      return;
    }

    Modal.confirm({
      title: 'Eliminar usuario',
      icon: <ExclamationCircleOutlined />,
      content:
        'El usuario perderá acceso a la plataforma y a los recursos asociados.',
      okText: 'Eliminar',
      okType: 'danger',
      cancelText: 'Cancelar',
      onOk: async () => {
        try {
          await remove(user.id as number);
          message.success('Usuario eliminado');
          actionRef.current?.reload();
        } catch (_error) {
          // handled globally
        }
      },
    });
  };

  const handleSearch = (value: string) => {
    searchRef.current = value.trim();
    actionRef.current?.reload();
  };

  const columns: ProColumns<User>[] = [
    {
      title: 'Email',
      dataIndex: 'email',
      sorter: (a, b) => compareStrings(a.email, b.email),
      ellipsis: true,
      responsive: ['xs', 'sm', 'md', 'lg', 'xl'],
      render: (_, record) => (
        <Typography.Text strong>{record.email}</Typography.Text>
      ),
    },
    {
      title: 'Roles',
      dataIndex: 'roles',
      width: 140,
      sorter: (a, b) =>
        compareStrings(
          getRoleLabel(getPrimaryRole(a.roles)),
          getRoleLabel(getPrimaryRole(b.roles)),
        ),
      responsive: ['sm', 'md', 'lg', 'xl'],
      render: (_, record) => (
        <Space size={4} wrap>
          {(record.roles ?? []).map((role) => (
            <Tag key={role} color={getRoleColor(role)}>
              {getRoleLabel(role)}
            </Tag>
          ))}
          {(record.roles ?? []).length === 0 && (
            <Typography.Text type="secondary">—</Typography.Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Fecha de creación',
      dataIndex: 'created_at',
      sorter: (a, b) => compareDates(a.created_at, b.created_at),
      responsive: ['lg', 'xl'],
      render: (_, record) =>
        record.created_at ? (
          <span>{formatDateTime(record.created_at)}</span>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: 'Fecha de actualización',
      dataIndex: 'updated_at',
      sorter: (a, b) => compareDates(a.updated_at, b.updated_at),
      responsive: ['lg', 'xl'],
      render: (_, record) =>
        record.updated_at ? (
          <span>{formatDateTime(record.updated_at)}</span>
        ) : (
          <Typography.Text type="secondary">—</Typography.Text>
        ),
    },
    {
      title: 'Acciones',
      valueType: 'option',
      width: 120,
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
        title: 'Gestión de Usuarios',
        extra: [
          <Button
            key="new"
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Crear usuario
          </Button>,
        ],
      }}
    >
      <Card>
        <ProTable<User>
          rowKey={(record) => record.id ?? record.uuid ?? record.email}
          actionRef={actionRef}
          search={false}
          options={{
            reload: true,
            density: true,
            setting: true,
            fullScreen: true,
          }}
          columnsState={{
            persistenceKey: 'users-table-columns',
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
            const result = await loadUsers({
              page: params.current,
              size: params.pageSize,
              email: searchRef.current,
            });

            let data = [...result.data];
            if (sort && Object.keys(sort).length > 0) {
              const [field, order] = Object.entries(sort)[0] as [
                keyof User & string,
                'ascend' | 'descend' | null,
              ];
              if (order) {
                data.sort((a: User, b: User) => {
                  switch (field) {
                    case 'email':
                      return order === 'ascend'
                        ? compareStrings(a.email, b.email)
                        : compareStrings(b.email, a.email);
                    case 'roles':
                      return order === 'ascend'
                        ? compareStrings(
                            getRoleLabel(getPrimaryRole(a.roles)),
                            getRoleLabel(getPrimaryRole(b.roles)),
                          )
                        : compareStrings(
                            getRoleLabel(getPrimaryRole(b.roles)),
                            getRoleLabel(getPrimaryRole(a.roles)),
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
              placeholder: 'Buscar por email...',
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
        title={editingUser ? 'Editar usuario' : 'Crear usuario'}
        open={modalOpen}
        onCancel={closeModal}
        onOk={handleSubmit}
        okText={editingUser ? 'Guardar cambios' : 'Crear usuario'}
        cancelText="Cancelar"
        confirmLoading={modalSubmitting}
        destroyOnHidden
      >
        <Form form={form} layout="vertical" preserve={false}>
          <Form.Item
            name="email"
            label="Email"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Ingresa el email',
              },
              { type: 'email', message: 'Ingresa un email válido' },
              { max: 100, message: 'Máximo 100 caracteres' },
            ]}
          >
            <Input placeholder="usuario@southbay.com" maxLength={100} />
          </Form.Item>
          <Form.Item
            name="roles"
            label="Roles"
            rules={[
              {
                validator: (_, value) => {
                  if (Array.isArray(value) && value.length > 0) {
                    return Promise.resolve();
                  }
                  return Promise.reject(
                    new Error('Selecciona al menos un rol'),
                  );
                },
              },
            ]}
          >
            <Select
              mode="multiple"
              placeholder="Selecciona el rol"
              options={roleOptions.map((role) => ({
                label: getRoleLabel(role),
                value: role,
              }))}
            />
          </Form.Item>
          <Form.Item
            name="first_name"
            label="Nombre"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Ingresa el nombre',
              },
              { max: 100, message: 'Máximo 100 caracteres' },
            ]}
          >
            <Input placeholder="Nombre" maxLength={100} />
          </Form.Item>
          <Form.Item
            name="last_name"
            label="Apellido"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Ingresa el apellido',
              },
              { max: 100, message: 'Máximo 100 caracteres' },
            ]}
          >
            <Input placeholder="Apellido" maxLength={100} />
          </Form.Item>
          <Form.Item
            name="document_number"
            label="Número de documento"
            rules={[
              {
                required: true,
                whitespace: true,
                message: 'Ingresa el número de documento',
              },
              { max: 50, message: 'Máximo 50 caracteres' },
            ]}
          >
            <Input placeholder="Documento" maxLength={50} />
          </Form.Item>
          <Form.Item
            name="phone_number"
            label="Teléfono"
            rules={[{ max: 30, message: 'Máximo 30 caracteres' }]}
          >
            <Input placeholder="Teléfono (opcional)" maxLength={30} />
          </Form.Item>
        </Form>
      </Modal>
    </PageContainer>
  );
};

export default UsersPage;
