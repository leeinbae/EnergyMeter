import React from 'react';
import {Layout, theme,Image} from 'antd';

const { Footer } = Layout;

const App: React.FC = () => {
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    return (

            <Footer style={{ textAlign: 'center' }}>
                <img src="/images/made.png" alt="logo" width="300px" />
            </Footer>

    );
};

export default App;