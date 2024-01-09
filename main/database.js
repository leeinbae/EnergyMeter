import {app} from "electron";

const sqlite3 = require('sqlite3').verbose();


function connect() {
    console.log('connect : ',app.getPath("userData")+'/database.db')
    return new sqlite3.Database(app.getPath("userData")+'/database.db') ;
}

export function getUsage(u_date_from = '00000000', u_date_to = '99999999') {
    return new Promise((resolve, reject) => {
        const db = connect();
        db.all('SELECT u.seq AS key, u.v_code, u.m_code, u.f_code, u.u_date, ROUND( u.u_usage * v.v_cal , 2 ) AS u_usage \n' +
            ', v.v_name , v.v_cal , m.m_name , f.f_name , f.f_factory \n' +
            'FROM usage_t u\n' +
            'INNER JOIN vend_t v ON u.v_code  = v.v_code \n' +
            'INNER JOIN meter_t m ON u.m_code = m.m_code AND u.v_code = m.v_code \n' +
            'INNER JOIN facility_t f ON u.f_code = f.f_code  AND u.v_code = f.v_code ' +
            'WHERE SUBSTR(u_date,1,8) >= ? AND SUBSTR(u_date,1,8) <= ? ' +
            'ORDER BY u.v_code , u.m_code , u.u_date',[u_date_from,u_date_to] ,(err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
        db.close();
    });
}

export async function upsertUsage(csvData) {

    const db = connect();

    // csv 파일의 각 행을 처리합니다.
    for (const row of csvData.split("\n")) {

        const values = row.split(",");
        console.log('u_date : ', values[3]);
        if(values[3]!==undefined){
            db.get('SELECT * FROM usage_t WHERE v_code = ? AND m_code = ? AND f_code = ? AND u_date = ?', [values[0], values[1], values[2], values[3]], async (err, row) => {
                if (err) {
                    throw err;
                }
                // row is an object representing the first record that matches the condition
                console.log(row);
                // 레코드가 존재하는 경우
                if (row) {
                    console.log('UPDATE');
                    await db.run("UPDATE usage_t SET u_usage = ? WHERE v_code = ? AND m_code = ? AND f_code = ? AND u_date = ? ", values[4], values[0], values[1], values[2], values[3]);
                } else {
                    console.log('INSERT');
                    await db.run("INSERT INTO usage_t (v_code, m_code, f_code, u_date, u_usage) VALUES (?, ?, ?, ?, ?)", values[0], values[1], values[2], values[3], values[4]);
                }
            });
        }

    }


    await db.close();
}

export function getVcode() {
    return new Promise((resolve, reject) => {
        const db = connect();
        db.all('SELECT rowid AS key, * FROM vend_t ORDER BY v_code',[] ,(err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
        db.close();
    });
}

export function setVcode(dataSource) {

    const db = connect();

    console.log('setVcode dataSource : ', dataSource);

    if(dataSource.length !== 0){
        db.run("DELETE FROM vend_t");
    }

    for (const srcrow of dataSource) {
        console.log('row : ', srcrow);

        db.run("INSERT INTO vend_t (v_code, v_name, v_cal) VALUES (?, ?, ?)", srcrow["v_code"], srcrow["v_name"], srcrow["v_cal"]);

        // db.get('SELECT * FROM vend_t WHERE v_code = ? ', [srcrow["v_code"]], (err, row) => {
        //     if (err) {
        //         throw err;
        //     }
        //     // 레코드가 존재하는 경우
        //     if (row) {
        //         console.log('UPDATE');
        //         db.run("UPDATE vend_t SET v_name = ? , v_cal = ? WHERE v_code = ?  ", srcrow["v_name"],srcrow["v_cal"],srcrow["v_code"]);
        //     } else {
        //         console.log('INSERT');
        //         db.run("INSERT INTO vend_t (v_code, v_name, v_cal) VALUES (?, ?, ?)", srcrow["v_code"], srcrow["v_name"], srcrow["v_cal"]);
        //     }
        // });
    }

    db.close();

    return true;
}

export function getMcode() {
    return new Promise((resolve, reject) => {
        const db = connect();
        db.all('SELECT rowid AS key, * FROM meter_t ORDER BY v_code,m_code',[] ,(err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
        db.close();
    });
}

export function setMcode(dataSource) {

    const db = connect();

    console.log('set dataSource : ', dataSource);

    if(dataSource.length !== 0){
        db.run("DELETE FROM meter_t");
    }

    for (const srcrow of dataSource) {
        console.log('row : ', srcrow);

        db.run("INSERT INTO meter_t (v_code, m_code, m_name) VALUES (?, ?, ?)", srcrow["v_code"], srcrow["m_code"], srcrow["m_name"]);

    }

    db.close();

    return true;
}

export function getFcode() {
    return new Promise((resolve, reject) => {
        const db = connect();
        db.all('SELECT rowid AS key, v_code, f_code, f_name, f_factory FROM facility_t ORDER BY v_code, f_code',[] ,(err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(rows);
        });
        db.close();
    });
}

export function setFcode(dataSource) {

    const db = connect();

    console.log('set dataSource : ', dataSource);

    if(dataSource.length !== 0){
        db.run("DELETE FROM facility_t");
    }

    for (const srcrow of dataSource) {
        console.log('row : ', srcrow);

        db.run("INSERT INTO facility_t (v_code, f_code, f_name, f_factory) VALUES (?, ?, ?, ?)", srcrow["v_code"], srcrow["f_code"], srcrow["f_name"], srcrow["f_factory"]);

    }

    db.close();

    return true;
}

export function getConfig() {
    return new Promise((resolve, reject) => {
        const db = connect();
        db.all('SELECT * FROM config_t',[] ,(err, rows) => {
            if (err) {
                resolve(-1);
                //reject(err);
                return;
            }
            resolve(rows);
        });
        db.close();
    });
}

export function setModbus(modbus_options) {

    const db = connect();

     db.run("UPDATE config_t SET modbus_host = ? , modbus_port = ? ", modbus_options.host,modbus_options.port);

     db.close();
}
// Export functions
export default getUsage;
