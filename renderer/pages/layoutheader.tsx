import React from 'react';
import { useRouter } from 'next/router';
import {AppstoreOutlined, HomeOutlined, LineChartOutlined, MailOutlined, SettingOutlined} from '@ant-design/icons';
import { Layout, Menu, theme, } from 'antd';
import type { MenuProps } from 'antd';
import Head from "next/head";
import Link from 'next/link'

const { Header } = Layout;
const App: React.FC = () => {

    const items: MenuProps['items'] = [
        {
            label: (
                <Link href="/home">
                    <a>HOME</a>
                </Link>
            ),
            key: 'home',
            icon: <HomeOutlined />,
        },

        {
            label: (
                <Link href="/table">
                    <a>에너지관리</a>
                </Link>
            ),
            key: 'table',
            icon: <LineChartOutlined />
        },
        {
            label: '기준정보관리',
            key: 'code',
            icon: <SettingOutlined />
        },
        // {
        //     label: '기준정보관리',
        //     key: 'SubMenu',
        //     icon: <SettingOutlined />,
        //     children: [
        //         {
        //             type: 'group',
        //             label: (
        //                 <Link href="/next">
        //                     <a>업체코드</a>
        //                 </Link>
        //             ),
        //         },
        //         {
        //             type: 'group',
        //             label: '계량기코드'
        //         },
        //         {
        //             type: 'group',
        //             label: '설비코드'
        //         },
        //     ],
        // }
    ];
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    let [currentmenu, setCurrentmenu] = React.useState();

    const router = useRouter();

    React.useEffect(() => {
        console.log('router.pathname', router.pathname);
        // @ts-ignore
        setCurrentmenu(router.pathname.replace("/", ""));
    }, [])

    const onClick: MenuProps['onClick'] = (e) => {
        console.log('click ', e);
        // @ts-ignore
        setCurrentmenu(e.key);
        console.log('setCurrentmenu-currentmenu', currentmenu);

    };

    return (
        <Layout className="layout">
            <Head>
                <title>Factory Energy Monitoring</title>
            </Head>
            <Header style={{ display: 'flex', alignItems: 'center' }}>
                <div className="demo-logo" />
                <Menu theme="dark" onClick={onClick} selectedKeys={[currentmenu]} mode="horizontal" items={items} />
            </Header>
        </Layout>
    );
};

export default App;