import React, { useContext, useEffect, useRef, useState } from 'react';
import {Breadcrumb, Col, Layout, Menu, Result, Row, Tag} from 'antd';
import LayoutHeader from "./layoutheader";
import LayoutFooter from "./layoutfooter";
import LayoutSider from "./layoutsider";
import type { InputRef } from 'antd';
import { Checkbox,Button, Form, Input, Popconfirm, Table } from 'antd';
import type { FormInstance } from 'antd/es/form';

const { Header, Sider, Content } = Layout;

const onFinish = (values: any) => {
    console.log('Success:', values);
};

const onFinishFailed = (errorInfo: any) => {
    console.log('Failed:', errorInfo);
};

type FieldType = {
    modbus_host?: string;
    modbus_port?: string;
};

export default function ConfigPage() {

    useEffect(() => {
        window.ipc.on('db', (rows) => {
            // @ts-ignore
            setDataSource(rows);
        })
        window.ipc.send('db', { req: 'getConfig'})
    }   , [])

    const [form] = Form.useForm();
    const [dataSource, setDataSource] = useState<FieldType[]>();
    const [modbusHost, setModbusHost] = useState('127.0.0.1');
    const [modbusPort, setModbusPort] = useState('501');

    useEffect(() => {
        document.getElementById("Breadcrumbtitle").innerHTML = "설정";
        console.log('useEffect dataSource', dataSource);
        if (dataSource) {
            setModbusHost(dataSource[0].modbus_host);
            setModbusPort(dataSource[0].modbus_port);
            console.log('modbusHost',modbusHost);
            console.log('modbusPort',modbusPort);
            form.setFieldsValue({ modbus_host: modbusHost, modbus_port: modbusPort });
        }
        //window.ipc.send('db', { req: 'setVcode',dataSource: dataSource})
    }   , [dataSource]);

    useEffect(() => {
        console.log('>>>> modbusHost',modbusHost);
        console.log('>>>> modbusPort',modbusPort);
    }   , [modbusHost,modbusPort]);


    const save = () => {
        window.ipc.send('db', { req: 'setFcode',dataSource: dataSource});
    }

    const getRead = () => {
        window.ipc.send('db', { req: 'getRead',args: {modbusHost: modbusHost, modbusPort: modbusPort}});
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

                            </Col>
                            <Col span={12} style={{textAlign:'right'}}>
                                <Button onClick={save} type="primary" style={{ marginBottom: 16 }}>
                                    저장
                                </Button>
                            </Col>
                        </Row>

                        <Form
                            form={form}
                            labelCol={{ span: 8 }}
                            wrapperCol={{ span: 16 }}
                            style={{ maxWidth: 600 }}

                            onFinish={onFinish}
                            onFinishFailed={onFinishFailed}
                            autoComplete="off"
                        >
                            <Form.Item<FieldType>
                                label="MODBUS IP"
                                name="modbus_host"
                                rules={[{ required: true, message: 'Fill in value' }]}
                            >
                                <Input onChange={(e) => setModbusHost(e.target.value)}/>
                            </Form.Item>

                            <Form.Item<FieldType>
                                label="MODBUS PORT"
                                name="modbus_port"
                                rules={[{ required: true, message: 'Fill in value' }]}
                            >
                                <Input />
                            </Form.Item>

                            <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                                <Button onClick={getRead} type="primary" htmlType="submit">
                                    MODBUS/TCP TEST
                                </Button>
                            </Form.Item>
                        </Form>
                    </div>

                </Content>
                <LayoutFooter/>
            </Layout>

        </Layout>

    )
}
