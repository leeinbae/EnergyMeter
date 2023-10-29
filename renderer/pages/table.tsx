import React from 'react'
import {Layout, Table, Input, Tabs, DatePicker, Row, Col, DatePickerProps, Button} from 'antd'
import type { ColumnsType } from 'antd/es/table'
import LayoutHeader from "./layoutheader";
import LayoutFooter from "./layoutfooter";
import dynamic from "next/dynamic";
import LayoutSider from "./layoutsider";
import {DownloadOutlined,ReloadOutlined} from "@ant-design/icons";
const { Content } = Layout;
const { RangePicker } = DatePicker;
import { Excel } from "antd-table-saveas-excel";

const Line = dynamic(() => import('@ant-design/plots').then(({ Line }) => Line), { ssr: false, });

export default function NextPage() {

    interface DataType {
        key: number;
        v_code: string;
        v_name: string;
        m_code: string;
        m_name: string;
        f_code: string;
        f_name: string;
        u_date: string;
        u_usage: number;
        v_cal: number;
    }

    const [message, setMessage] = React.useState('No message found')
    const [dataSource, setDataSource] = React.useState();
    const [filtered, setFiltered] = React.useState();
    const [dateString, setDateString] = React.useState();
    const [breadcrumbitems, setBreadcrumbitems] = React.useState();

    React.useEffect(() => {

        document.getElementById("Breadcrumbtitle").innerHTML = "에너지 사용량 조회";

        window.ipc.on('message', (message: string) => {
            setMessage(message)
        })
        window.ipc.on('db', (rows) => {
            console.log(rows)
            // @ts-ignore
            setDataSource(rows);
        })
        window.ipc.send('db', { req: 'getUsage', u_date_from: '00000000', u_date_to: '99999999' })
    }, [])


    const columns: ColumnsType<DataType> = [
        // {
        //     title: "seq",
        //     dataIndex: "key"
        // },
        {
            title: "업체",
            dataIndex: "v_name",
            onFilter: (value: string, record) => record.v_name.indexOf(value) === 0
        },
        {
            title: "계량기",
            dataIndex: "m_name"
        },
        {
            title: "설비",
            dataIndex: "f_name"
        },
        {
            title: "사용일시",
            dataIndex: "u_date",
            align: 'center',
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
            dataIndex: "u_usage",
            align: 'right',
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


    function onChange(value, _dateString) {
        console.log('Formatted Selected Time: ', _dateString)
        setDateString(_dateString);
        setDataSource(null);
        window.ipc.send('db', { req: 'getUsage', u_date_from: _dateString[0].replace(/-/g, ''), u_date_to: _dateString[1].replace(/-/g, '') })
    }

    const reload = () => {
        console.log('useState dateString: ', dateString)
        // @ts-ignore
        window.ipc.send('db', { req: 'getUsage', u_date_from: dateString[0].replace(/-/g, ''), u_date_to: dateString[1].replace(/-/g, '') })
    };

    const exportToExcel = () => {
        const excel = new Excel();
        excel
            .addSheet("fems")
            .addColumns(columns)
            .addDataSource(dataSource, {
                str2Percent: true
            })
            .saveAs("Excel.xlsx");
    };



    return (

        <Layout style={{padding: 0}}>
            <LayoutSider/>
            <Layout >
                <LayoutHeader/>
                <Content>
                    <Row style={{justifyContent: 'space-between' }}>
                        <Col span={4}><RangePicker onChange={onChange} style={{ width: '100%' }} /></Col>
                        <Col span={2}>
                            <Button type="primary" onClick={reload} icon={<ReloadOutlined  />}>
                            새로 고침
                            </Button>
                        </Col>
                        <Col span={14}><Input.Search placeholder="조회 결과 필터" onSearch={search} enterButton /></Col>
                        <Col span={2}>
                            <div style={{ textAlign: 'center'}}>
                                <Button type="primary" onClick={exportToExcel} icon={<DownloadOutlined  />}>
                                엑셀 다운로드
                                </Button>
                            </div>

                        </Col>
                    </Row>


                    <Tabs>
                        <Tabs.TabPane tab="에너지 사용량 조회" key="1">
                            <Table bordered columns={columns}  dataSource={filtered == null ? dataSource : filtered} />
                        </Tabs.TabPane>
                        <Tabs.TabPane tab="기간 별 모니터링" key="2">
                            <Line {...config} />
                        </Tabs.TabPane>
                    </Tabs>
                </Content>
                <LayoutFooter/>
            </Layout>

        </Layout>



    )
}
