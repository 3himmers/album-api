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

        axios(settings)
            .then((res) => {
                const body = res.data.data
                // if (body.list.length < 2) {
                //     return resolve({ code: 'B0012', msg: '专辑曲目过少' })
                // }
                let album = {
                    name: body.name,
                    artists: body.singername.split('/').reverse(),
                    date: body.aDate,
                    cover: 'https://y.qq.com/music/photo_new/T002R300x300M000' + body.mid + "_1.jpg?max_age=2592000",
                    link: body.mid,
                    label: body.company
                }

                let tracks = []
                if (body.classic_list != null) {
                    for (let i = 0; i < body.classic_list.length; i++) {
                        let startIndex = body.classic_list[i].index[0]
                        let endIndex = body.classic_list[i].index[1]
                        let discName = body.classic_list[i].desc[0].name
                        for (let j = startIndex; j <= endIndex; j++) {
                            let track = {
                                disc_number: i + 1,
                                track_number: body.list[j].belongCD,
                                disc_name: discName,
                                track_name: body.list[j].songname
                            }
                            tracks.push(track)
                        }
                    }
                } else {
                    for (let i = 0; i < body.list.length; i++) {
                        let track = {
                            disc_number: 1,
                            track_number: body.list[i].belongCD,
                            disc_name: 'CD01',
                            track_name: body.list[i].songname
                        }
                        tracks.push(track)
                    }
                }
                album.tracks = tracks
                return resolve({ code: '0', data: album })
            })
            .catch((err) => {
                console.log(err)
                return resolve({ code: 'B0011', msg: '专辑地址错误' })
            })

    })
}


module.exports = {
    getAlbumInfo
}