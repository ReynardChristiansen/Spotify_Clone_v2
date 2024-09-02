import { createContext, useRef, useState, useEffect } from "react";
export const PlayerContext = createContext();
import Cookies from 'js-cookie';

const PlayerContextProvider = (props) => {
    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();
    const [playlistHistory, setPlaylistHistory] = useState([]);
    const [likesong, setLikesong] = useState([]);
    

    const [track, setTrack] = useState({
        id: "mhycwNJZ",
        image: "https://c.saavncdn.com/519/Being-Funny-In-A-Foreign-Language-English-2022-20221125000319-500x500.jpg",
        name: "About You",
        url: "https://aac.saavncdn.com/519/6ad3d1794471c6663f90b3ea05b62b89_320.mp4"
    });

    const [playStatus, setPlayStatus] = useState(false);
    const [artist, setArtist] = useState("");
    const [downloadUrl, setDownloadUrl] = useState("");
    const [image, setImage] = useState("");
    const [name, setName] = useState("");
    const [id, setId] = useState("");
    const [volume, setVolume] = useState(Cookies.get('volume'));

    const [time, setTime] = useState({
        currentTime: {
            second: 0,
            minute: 0
        },
        totalTime: {
            second: 0,
            minute: 0
        }
    });

    useEffect(() => {
        if (audioRef.current) {
          audioRef.current.volume = volume;
          Cookies.set('volume', volume, { expires: 7, sameSite: 'None', secure: true });
        }
    }, [volume, setVolume]);

    useEffect(() => {
        const updateSeekBar = () => {
            const currentTime = audioRef.current.currentTime;
            const duration = audioRef.current.duration;
            seekBar.current.style.width = `${(currentTime / duration) * 100}%`;

            setTime({
                currentTime: {
                    second: Math.floor(currentTime % 60),
                    minute: Math.floor(currentTime / 60)
                },
                totalTime: {
                    second: Math.floor(duration % 60),
                    minute: Math.floor(duration / 60)
                }
            });

            if (currentTime === duration) {
                setPlayStatus(false);
                playWithUrl(downloadUrl, image, name, id);
            }
        };

        if (audioRef.current) {
            audioRef.current.ontimeupdate = updateSeekBar;
            audioRef.current.volume = volume;
        }
    }, [downloadUrl, image, name, id]);

    //---------------------------------------------------------------------------------------------------------------------------------------
    useEffect(() => {
        async function getArtist() {
            try {
                const apiRes = await fetch(`https://saavn.dev/api/songs/${track.id}`);
                const final = await apiRes.json();
                const newArtistId = final.data[0].artists.primary[0].id + "";
                setArtist(newArtistId);

                if (newArtistId) {
                    try {
                        const apiRes = await fetch(`https://saavn.dev/api/artists/${newArtistId}`);
                        const final_temp = await apiRes.json();

                        if (final_temp.data.topSongs.length == 0) {
                            const ids = Cookies.get('id');
                            const tokens = Cookies.get('token');
                            try {
                                const apiRes = await fetch(`https://hirmify-api.vercel.app/api/users/${ids}`, {
                                    method: 'GET',
                                    headers: {
                                        'Authorization': `Bearer ${tokens}`
                                    }
                                });
                                const getApis = await apiRes.json()
                                const tempsss = getApis.songs;
                                const randomIndexs = Math.floor(Math.random() * tempsss.length);
                                const randomLikeSong = tempsss[randomIndexs];

                                if (randomLikeSong.song_id == track.id) {
                                    getArtist();
                                }
                                else {
                                    setDownloadUrl(randomLikeSong.song_url);
                                    setImage(randomLikeSong.song_image);
                                    const songName = randomLikeSong.song_name.length > 15 ? randomLikeSong.song_name.slice(0, 15) + "..." : randomLikeSong.song_name;
                                    setName(songName);
                                    setId(randomLikeSong.song_id);
                                }



                            } catch (error) {
                                console.log(error);
                            }
                        }
                        else {
                            const id = Cookies.get('id');
                            const token = Cookies.get('token');

                            const randomIndex = Math.floor(Math.random() * final_temp.data.topSongs.length);
                            const randomSong = final_temp.data.topSongs[randomIndex];

                            if (track.id === randomSong.id) {
                                getArtist();
                            } else {
                                try {
                                    const apiRes = await fetch(`https://hirmify-api.vercel.app/api/users/${id}`, {
                                        method: 'GET',
                                        headers: {
                                            'Authorization': `Bearer ${token}`
                                        }
                                    });
                                    const getApi = await apiRes.json()
                                    const tempss = getApi.songs;
                                    const filteredSongs = tempss.filter(song => song.song_id !== track.id);


                                    if (filteredSongs.length == tempss.length - 1) {
                                        const randomIndex = Math.floor(Math.random() * filteredSongs.length);
                                        const randomSong = filteredSongs[randomIndex];

                                        if (randomSong.song_id == track.id) {
                                            getArtist();
                                        }
                                        else {
                                            setDownloadUrl(randomSong.song_url);
                                            setImage(randomSong.song_image);
                                            const songName = randomSong.song_name.length > 15 ? randomSong.song_name.slice(0, 15) + "..." : randomSong.song_name;
                                            setName(songName);
                                            setId(randomSong.song_id);
                                        }

                                    } else {
                                        setDownloadUrl(randomSong.downloadUrl[4].url);
                                        setImage(randomSong.image[2].url);
                                        const songName = randomSong.name.length > 15 ? randomSong.name.slice(0, 15) + "..." : randomSong.name;
                                        setName(songName);
                                        setId(randomSong.id);
                                    }

                                } catch (error) {
                                    console.log(error);
                                }

                            }
                        }



                    } catch (error) {
                        console.log(error);
                    }
                }

            } catch (error) {
                console.log(error);
            }
        }

        getArtist();
    }, [track.id]);

    //---------------------------------------------------------------------------------------------------------------------------------------

    useEffect(() => {
        if (audioRef.current && track.url) {
            audioRef.current.src = track.url;
            audioRef.current.play().then(() => setPlayStatus(true)).catch(error => console.log(error));
        }

        async function getLike() {
            const id = Cookies.get('id');
            const token = Cookies.get('token');
            try {

                const apiRes = await fetch(`https://hirmify-api.vercel.app/api/users/${id}`, {
                    method: 'GET',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const final = await apiRes.json();

                setLikesong(final.songs);
            } catch (error) {
                console.log(error);
            }
        }

        getLike();
    }, [track]);





    const play = () => {
        audioRef.current.play();
        setPlayStatus(true);
    };

    const previousSong = async () => {
        const currentIndex = playlistHistory.findIndex(song => song.id === track.id);
        const previousIndex = (currentIndex - 1 + playlistHistory.length) % playlistHistory.length;

        const { url, image, name, id } = playlistHistory[previousIndex];

        await playWithUrl(url, image, name, id);
    };

    const pause = () => {
        audioRef.current.pause();
        setPlayStatus(false);
    };

    const playNextSong = () => {
        playWithUrl(downloadUrl, image, name, id);
    };

    const seekSong = (e) => {
        audioRef.current.currentTime = (e.nativeEvent.offsetX / seekBg.current.offsetWidth) * audioRef.current.duration;
    };

    const playWithUrl = async (url, image, name, id) => {
        if (audioRef.current.src !== url) {
            audioRef.current.src = url;
        }
        await audioRef.current.play();
        setPlayStatus(true);

        setTrack({
            id: id,
            image: image,
            name: name,
            url: url
        });

        setPlaylistHistory(prev => {
            const updatedHistory = [...prev, {
                id: id,
                image: image,
                name: name,
                url: url
            }];
            return updatedHistory;
        });

    };

    const like = async (song_url, song_image, song_name, song_id) => {
        const id = Cookies.get('id');
        const token = Cookies.get('token');

        const song = {
            song_id: song_id,
            song_name: song_name,
            song_url: song_url,
            song_image: song_image
        };

        try {
            const apiRes = await fetch(`https://hirmify-api.vercel.app/api/users/update/${id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(song)
            });

            if (apiRes.ok) {
                const data = await apiRes.json();
            } else {
                console.error('Failed to add song:', apiRes.statusText);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };


    const deleteSong = async (song_id_user) => {
        const id = Cookies.get('id');
        const token = Cookies.get('token');

        const song = {
            song_id: song_id_user,
        };

        try {
            const response = await fetch(`https://hirmify-api.vercel.app/api/users/delete/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(song)
            });

            if (response.ok) {
                const data = await response.json();
                console.log('Song deleted successfully:', data);
            } else {
                const errorData = await response.json();
                console.error('Failed to delete song:', errorData.error);
            }
        } catch (error) {
            console.error('Error:', error);
        }
    };

    const contextValue = {
        audioRef,
        seekBg,
        seekBar,
        track, setTrack,
        playStatus, setPlayStatus,
        time, setTime,
        play,
        pause,
        seekSong,
        playWithUrl,
        playNextSong,
        previousSong,
        like,
        likesong,
        deleteSong,
        volume,
        setVolume
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;
