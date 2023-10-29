import React from 'react'
import Head from 'next/head'
import type { AppProps } from 'next/app'

// import 'antd/dist/antd.css'
import './custom.css'
import {ConfigProvider, theme} from "antd";

function MyApp({ Component, pageProps }: AppProps) {

    return (
        <ConfigProvider
            theme={{
                algorithm: theme.compactAlgorithm,
                components: {
                    Breadcrumb: {
                        itemColor: '#FFF',
                        linkColor: '#FFF',
                        linkHoverColor: '#CCC',
                        separatorColor: '#FFF',
                        lastItemColor: '#FFF',

                    },
                },
            }}
        >
            <React.Fragment>
                <Head>
                    <meta name="viewport" content="width=device-width, initial-scale=1" />
                </Head>
                <Component {...pageProps} />
            </React.Fragment>
        </ConfigProvider>
    )
}

export default MyApp
