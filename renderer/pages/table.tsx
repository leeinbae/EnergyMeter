import React from 'react'
import {Layout, Table,  Input,  Tabs, Breadcrumb} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import { Line } from '@ant-design/charts';
import LayoutHeader from "./layoutheader";
import LayoutFooter from "./layoutfooter";

const {  Content } = Layout

export default function NextPage() {

    interface DataType {
        key: number;
        v_code: string;
        m_code: string;
        f_code: string;
        u_date: string;
        u_usage: number;
    }

    const [message, setMessage] = React.useState('No message found')
    const [dataSource, setDataSource] = React.useState();
    const [filtered, setFiltered] = React.useState();

    React.useEffect(() => {
        window.ipc.on('message', (message: string) => {
            setMessage(message)
        })
        window.ipc.on('db', (rows) => {
            console.log(rows)
            // @ts-ignore
            setDataSource(rows);
        })
        window.ipc.send('db', 'getUsage')
    }, [])


    const columns: ColumnsType<DataType> = [
        {
            title: "seq",
            dataIndex: "key"
        },
        {
            title: "업체",
            dataIndex: "v_code",
            onFilter: (value: string, record) => record.v_code.indexOf(value) === 0
        },
        {
            title: "계량기",
            dataIndex: "m_code"
        },
        {
            title: "설비",
            dataIndex: "f_code"
        },
        {
            title: "사용일시",
            dataIndex: "u_date",
            onCell: () => {
                return {
                    style: {
                        whiteSpace: 'nowrap'
                    }
                }
            },
        },
        {
            title: "사용량",
            dataIndex: "u_usage"
        }
    ];

    const search = value => {
        //const {dataSource} = this.state;
        // console.log("PASS", {value});

        // @ts-ignore
        const filtered = dataSource.filter(o =>
            Object.keys(o).some(k =>
                String(o[k])
                    .toLowerCase()
                    .includes(value.toLowerCase())
            )
        );

        setFiltered(filtered);
    };

    const config = {
        data: dataSource,
        xField: 'u_date',
        yField: 'u_usage',
        height: 400,
        point: {
            size: 5,
            shape:'diamond',
            style:{
                fillOpacity :1,
                strokeOpacity :0,
            }
        }
    };

    return (
        <React.Fragment>

            <LayoutHeader/>

            <Content style={{ padding: 16 }}>
                <Breadcrumb style={{ margin: '0 0 10px 0' }}>
                    <Breadcrumb.Item>Home</Breadcrumb.Item>
                    <Breadcrumb.Item>List</Breadcrumb.Item>
                    <Breadcrumb.Item>App</Breadcrumb.Item>
                </Breadcrumb>
                <Input.Search placeholder="input search text" onSearch={search} enterButton />
                <Tabs>
                    <Tabs.TabPane tab="에너지 사용량 조회" key="1">
                        <Table columns={columns}  dataSource={filtered == null ? dataSource : filtered} />
                    </Tabs.TabPane>
                    <Tabs.TabPane tab="기간 별 모니터링" key="2">
                        <Line {...config} />
                    </Tabs.TabPane>
                </Tabs>

            </Content>
            <LayoutFooter/>
        </React.Fragment>
    )
}
