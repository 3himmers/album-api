const express = require('express')
const app = express()
const request = require('request')
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

app.get('/album/link', (req, res) => {
    let url = decodeURI(req.query.url)
    if (url.includes('music.163.com')) {
        let id
        if (url.includes('?id=')) {
            id = url.slice(url.indexOf("?id=") + 4)
            if (id.includes('&')) {
                id = id.slice(0, id.indexOf('&'))
            }
        } else if (url.includes('album/')) {
            id = url.slice(url.indexOf('album/') + 6)
            if (id.includes('/')) {
                id = id.slice(0, id.indexOf('/'))
            }
        } else {
            return res.send({})
        }
        wyy.getAlbumInfo(req.headers.cookie, req.ip, id)
            .then(res1 => {
                return res.send(res1)
            })
            .catch(err => {
                return console.log(err)
            })
    } else if (url.includes('qq.com')) {
        let mid, id
        if (url.includes('details/album')) {
            if (!url.includes("albummid="))
                return res.send({})
            mid = url.slice(url.indexOf('albummid=') + 9)
            if (mid.includes("&"))
                mid = mid.slice(0, mid.indexOf("&"))
        } else if (url.includes('albumDetail/')) {
            let tempId = url.slice(url.indexOf('albumDetail/') + 12)
            if (tempId.length == 14) {
                mid = tempId
            } else if (tempId.length < 14) {
                id = tempId
            } else {
                return res.send({})
            }
        }
        if (mid != null || id != null)
            qq.getAlbumInfo(mid, id).then(res1 => {
                return res.send(res1)
            })
                .catch(err => {
                    return console.log(err)
                })
        else {
            if (!url.includes('base/fcgi-bin/'))
                return res.send({})
            request({ url: url, timeout: 2000, followRedirect: false }, function (err, res1) {
                url = res1.headers.location
                if (url == null)
                    return res.send({})
                if (!url.includes('albumId='))
                    return res.send({})
                id = url.slice(url.indexOf('albumId=') + 8)
                if (id.includes("&"))
                    id = id.slice(0, id.indexOf("&"))
                qq.getAlbumInfo(mid, id).then(res2 => {
                    return res.send(res2)
                })
                    .catch(err => {
                        return console.log(err)
                    })
            })
        }
    } else if (url.includes('open.spotify.com')) {

    } else {
        //bandcamp or other website
        console.log(url)
        const proxy = {
            host: "localhost",
            port: 7890
        };
        url = 'https://templime.bandcamp.com/album/timesurf'
        request({ url: url, proxy: proxy, timeout: 10000, followRedirect: false }, function (err, res, body) {
            console.log(body);
        })

    }
})

app.listen(3010, () => {
})