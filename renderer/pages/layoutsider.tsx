import React from 'react';
import { useRouter } from 'next/router';
import {AppstoreOutlined, HomeOutlined, LineChartOutlined, MailOutlined, SettingOutlined} from '@ant-design/icons';
import {Button, Layout, Menu, theme,} from 'antd';
import type { MenuProps } from 'antd';
import Head from "next/head";
import Link from 'next/link';
const { Header, Sider, Content } = Layout;
import {
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    UploadOutlined,
    UserOutlined,
    VideoCameraOutlined,
} from '@ant-design/icons';

const LayoutSider: React.FC = () => {


    const {
        token: { colorBgContainer },
    } = theme.useToken();

    let [currentmenu, setCurrentmenu] = React.useState();
    const [collapsed, setCollapsed] = React.useState(false);

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

            <Sider width={200} trigger={null} collapsible collapsed={collapsed}
                   style={{
                       overflow: 'auto',
                       height: '100vh',
                       position: 'fixed',
                       left: 0,
                       top: 0,
                       bottom: 0,
                   }}>
                <div className="logo-vertical" />
                <Menu
                    theme="dark"
                    mode="inline"
                    defaultSelectedKeys={['1']}
                    items={[
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
                            label:  (
                                <Link href="/code">
                                    <a>기준정보관리</a>
                                </Link>
                            ),
                            key: 'code',
                            icon: <SettingOutlined />
                        }
                    ]}
                />
            </Sider>
    );
};

export default LayoutSider;