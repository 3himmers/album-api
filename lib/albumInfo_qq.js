const axios = require('axios')

const getAlbumInfo = (mid, id) => {
    return new Promise((resolve, reject) => {
        let baseUrl = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_album_info_cp.fcg'

        const data = Object.assign({
            albummid: mid,
            albumid: id,
            format: 'json',
            outCharset: 'utf-8',
        });

        let settings = {
            method: 'GET',
            url: baseUrl,
            headers: {
                referer: 'https://c.y.qq.com/',
                host: 'c.y.qq.com',
                cookies: ''
            },
            params: data,
            g_tk: 1124214810,
            loginUin: global.uin || '0',
            hostUin: 0,
            inCharset: 'utf8',
            outCharset: 'utf-8',
            // format: 'json',
            notice: 0,
            platform: 'yqq.json',
            needNewCode: 0,
        }

        let answer = { status: 200, body: {}, cookie: [] }

        axios(settings)
            .then((res) => {
                const body = res.data.data
                // answer.cookie = (res.headers['set-cookie'] || []).map((x) =>
                //     x.replace(/\s*Domain=[^(;|$)]+;*/, ''),
                // )
                // answer.body = body
                // answer.status = answer.body.code || res.status
                let album = {
                    name: body.name,
                    artists: body.singername.split('/').reverse(),
                    date: body.aDate,
                    cover: 'https://y.qq.com/music/photo_new/T002R300x300M000' + body.mid + "_1.jpg?max_age=2592000",
                    link: 'https://y.qq.com/n/ryqq/albumDetail/' + body.mid
                }
                let tracks = []
                for (let i = 0; i < body.list.length; i++) {
                    let track = {
                        track_number: body.list[i].belongCD,
                        track_name: body.list[i].songname
                    }
                    tracks.push(track)
                }
                album.tracks = tracks
                if (answer.status === 200) {
                    resolve(album)
                }
                else reject(album)
            })
            .catch((err) => {
                console.log(err)
                answer.status = 502
                answer.body = { code: 502, msg: err }
                resolve({})
            })

    })
}


module.exports = {
    getAlbumInfo
}