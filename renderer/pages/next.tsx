import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import {Breadcrumb, Layout, Menu, Result} from 'antd'
import LayoutHeader from "./layoutheader";
import LayoutFooter from "./layoutfooter";

const { Header, Content } = Layout

export default function NextPage() {
    return (
        <React.Fragment>

            <LayoutHeader/>

            <Content style={{ padding: 16 }}>
                <Breadcrumb style={{ margin: '1px 0' }}>
                    <Breadcrumb.Item>Home</Breadcrumb.Item>
                    <Breadcrumb.Item>List</Breadcrumb.Item>
                    <Breadcrumb.Item>App</Breadcrumb.Item>
                </Breadcrumb>
                <Result status="success" title="IMPIX" subTitle="with Ant Design" />
            </Content>

            <LayoutFooter/>
        </React.Fragment>
    )
}
