const request = require("request");
const cheerio = require("cheerio");
const pretty = require("pretty");

const proxy = {
    // host: "localhost",
    // port: 7890,
};

const getAlbumInfo = (url) => {
    return new Promise((resolve, reject) => {
        request(
            { url: url, proxy: proxy, timeout: 10000, followRedirect: false },
            function (err, res, body) {
                try {
                    let flag = 'ld+json">';
                    let s1 = body;
                    let s2 = s1.slice(s1.indexOf(flag) + 9);
                    let s3 = s2.slice(0, s2.indexOf(" </script>"));
                    let jsonData = JSON.parse(s3);
                    if (jsonData.track.itemListElement.length < 2) {
                        return resolve({ code: "B0012", msg: "专辑曲目过少" });
                    }
                    let album = {
                        name: jsonData.name,
                        artists: jsonData.byArtist.name.split(", "),
                        cover: jsonData.image,
                        link: url,
                        id: url,
                        label: jsonData.publisher.name,
                    };
                    var date = new Date(jsonData.datePublished);
                    Y = date.getFullYear() + "-";
                    M =
                        (date.getMonth() + 1 < 10
                            ? "0" + (date.getMonth() + 1)
                            : date.getMonth() + 1) + "-";
                    D =
                        date.getDate() < 10
                            ? "0" + date.getDate()
                            : date.getDate();
                    album.date = Y + M + D;
                    let tracks = [];
                    for (
                        let i = 0;
                        i < jsonData.track.itemListElement.length;
                        i++
                    ) {
                        let track = {
                            disc_number: 1,
                            track_number:
                                jsonData.track.itemListElement[i].position,
                            disc_name: "CD01",
                            track_name:
                                jsonData.track.itemListElement[i].item.name,
                        };
                        tracks.push(track);
                    }
                    album.tracks = tracks;
                    return resolve({ code: "0", data: album });
                } catch (err) {
                    console.log(err);
                    return resolve({ code: "B0011", msg: "专辑地址错误" });
                }
            }
        );
    });
};

// const searchAlbumLink = (reqName, reqArtists, reqDate) => {
//     return new Promise((resolve, reject) => {
//         let searchUrl = 'https://bandcamp.com/search?q=timesurf&item_type=a'
//         request({ url: searchUrl, proxy: proxy, timeout: 10000, followRedirect: false }, function (err, res, body) {
//             try {
//                 const $ = cheerio.load(body)
//                 $(".result-info").each(function (index, item) {
//                     let name = $(item).find('.heading').text()
//                     name = name.trim()
//                     let artists = $(item).find('.subhead').text()
//                     artists = artists.trim()
//                     artists = artists.slice(artists.indexOf('by') + 3)
//                     let trackNumber = $(item).find('.length').text().trim()
//                     trackNumber = trackNumber.trim()
//                     trackNumber = trackNumber.slice(0, trackNumber.indexOf(' tracks,'))
//                     let date1 = $(item).find('.released').text()
//                     date1 = date1.trim()
//                     let date2 = new Date(date1)
//                     Y = date2.getFullYear() + '-'
//                     M = (date2.getMonth() + 1 < 10 ? '0' + (date2.getMonth() + 1) : date2.getMonth() + 1) + '-'
//                     D = (date2.getDate() < 10 ? '0' + (date2.getDate()) : date2.getDate())
//                     let releaseDate = Y + M + D
//                     let url = $(item).find('.itemurl').text()
//                     url = url.trim()
//                     console.log(name);
//                     console.log(artists);
//                     console.log(trackNumber);
//                     console.log(releaseDate);
//                     console.log(url);
//                 });
//                 return resolve({ code: '0', data: 1 })
//             } catch (err) {
//                 console.log(err);
//                 return resolve({ code: 'B0011', msg: '专辑地址错误' })
//             }
//         })
//     })
// }

module.exports = {
    getAlbumInfo,
    // searchAlbumLink
};
