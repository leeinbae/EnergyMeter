import React from 'react'
import {Breadcrumb, Layout, Menu, Result} from 'antd'
import LayoutHeader from "./layoutheader";
import LayoutFooter from "./layoutfooter";
import LayoutSider from "./layoutsider";

const { Header, Sider, Content } = Layout;

export default function HomePage() {
    return (


        <Layout>
            <LayoutSider/>
            <Layout >
                <LayoutHeader/>
                <Content>

                    <Result status="success" title="FEMS" subTitle="IMPIX" />
                    <Result status="success" title="FEMS" subTitle="IMPIX" />
                    <Result status="success" title="FEMS" subTitle="IMPIX" />
                    <Result status="success" title="FEMS" subTitle="IMPIX" />
                    <Result status="success" title="FEMS" subTitle="IMPIX" />
                    <Result status="success" title="FEMS" subTitle="IMPIX" />
                    <Result status="success" title="FEMS" subTitle="IMPIX" />
                    <Result status="success" title="FEMS" subTitle="IMPIX" />
                    <Result status="success" title="FEMS" subTitle="IMPIX" />
                </Content>
                <LayoutFooter/>
            </Layout>

        </Layout>




    )
}
