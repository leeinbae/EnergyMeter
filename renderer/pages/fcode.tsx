import React, { useContext, useEffect, useRef, useState } from 'react';
import {Breadcrumb, Col, Layout, Menu, Result, Row, Tag} from 'antd'
import LayoutHeader from "./layoutheader";
import LayoutFooter from "./layoutfooter";
import LayoutSider from "./layoutsider";
import type { InputRef } from 'antd';
import { Button, Form, Input, Popconfirm, Table } from 'antd';
import type { FormInstance } from 'antd/es/form';

const { Header, Sider, Content } = Layout;

const EditableContext = React.createContext<FormInstance<any> | null>(null);

interface Item {
    key: string;
    v_code: string;
    f_code: string;
    f_name: string;
    f_factory: string;
}

interface EditableRowProps {
    index: number;
}

const EditableRow: React.FC<EditableRowProps> = ({ index, ...props }) => {
    const [form] = Form.useForm();
    return (
        <Form form={form} component={false}>
            <EditableContext.Provider value={form}>
                <tr {...props} />
            </EditableContext.Provider>
        </Form>
    );
};

interface EditableCellProps {
    title: React.ReactNode;
    editable: boolean;
    children: React.ReactNode;
    dataIndex: keyof Item;
    record: Item;
    handleSave: (record: Item) => void;
}

const EditableCell: React.FC<EditableCellProps> = ({
                                                       title,
                                                       editable,
                                                       children,
                                                       dataIndex,
                                                       record,
                                                       handleSave,
                                                       ...restProps
                                                   }) => {
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<InputRef>(null);
    const form = useContext(EditableContext)!;

    useEffect(() => {
        if (editing) {
            inputRef.current!.focus();
        }
    }, [editing]);

    const toggleEdit = () => {
        setEditing(!editing);
        form.setFieldsValue({ [dataIndex]: record[dataIndex] });
    };

    const save = async () => {
        try {
            const values = await form.validateFields();

            toggleEdit();
            handleSave({ ...record, ...values });
        } catch (errInfo) {
            console.log('Save failed:', errInfo);
        }
    };

    let childNode = children;

    if (editable) {
        childNode = editing ? (
            <Form.Item
                style={{ margin: 0 }}
                name={dataIndex}
                rules={[
                    {
                        required: true,
                        message: `${title} is required.`,
                    },
                ]}
            >
                <Input ref={inputRef} onPressEnter={save} onBlur={save} />
            </Form.Item>
        ) : (
            <div className="editable-cell-value-wrap" style={{ paddingRight: 24 }} onClick={toggleEdit}>
                {children}
            </div>
        );
    }

    return <td {...restProps}>{childNode}</td>;
};

type EditableTableProps = Parameters<typeof Table>[0];

interface DataType {//v_code, f_code, f_name, f_factory
    key: React.Key;
    v_code: string;
    f_code: string;
    f_name: string;
    f_factory: string;
}

type ColumnTypes = Exclude<EditableTableProps['columns'], undefined>;

export default function CodePage() {

    useEffect(() => {
        window.ipc.on('db', (rows) => {
            console.log(rows)
            // @ts-ignore
            setDataSource(rows);
        })
        window.ipc.send('db', { req: 'getFcode'})
    }   , [])


    const [dataSource, setDataSource] = useState<DataType[]>();

    useEffect(() => {
        document.getElementById("Breadcrumbtitle").innerHTML = "설비코드관리";
        console.log('useEffect dataSource', dataSource);
        //window.ipc.send('db', { req: 'setVcode',dataSource: dataSource})
    }   , [dataSource])

    const [count, setCount] = useState(2);

    const handleDelete = (key: React.Key) => {
        const newData = dataSource.filter((item) => item.key !== key);
        setDataSource(newData);
    };

    // @ts-ignore
    const defaultColumns: (ColumnTypes[number] & { editable?: boolean; dataIndex: string })[] = [
        {
            title: '업체코드',
            dataIndex: 'v_code',
            editable: true,
            width: '22%',
        },
        {
            title: '설비코드',
            dataIndex: 'f_code',
            editable: true,
            width: '22%',
        },
        {
            title: '설비명',
            dataIndex: 'f_name',
            editable: true,
            width: '22%',
        },
        {
            title: '설비위치(공장)',
            dataIndex: 'f_factory',
            editable: true,
            width: '22%',
        },
        {
            title: '삭제',
            dataIndex: 'operation',
            align: 'center',
            render: (_, record: { key: React.Key }) =>
                dataSource.length >= 1 ? (
                    // <Popconfirm title="Sure to delete?" onConfirm={() => handleDelete(record.key)}>
                    //     <a>Delete</a>
                    // </Popconfirm>
                    <a><Tag color="error"
                            onClick={() => handleDelete(record.key)}>X</Tag></a>

                ) : null,
        },
    ];

    const handleAdd = () => {
        const newData: DataType = {
            key: `IPX${count}`,
            v_code: `V${count}`,
            f_code: `F${count}`,
            f_name: `FN${count}`,
            f_factory: `FA${count}`,
        };
        setDataSource([...dataSource, newData]);
        setCount(count + 1);

    };

    const handleSave = (row: DataType) => {
        const newData = [...dataSource];
        const index = newData.findIndex((item) => row.key === item.key);
        const item = newData[index];
        newData.splice(index, 1, {
            ...item,
            ...row,
        });
        setDataSource(newData);
    };

    const components = {
        body: {
            row: EditableRow,
            cell: EditableCell,
        },
    };

    const columns = defaultColumns.map((col) => {
        if (!col.editable) {
            return col;
        }
        return {
            ...col,
            onCell: (record: DataType) => ({
                record,
                editable: col.editable,
                dataIndex: col.dataIndex,
                title: col.title,
                handleSave,
            }),
        };
    });

const save = () => {
    window.ipc.send('db', { req: 'setFcode',dataSource: dataSource})
}

    return (


        <Layout>
            <LayoutSider/>
            <Layout >
                <LayoutHeader/>
                <Content className={'canvas-size'}>

                    <div>
                        <Row style={{justifyContent: 'space-between' }}>
                            <Col span={12}>
                                <Button onClick={handleAdd} type="primary" style={{ marginBottom: 16 }}>
                                    추가
                                </Button>
                            </Col>
                            <Col span={12} style={{textAlign:'right'}}>
                                <Button onClick={save} type="primary" style={{ marginBottom: 16 }}>
                                    저장
                                </Button>
                            </Col>
                        </Row>

                        <Table
                            components={components}
                            rowClassName={() => 'editable-row'}
                            bordered
                            dataSource={dataSource}
                            columns={columns as ColumnTypes}
                        />
                    </div>

                </Content>
                <LayoutFooter/>
            </Layout>

        </Layout>




    )
}
