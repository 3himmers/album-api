const decode = require('safe-decode-uri-component')
const crypto = require('crypto')
const http = require('http')
const https = require('https')
const axios = require('axios')

const wyyEncrypt = require('../utils/wyyEncrypt')

const apiUrl = 'https://music.163.com/weapi/v1/album/'

const getAlbumInfo = (headersCookie, ip, albumId) => {
    return new Promise((resolve, reject) => {
        let url = apiUrl + albumId
        let headers = { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/42.0.2311.135 Safari/537.36 Edge/13.10586' }
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
        headers['Referer'] = 'https://music.163.com'
        headers['X-Real-IP'] = ip
        headers['X-Forwarded-For'] = ip

        let cookies = {}
            ; (headersCookie || '').split(/;\s+|(?<!\s)\s+$/g).forEach((pair) => {
                let crack = pair.indexOf('=')
                if (crack < 1 || crack == pair.length - 1) return
                cookies[decode(pair.slice(0, crack)).trim()] = decode(
                    pair.slice(crack + 1),
                ).trim()
            })

        let cookie = {
            ...cookies,
            __remember_me: true,
            NMTID: crypto.randomBytes(16).toString('hex'),
            _ntes_nuid: crypto.randomBytes(16).toString('hex'),
            MUSIC_A: anonymous_token
        }

        headers['Cookie'] = Object.keys(cookie)
            .map(
                (key) =>
                    encodeURIComponent(key) +
                    '=' +
                    encodeURIComponent(cookie[key]),
            )
            .join('; ')

        let data = {}
        let csrfToken = (headers['Cookie'] || '').match(/_csrf=([^(;|$)]+)/)
        data.csrf_token = csrfToken ? csrfToken[1] : ''
        data = wyyEncrypt.weapi(data)
        url = url.replace(/\w*api/, 'weapi')


        let settings = {
            method: 'POST',
            url: url,
            headers: headers,
            data: new URLSearchParams(data).toString(),
            httpAgent: new http.Agent({ keepAlive: true }),
            httpsAgent: new https.Agent({ keepAlive: true }),
        }
        let answer = { status: 200, body: {}, cookie: [] }

        axios(settings)
            .then((res) => {
                // const body = res.data
                // answer.cookie = (res.headers['set-cookie'] || []).map((x) =>
                //     x.replace(/\s*Domain=[^(;|$)]+;*/, ''),
                // )
                // answer.body = body
                // answer.status = answer.body.code || res.status
                let album = {
                    name: res.data.album.name
                }
                let artists = []
                for (let i = 0; i < res.data.album.artists.length; i++) {
                    artists.push(res.data.album.artists[i].name)
                }
                album.artists = artists
                var date = new Date(res.data.album.publishTime);
                Y = date.getFullYear() + '-'
                M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
                D = date.getDate()
                album.date = Y + M + D
                album.cover = res.data.album.picUrl
                let tracks = []
                for (let i = 0; i < res.data.songs.length; i++) {
                    let track = {
                        track_number: res.data.songs[i].no,
                        track_name: res.data.songs[i].name
                    }
                    tracks.push(track)
                }
                album.tracks = tracks
                album.link = "https://music.163.com/album?id=" + albumId
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