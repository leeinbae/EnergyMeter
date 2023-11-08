import React from 'react'
import dayjs from 'dayjs';
import {Layout, Table, Input, Tabs, DatePicker, Row, Col, DatePickerProps, Button} from 'antd'
import type { ColumnsType,TablePaginationConfig } from 'antd/es/table'
import LayoutHeader from "./layoutheader";
import LayoutFooter from "./layoutfooter";
import dynamic from "next/dynamic";
import LayoutSider from "./layoutsider";
import {DownloadOutlined,ReloadOutlined} from "@ant-design/icons";
const { Content } = Layout;
const { RangePicker } = DatePicker;
// const ipcRenderer = require("electron").ipcRenderer;
import { Excel } from "antd-table-saveas-excel";


const dateFormat = 'YYYY-MM-DD';
const today = new Date();
const YYYYMMDD = today.toISOString().substring(0, 10);

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
    let [dateString, setDateString] = React.useState([YYYYMMDD, YYYYMMDD]);
    //const [breadcrumbitems, setBreadcrumbitems] = React.useState();
    //const [rangevalue, setRangeValue] = React.useState([new Date(), new Date()]);

    React.useEffect(() => {

        document.getElementById("Breadcrumbtitle").innerHTML = "에너지 사용량 조회";

        window.ipc.on('db', (rows) => {
            console.log(rows)
            // @ts-ignore
            setDataSource(rows);
        })
        console.log('useEffect dateString', dateString);

        //window.ipc.send('db', { req: 'getUsage', u_date_from: '00000000', u_date_to: '99999999' });
        window.ipc.send('db', { req: 'getUsage', u_date_from: dateString[0].replace(/-/g, ''), u_date_to: dateString[1].replace(/-/g, '') });
    }, [])


    const columns: ColumnsType<DataType> = [
        // {
        //     title: "seq",
        //     dataIndex: "key"
        // },
        {
            title: "업체명",
            dataIndex: "v_name",
            onFilter: (value: string, record) => record.v_name.indexOf(value) === 0
        },
        {
            title: "계량기명",
            dataIndex: "m_name"
        },
        {
            title: "설비명",
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
            render: (number) => <div style={{textAlign:'right'}}>{number.toFixed(2)}</div>,
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
        if(dateString == null) {
            // @ts-ignore
            dateString = ['00000000', '99999999'];
        }
        // @ts-ignore
        window.ipc.send('db', { req: 'getUsage', u_date_from: dateString[0].replace(/-/g, ''), u_date_to: dateString[1].replace(/-/g, '') })
    };

    const excelColumns = [
        {
            title: '업체명',
            dataIndex: 'v_name',
            textAlign: 'right',
        },
        {
            title: '계량기명',
            dataIndex: 'm_name',
            textAlign: 'right',
        },
        {
            title: '설비명',
            dataIndex: 'f_name',
            textAlign: 'center',
        },
        {
            title: '사용일시',
            dataIndex: 'u_date',
            style: {
                textAlign: 'center',
            },
        },
        {
            title: '사용량',
            dataIndex: 'u_usage',
            textAlign: 'right',
        }
    ];
    const exportToExcel = () => {


        // SaveAsExcel({
        //     table: document.getElementById('UsageTable'),
        //     filename: 'UsageTable.xlsx',
        // })
        // console.log(typeof columns)

        const excel = new Excel();
        // @ts-ignore
        excel.addSheet("fems").addColumns(excelColumns)
            .addDataSource(dataSource, {
                str2Percent: true
            })
            .saveAs("FEMS"+dateString[0]+"~"+dateString[1]+".xlsx");
    };

    return (

        <Layout>
            <LayoutSider/>
            <Layout >
                <LayoutHeader/>
                <Content className={'canvas-size'}>
                    <Row style={{justifyContent: 'space-between' }}>
                        <Col span={6}><RangePicker onChange={onChange} style={{ width: '100%' }} defaultValue={[dayjs(dateString[0], dateFormat), dayjs(dateString[1], dateFormat)]} /></Col>
                        <Col span={2}>
                            <Button type="primary" onClick={reload} icon={<ReloadOutlined  />}>
                            조회
                            </Button>
                        </Col>
                        <Col span={11}><Input.Search placeholder="조회 결과 필터" onSearch={search} enterButton /></Col>
                        <Col span={3}>
                            <div style={{ textAlign: 'center'}}>
                                <Button type="primary" onClick={exportToExcel} icon={<DownloadOutlined  />}>
                                엑셀 다운로드
                                </Button>
                            </div>

                        </Col>
                    </Row>


                    <Tabs>
                        <Tabs.TabPane tab="에너지 사용량 조회" key="1">
                            <Table id="UsageTable" bordered columns={columns}  dataSource={filtered == null ? dataSource : filtered}
                                   pagination={{pageSizeOptions:[14,50],defaultPageSize:14, showSizeChanger:true, position: ['bottomRight']}}
                                   summary={(pageData) => {
                                       let totalUsage = 0;

                                       pageData.forEach(({ u_usage }) => {
                                           totalUsage += u_usage;
                                       });

                                       return (

                                           <>
                                               <Table.Summary.Row style={{ backgroundColor: "#FFFBF5" }}>
                                                   <Table.Summary.Cell index={0} colSpan={4} align={'right'}>합계[kWh]</Table.Summary.Cell>
                                                   <Table.Summary.Cell index={1} align={'right'} >
                                                       {totalUsage.toFixed(2)}
                                                   </Table.Summary.Cell>
                                               </Table.Summary.Row>

                                           </>
                                       );
                                   }}

                            />
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
