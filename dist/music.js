const ap = new APlayer({
    container: document.getElementById('aplayer'),
    fixed: true,
    autoplay: false,
    preload: 'auto',
    volume: 0.5,
    mutex: true,
    lrcType: 3,
    listMaxHeight: 200,
    audio: [
      {
        name: "吹梦到西洲",
        artist: '恋恋故人难/黄诗扶/妖扬',
        url: 'http://m10.music.126.net/20200225131931/a6665bfb212094a3281c4d2a9c96e859/ymusic/015a/035a/5158/60c5eb0330401d7ded24f22dea9195eb.mp3',
        cover: 'https://p1.music.126.net/XE1XFkkDYrEW_eXFFlsSYQ==/109951164202821890.jpg',
      },
      {
        name: '飞',
        artist: '王恩信Est/二胖u',
        url: 'http://m10.music.126.net/20200225133516/52c8f491ebc721ec675229e3dacc44e5/ymusic/0658/555d/035d/12b153ba54b77ca88cb747d0ca2b40c3.mp3',
        cover: 'https://p2.music.126.net/_5I2VNMes4k4lh5RyKI50A==/109951164532205791.jpg',
      },
      {
        name: 'And The Winner Is',
        artist: 'Gérard Darmon',
        url: 'http://m10.music.126.net/20200225133906/dbe2472d3c3f1cbf9a5a6b7467e5c667/ymusic/535a/545c/035f/d034837322c607bc35d145a2a8f0242a.mp3',
        cover: 'https://p2.music.126.net/u9bYfwafB5JfJz0p-Kcd2g==/6664139976155607.jpg',
      },
      {
        name: 'Lemon tree',
        artist: 'Richard Clayderman',
        url: 'http://m10.music.126.net/20200225135018/f55c59b6b46d1ee0cb4f0bfdef3468b0/ymusic/0299/622d/27bc/300841a0042eea8ace82a18b27df2f9b.mp3',
        cover: 'https://p1.music.126.net/9y7xdTefbhWVeGRH-1WlsA==/688294279029825.jpg',
      },
      {
        name: 'Battles and Wastelands',
        artist: 'Neo Retros',
        url: 'http://m10.music.126.net/20200225135414/16d0738ec340a0e4eaa6dba78a18035f/ymusic/fc40/88e3/a695/1328c57df6f390c1f9b9259e1ab075fd.mp3',
        cover: 'https://p2.music.126.net/5aTUx6jeROmJNYvOUq5XVw==/109951163454509125.jpg',
      },
      {
        name: '幻昼(钢琴+长笛版)-Illusionary Daytime',
        artist: '浅绯色的喵',
        url: 'http://m10.music.126.net/20200225135658/6d3ed8754358976ae9eb4cace8e3f28c/ymusic/5309/035f/045a/dcb326c4a2450b25b27430e082ebfee6.mp3',
        cover: 'https://p1.music.126.net/i_oRURZcoTSDh33NLRnr_g==/109951164308416450.jpg',
      },

    ]
});
