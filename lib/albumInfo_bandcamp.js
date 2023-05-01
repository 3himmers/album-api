const request = require('request')

const getAlbumInfo = (url) => {
    return new Promise((resolve, reject) => {
        const proxy = {
            host: "localhost",
            port: 7890
        };
        request({ url: url, proxy: proxy, timeout: 10000, followRedirect: false }, function (err, res, body) {
            try {
                let flag = 'ld+json">'
                let s1 = body
                let s2 = s1.slice(s1.indexOf(flag) + 9)
                let s3 = s2.slice(0, s2.indexOf(' </script>'))
                let jsonData = JSON.parse(s3)
                let album = {
                    name: jsonData.name,
                    artists: jsonData.byArtist.name.split(', '),
                    cover: jsonData.image,
                    link: url
                }
                var date = new Date(jsonData.datePublished)
                Y = date.getFullYear() + '-'
                M = (date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1) + '-'
                D = date.getDate()
                album.date = Y + M + D
                let tracks = []
                if (jsonData.track.itemListElement.length == 1) {
                    resolve({ code: '-1' })
                }
                for (let i = 0; i < jsonData.track.itemListElement.length; i++) {
                    let track = {
                        track_number: jsonData.track.itemListElement[i].position,
                        track_name: jsonData.track.itemListElement[i].item.name
                    }
                    tracks.push(track)
                }
                album.tracks = tracks
                resolve(album)
            } catch (error) {
                console.log(error);
                resolve({})
            }
        })
    })
}


module.exports = {
    getAlbumInfo
}