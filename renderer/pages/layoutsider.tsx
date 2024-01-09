import React from 'react';
import { useRouter } from 'next/router';
import {AppstoreOutlined, HomeOutlined, LineChartOutlined, MailOutlined, SettingOutlined} from '@ant-design/icons';
import {Button, Layout, Menu, theme,} from 'antd';
import type { MenuProps } from 'antd';
import Head from "next/head";
import Link from 'next/link';
const { Header, Sider, Content } = Layout;

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

    React.useEffect(() => {
        console.log('setCurrentmenu -> currentmenu', currentmenu);
    }, [currentmenu])

    const onClick: MenuProps['onClick'] = (e) => {
        console.log('click ', e);
        // @ts-ignore
        setCurrentmenu(e.key);
        console.log('setCurrentmenu-currentmenu', currentmenu);

    };

    type MenuItem = Required<MenuProps>['items'][number];
    function getItem(
        label: React.ReactNode,
        key: React.Key,
        icon?: React.ReactNode,
        children?: MenuItem[],
        type?: 'group',
    ): MenuItem {
        return {
            key,
            icon,
            children,
            label,
            type,
        } as MenuItem;
    }

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
                    onClick={onClick}
                    theme="dark"
                    mode="inline"
                    selectedKeys={[currentmenu]}
                    defaultOpenKeys={['sub1']}
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
                        getItem('기준정보관리', 'sub1', <AppstoreOutlined />, [
                            getItem((
                                <Link href="/vcode">
                                    <a>업체코드</a>
                                </Link>
                            ), 'vcode'),
                            getItem((
                                <Link href="/mcode">
                                    <a>계량기코드</a>
                                </Link>
                            ), 'mcode'),
                            getItem((
                                <Link href="/fcode">
                                    <a>설비코드</a>
                                </Link>
                            ), 'fcode'),
                            getItem((
                                <Link href="/config">
                                    <a>설정</a>
                                </Link>
                            ), 'config'),
                        ]),

                    ]}
                />
            </Sider>
    );
};

export default LayoutSider;