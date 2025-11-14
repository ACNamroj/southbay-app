import services from '@/services/demo';
import {
  ActionType,
  FooterToolbar,
  PageContainer,
  ProDescriptions,
  ProDescriptionsItemProps,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Divider, Drawer, message } from 'antd';
import React, { useRef, useState } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm, { FormValueType } from './components/UpdateForm';

const { addUser, queryUserList, deleteUser, modifyUser } =
  services.UserController;

/**
 * Add node
 * @param fields
 */
const handleAdd = async (fields: API.UserInfo) => {
  const hide = message.loading('Agregando');
  try {
    await addUser({ ...fields });
    hide();
    message.success('Agregado exitosamente');
    return true;
  } catch (error) {
    hide();
    message.error('Error al agregar, por favor intenta nuevamente');
    return false;
  }
};

/**
 * Update node
 * @param fields
 */
const handleUpdate = async (fields: FormValueType) => {
  const hide = message.loading('Configurando');
  try {
    await modifyUser(
      {
        userId: fields.id || '',
      },
      {
        name: fields.name || '',
        nickName: fields.nickName || '',
        email: fields.email || '',
      },
    );
    hide();

    message.success('Configuración aplicada exitosamente');
    return true;
  } catch (error) {
    hide();
    message.error('Configuración fallida, por favor intenta nuevamente');
    return false;
  }
};

/**
 *  Delete node
 * @param selectedRows
 */
const handleRemove = async (selectedRows: API.UserInfo[]) => {
  const hide = message.loading('Borrando');
  if (!selectedRows) return true;
  try {
    await deleteUser({
      userId: selectedRows.find((row) => row.id)?.id || '',
    });
    hide();
    message.success('Borrado exitoso, recargando');
    return true;
  } catch (error) {
    hide();
    message.error('Ocurrió un error, por favor intenta nuevamente');
    return false;
  }
};

const TableList: React.FC<unknown> = () => {
  const [createModalVisible, handleModalVisible] = useState<boolean>(false);
  const [updateModalVisible, handleUpdateModalVisible] =
    useState<boolean>(false);
  const [stepFormValues, setStepFormValues] = useState({});
  const actionRef = useRef<ActionType>();
  const [row, setRow] = useState<API.UserInfo>();
  const [selectedRowsState, setSelectedRows] = useState<API.UserInfo[]>([]);
  const columns: ProDescriptionsItemProps<API.UserInfo>[] = [
    {
      title: 'Nombre',
      dataIndex: 'name',
      tip: 'Buscar por nombre',
      formItemProps: {
        rules: [
          {
            required: true,
            message: 'El nombre es requerido',
          },
        ],
      },
    },
    {
      title: 'Nombre de usuario',
      dataIndex: 'nickName',
      valueType: 'text',
    },
    {
      title: 'Género',
      dataIndex: 'gender',
      hideInForm: true,
      valueEnum: {
        0: { text: 'M', status: 'MALE' },
        1: { text: 'F', status: 'FEMALE' },
      },
    },
    {
      title: 'Acciones',
      dataIndex: 'option',
      valueType: 'option',
      render: (_, record) => (
        <>
          <a
            onClick={() => {
              handleUpdateModalVisible(true);
              setStepFormValues(record);
            }}
          >
            Configuración
          </a>
          <Divider type="vertical" />
          <a href="">Suscribir a alertas</a>
        </>
      ),
    },
  ];

  return (
    <PageContainer
      header={{
        title: 'CRUD',
      }}
    >
      <ProTable<API.UserInfo>
        headerTitle="Buscador"
        actionRef={actionRef}
        rowKey="id"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            key="1"
            type="primary"
            onClick={() => handleModalVisible(true)}
          >
            Nuevo
          </Button>,
        ]}
        request={async (params, sorter, filter) => {
          const { data, success } = await queryUserList({
            ...params,
            // FIXME: remove @ts-ignore
            // @ts-ignore
            sorter,
            filter,
          });
          return {
            data: data?.list || [],
            success,
          };
        }}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => setSelectedRows(selectedRows),
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              Seleccionado{' '}
              <a style={{ fontWeight: 600 }}>{selectedRowsState.length}</a>{' '}
              Ítem&nbsp;&nbsp;
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            Eliminar en lote
          </Button>
          <Button type="primary">Aprobar en lote</Button>
        </FooterToolbar>
      )}
      <CreateForm
        onCancel={() => handleModalVisible(false)}
        modalVisible={createModalVisible}
      >
        <ProTable<API.UserInfo, API.UserInfo>
          onSubmit={async (value) => {
            const success = await handleAdd(value);
            if (success) {
              handleModalVisible(false);
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          rowKey="id"
          type="form"
          columns={columns}
        />
      </CreateForm>
      {stepFormValues && Object.keys(stepFormValues).length ? (
        <UpdateForm
          onSubmit={async (value) => {
            const success = await handleUpdate(value);
            if (success) {
              handleUpdateModalVisible(false);
              setStepFormValues({});
              if (actionRef.current) {
                actionRef.current.reload();
              }
            }
          }}
          onCancel={() => {
            handleUpdateModalVisible(false);
            setStepFormValues({});
          }}
          updateModalVisible={updateModalVisible}
          values={stepFormValues}
        />
      ) : null}

      <Drawer
        width={600}
        open={!!row}
        onClose={() => {
          setRow(undefined);
        }}
        closable={false}
      >
        {row?.name && (
          <ProDescriptions<API.UserInfo>
            column={2}
            title={row?.name}
            request={async () => ({
              data: row || {},
            })}
            params={{
              id: row?.name,
            }}
            columns={columns}
          />
        )}
      </Drawer>
    </PageContainer>
  );
};

export default TableList;
