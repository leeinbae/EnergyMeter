import React from 'react'
import {Breadcrumb, Layout, Menu, Result} from 'antd'
import LayoutHeader from "./layoutheader";
import LayoutFooter from "./layoutfooter";

const { Content } = Layout

export default function HomePage() {
  return (
      <React.Fragment>

        <LayoutHeader/>

        <Content style={{ padding: 16 }}>
          <Breadcrumb style={{ margin: '1px 0' }}>
            <Breadcrumb.Item>Home</Breadcrumb.Item>
            <Breadcrumb.Item>List</Breadcrumb.Item>
            <Breadcrumb.Item>App</Breadcrumb.Item>
          </Breadcrumb>
          <Result status="success" title="FEMS" subTitle="IMPIX" />
        </Content>

        <LayoutFooter/>
      </React.Fragment>
  )
}
