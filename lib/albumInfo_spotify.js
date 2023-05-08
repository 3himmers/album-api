const redis = require('redis')
const SpotifyWebApi = require('spotify-web-api-node')
const redisClient = redis.createClient()


redisClient.on('err', err => {
    console.log('redis client error: ', err)
})

redisClient.connect(6379, '127.0.0.1')

async function getAlbumInfo(id) {
    try {
        let spotifyToken = await redisClient.get("spotify_token")
        let spotifyId = await redisClient.get("spotify_id")
        let spotifySecret = await redisClient.get("spotify_secret")
        var spotifyApi = new SpotifyWebApi({
            clientId: spotifyId,
            clientSecret: spotifySecret,
        })
        if (spotifyToken == null) {
            await spotifyApi.clientCredentialsGrant().then(
                function (data) {
                    redisClient.set('spotify_token', data.body['access_token'])
                    redisClient.expire('spotify_token', data.body['expires_in'] - 100)
                    spotifyToken = data.body['access_token']
                },
                function (err) {
                    console.log('Something went wrong when retrieving an access token', err)
                }
            )
        }
        spotifyApi.setAccessToken(spotifyToken)
        await spotifyApi.getAlbum(id)
            .then(function (data) {
                body = data.body
            })
        // if (body.tracks.items.length < 2) {
        //     return ({ code: 'B0012', msg: '专辑曲目过少' })
        // }
        let album = {
            name: body.name,
            date: body.release_date,
            link: id,
            label: body.label
        }
        let artists = []
        for (let i = 0; i < body.artists.length; i++) {
            artists.push(body.artists[i].name)
        }
        album.artists = artists
        let maxHeight = 1
        for (let i = 0; i < body.images.length; i++) {
            if (body.images[i].height >= maxHeight) {
                album.cover = body.images[i].url
                maxHeight = body.images[i].height
            }
        }
        let tracks = []
        let offset = 0
        let trackNumber = 1
        while (offset < body.total_tracks) {
            let body2
            if (offset == 0) {
                body2 = body.tracks
            } else {
                await spotifyApi.getAlbumTracks(id, { limit: 50, offset: offset }).then(function (data) {
                    body2 = data.body
                })
            }
            for (let i = 0; i < body2.items.length; i++) {
                let discName = body2.items[i].disc_name
                if (discName == null) {
                    discNameNumber = (body2.items[i].disc_number < 10 ? '0' + body2.items[i].disc_number : body2.items[i].disc_number)
                    discName = 'CD' + discNameNumber
                }
                let track = {
                    disc_number: body2.items[i].disc_number,
                    track_number: trackNumber,
                    disc_name: discName,
                    track_name: body2.items[i].name
                }
                trackNumber++
                tracks.push(track)
            }
            offset += 50
        }
        album.tracks = tracks
        return { code: '0', data: album }

    } catch (err) {
        console.log(err)
        return ({ code: 'B0011', msg: '专辑地址错误' })
    }

}

module.exports = {
    getAlbumInfo
}