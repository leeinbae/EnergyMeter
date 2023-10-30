import React from 'react';
import {Breadcrumb, Layout,} from 'antd';
import Head from "next/head";
import Link from "next/link";

const { Header } = Layout;

const LayoutHeader: React.FC = () => {

    return (
        <React.Fragment>
            <Head>
                <title>Factory Energy Monitoring</title>
            </Head>
            <Header
                style={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 1,
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                }}
                className={'canvas-size'}
            >
                <div className="logo">
                    <img src="/images/fems.svg" alt="logo" />
                </div>
                <Breadcrumb separator=">" style={{ margin: '0 0 0 16px' }}
                            items={[
                                {
                                    title: <Link href="/home">
                                        <a>HOME</a>
                                    </Link>,
                                },
                                {
                                    title: <span id="Breadcrumbtitle"></span>,
                                },
                                // {
                                //     title: <a href="">Application List</a>,
                                // },
                                // {
                                //     title: 'An Application',
                                // }
                            ]}
                />
            </Header>
        </React.Fragment>
    );
};

export default LayoutHeader;