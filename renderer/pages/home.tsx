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
                <Content style={{backgroundColor:'#4cabf7'}}>
                    <div style={{textAlign:'center'}}><img src="/images/home.png" alt='Energy' style={{width:'620px'}}/></div>

                </Content>
                <LayoutFooter/>
            </Layout>

        </Layout>




    )
}
