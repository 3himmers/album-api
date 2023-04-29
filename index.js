const express = require('express')
const app = express()
const wyy = require('./lib/albumInfo_wyy')
const qq = require('./lib/albumInfo_qq')

app.set('trust proxy', true)
/**
 * CORS & Preflight request
 */
app.use((req, res, next) => {
    if (req.path !== '/' && !req.path.includes('.')) {
        res.set({
            'Access-Control-Allow-Credentials': true,
            'Access-Control-Allow-Origin': req.headers.origin || '*',
            'Access-Control-Allow-Headers': 'X-Requested-With,Content-Type',
            'Access-Control-Allow-Methods': 'PUT,POST,GET,DELETE,OPTIONS',
            'Content-Type': 'application/json; charset=utf-8',
        })
    }
    req.method === 'OPTIONS' ? res.status(204).end() : next()
})

app.get('/album/wyy', (req, res) => {
    wyy.getAlbumInfo(req.headers.cookie, req.ip, req.query.id)
        .then(res1 => {
            res.send(res1)
        })
        .catch(err => {
            console.log(err)
        })
})

app.get('/album/qq', (req, res) => {
    qq.getAlbumInfo(req.query.mid, req.query.id).then(res1 => {
        res.send(res1)
    })
        .catch(err => {
            console.log(err)
        })
})

app.listen(3010, () => {
})