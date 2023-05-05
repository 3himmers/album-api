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
        let body
        spotifyApi.setAccessToken(spotifyToken)
        await spotifyApi.getAlbum(id)
            .then(function (data) {
                body = data.body
            }, function (err) {
                console.error(err)
            })
        if (body.tracks.items.length < 3) {
            return ({ code: 'B0012', msg: '专辑曲目过少' })
        }
        let album = {
            name: body.name,
            date: body.release_date,
            link: 'https://open.spotify.com/album/' + id
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
        let cdFlag = 0
        for (let i = 0; i < body.tracks.items.length; i++) {
            if (i > 2 && (body.tracks.items[i].disc_number != body.tracks.items[i - 1].disc_number)) {
                //disc_number change 
                cdFlag = i
            }
            let track = {
                track_number: body.tracks.items[i].track_number + cdFlag,
                track_name: body.tracks.items[i].name
            }
            tracks.push(track)
        }
        album.tracks = tracks
        return { code: '0', data: album }

    } catch (err) {
        console.log(err)
        retrun({ code: 'B0011', msg: '专辑地址错误' })
    }

}

module.exports = {
    getAlbumInfo
}