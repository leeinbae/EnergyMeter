import React from 'react';
import {Layout, theme} from 'antd';

const { Footer } = Layout;

const App: React.FC = () => {
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    return (
        <Layout className="layout">
            <Footer style={{ textAlign: 'center' }}>FEMS ©2023 Created by IMPIX</Footer>
        </Layout>
    );
};

export default App;