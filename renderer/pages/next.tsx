import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Layout, Result } from 'antd'

const { Header, Content } = Layout

export default function NextPage() {
  return (
    <React.Fragment>
      <Head>
        <title>Next - Nextron (with-ant-design)</title>
      </Head>

      <Header>
        <Link href="/home">
          <a>Go to home page</a>
        </Link>
      </Header>

      <Content style={{ padding: 48 }}>
        <Result status="success" title="IMPIX" subTitle="with Ant Design" />
      </Content>
    </React.Fragment>
  )
}
