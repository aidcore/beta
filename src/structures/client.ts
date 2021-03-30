import express from 'express'
import convertBS from '../util/booleanToString'

import * as fs from 'fs'

export default class Client {
    [x: string]: any

    constructor(connectionOptions: any){
        this.username = connectionOptions.username
        this.password = connectionOptions.password
        this.port = connectionOptions.port
        this.defaultDirname = connectionOptions.defaultDirname || 'aidcore'
        this.expressServer = express()
    }


    public query(stmt: string){
        if (stmt.startsWith('CREATE DATABASE')){
            var dbname: any = stmt?.split('<')?.pop()?.split('>')[0] 
            var partitionedCondition: any = stmt.split('partitioned:')[1]

            this.expressServer.use(express.static('src/public'))
            this.expressServer.set('views', 'src/views')
            this.expressServer.set('view engine', 'ejs')

            this.expressServer.get(`/${dbname}`, async (req: any, res: any) => {
                res.render('database', {
                    database_name: dbname,
                    database_partitioned: 'NO',
                    database_duplo: 'NO',
                    database_onlyadmins: 'YES',
                    database_autobackups: 'NO'
                })
            })

            this.expressServer.listen(this.port)

            if (!fs.existsSync(this.defaultDirname)){
                fs.mkdirSync(this.defaultDirname)
            }

            if (!fs.existsSync(this.defaultDirname + '/' + dbname)){
                fs.mkdirSync(this.defaultDirname + '/' + dbname)
            }
        }

        if (stmt.startsWith('CREATE TABLE')){
            var dbname: any = stmt?.split('[')?.pop()?.split(']')[0]
            var tablename: any = stmt?.split('<')?.pop()?.split('>')[0]
            var tablecontents: any = stmt?.split('(')?.pop()?.split(')')[0]
            
            this.expressServer.use(express.static('src/public'))
            this.expressServer.set('views', 'src/views')
            this.expressServer.set('view engine', 'ejs')

            if (!fs.existsSync(this.defaultDirname)){
                fs.mkdirSync(this.defaultDirname)
            }

            if (!fs.existsSync(this.defaultDirname + '/' + dbname)){
                fs.mkdirSync(this.defaultDirname + '/' + dbname)
            }

            fs.writeFileSync(this.defaultDirname + '/' + dbname + '/' + tablename + '.json', JSON.stringify([]))
        }

        if (stmt.startsWith('INSERT ROW')){
            var dbname: any = stmt?.split('[')?.pop()?.split(']')[0]
            var tablename: any = stmt?.split('<')?.pop()?.split('>')[0]
            var tablecontents: any = stmt?.split('(')?.pop()?.split(')')[0]

            if (!fs.existsSync(this.defaultDirname)){
                fs.mkdirSync(this.defaultDirname)
            }

            if (!fs.existsSync(this.defaultDirname + '/' + dbname)){
                fs.mkdirSync(this.defaultDirname + '/' + dbname)
            }

            var allContents

            if (fs.existsSync(this.defaultDirname + '/' + dbname + '/' + tablename + '.json')){
                allContents = JSON.parse(fs.readFileSync(this.defaultDirname + '/' + dbname + '/' + tablename + '.json', 'utf-8'))
            } else {
                allContents = []
            }

            allContents.push(tablecontents)

            fs.writeFileSync(
                this.defaultDirname + '/' + dbname + '/' + tablename + '.json',
                allContents
            )
        }
    }
}