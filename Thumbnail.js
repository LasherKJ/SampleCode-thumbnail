import React, { useState, useEffect } from 'react'
import MicrophoneIcon from '../SVGLoader/MicrophoneIcon'
import VideoCameraIcon from '../SVGLoader/VideoCameraIcon'
import RecordIcon from '../SVGLoader/RecordIcon'
import './ThumbnailBar.css'
import PhoneHandset from '../SVGLoader/PhoneHandset'
import VideoCanvas from '../VideoCanvas/VideoCanvas'
import AreYouSurePopup from '../Popup/AreYouSurePopup'
import WrtcConnection from '../WRTC/WrtcConnection'


// the "thumbnail" component is a small webRTC video, with some controls. They are the children of a .map() function.
function ThumbNail({
    participantInfo = { muted: false },
    thumbnail, // an object 
    // example thumbnail :
    //{
    //     joinTime: 1617049882191,
    //     meetingId: '5689816050040832',
    //     memberID: '5689816050040832',
    //     name: 'test1',
    //     roll: 'controller',
    // }
    index, // the key from the .map()
    fs, //boolean: whether or not this video is fullscreen
    fb, //boolean: whether or not this video is full browser size
    toggleFB, //function: make full browser size or exit full browser size
    toggleFS, //function: mae fullscreen or exit fullscreen
    thumbnailClick, //function to display video information
    w, //element width
    h, //element height
    renderVideo,  // asyncronous function to attach video to a canvas element
    removeUser, // asyncronous function to kick a user
    muteUser, // asyncronous function to mute a user
    unmuteUser, // asyncronous function to unmute a user 
    startUserVideo,// asyncronous function to unpause video
    stopUserVideo,// asyncronous function to pause video
    meetingId, //string: unique meeting identifier
}) {
    //editable title
    const [videoTitle, setVideoTitle] = useState(thumbnail.name)
    //show modal
    const [showHangupConfirmation, setShowHangupConfirmation] = useState(false)
    //is component mounted?
    const [canvasConnected, setCanvasConnected] = useState(false)
    //record icon
    const [isRec, setIsRec] = useState(false)

    //once rendered, connect video data to html canvas by calling renderVideo. Set canvasConnected boolean to prevent re-running
    useEffect(() => {
        const elem = document.getElementById('thumbnail_' + thumbnail.memberID)
        if (!canvasConnected) {
            // let renderVideoPromise = renderVideo(thumbnail.memberID, elem)
            let renderVideoPromise = renderVideo(thumbnail.memberID, elem, 0)
            renderVideoPromise.then((response) => {
                setCanvasConnected(true)
            })
        }
    })
    //webRTC connection information 
    const HOST_RECORDER = 'https://rec.nobrolla.com/'
    const HOST_SIGNAL = 'https://signal.nobrolla.com/'

    const clientConfig = {
        recorderHost: HOST_RECORDER,
        signalHost: HOST_SIGNAL,
        meetingId: meetingId,
        memberId: index,
    }
    const wrtcClient = new WrtcConnection(clientConfig)
    let peerConnection

    return (
        <div className="thumbnailCon" key={index}>
            <div
                className={
                    '.thumbnailFSCon_' + index === fb
                        ? ' fullBrowserScreen thumbnailFSCon thumbnailFSCon_' +
                          index
                        : 'thumbnailFSCon thumbnailFSCon_' + index
                }
                onContextMenu={(e) => e.preventDefault()}
            >
                <div
                    className={'clickCatcher thumbnailVid_' + index}
                    onContextMenu={(e) =>
                        thumbnailClick(
                            2,
                            thumbnail.memberID,
                            thumbnail.name
                        )
                    }
                    style={{
                        width: w, // width was calculated by parent component because the number of thumbnails varies
                    }}
                >
                    <VideoCanvas
                        className={'thumbnails ' + thumbnail.videoObject}
                        id={'thumbnail_' + thumbnail.memberID}
                        height={h + 'px'} //height was calculated by parent component based on page layout
                        width={w}
                        toggleFB={(e) =>
                            toggleFB(
                                thumbnail.memberID,
                                thumbnail.name
                            )
                        }
                        toggleFS={(e) =>
                            toggleFS(
                                thumbnail.memberID,
                                thumbnail.name
                            )
                        }
                        fs={fs}
                        fb={fb}
                        title={thumbnail.name}
                        userID={thumbnail.memberID}
                        titleChange={(text) => setVideoTitle(text)}
                    />
                </div>
            </div>
            <div className={'thumbnailBtnCon'}>
                <div
                    className={'thumbnailBtn thumbnailMute'}
                    title={'Mute ' + videoTitle}
                    onClick={() => toggleMute(thumbnail.memberID)}
                >
                    <MicrophoneIcon //Icon components are .svgs with variable settings like color, whether to put a slash through them, etc
                        height={'24'}
                        width={'24'}
                        off={participantInfo.muted}
                    />
                </div>
                <div
                    className={'thumbnailBtn thumbnailCamera'}
                    title={'Turn off ' + videoTitle + ' camera'}
                    onClick={() => toggleVideo(thumbnail.memberID)}
                >
                    <VideoCameraIcon
                        height={'24'}
                        width={'24'}
                        off={!participantInfo.bVideoOn}
                    />
                </div>
                <div
                    className={'thumbnailBtn thumbnailRecord'}
                    title={'Record ' + videoTitle}
                    onClick={() => toggleRecord(thumbnail.memberID)}
                >
                    <RecordIcon
                        height={'24'}
                        width={'24'}
                        fill={isRec ? 'red' : '#A8A8A8'}
                    />
                </div>
                <div
                    className={'thumbnailBtn  phoneIconRotate'}
                    title={'Hang up ' + videoTitle}
                    onClick={() => setShowHangupConfirmation(true)}
                >
                    <PhoneHandset height={'24'} width={'24'} fill={'red'} /> 
                </div>
            </div>
            {showHangupConfirmation && ( // areYouSurePopup is a fullscreen modal with a confirmation window. showHangUpConfirmation is a boolean.
                <AreYouSurePopup
                    title="Please Confirm"
                    message={
                        'Are you sure you want to hang up ' +
                        videoTitle +
                        '? This will remove them from the call.'
                    }
                    handleContinue={() => doHandleHangup(thumbnail.memberID)}
                    handleCancel={() => setShowHangupConfirmation(false)}
                    cancelLabel="Close"
                    continueLable={'Hang up ' + videoTitle}
                />
            )}
        </div>
    )
    function doHandleHangup(memberID) {
        setShowHangupConfirmation(false)
        let hangupPromise = removeUser(memberID)
        hangupPromise.then((response) => {
            if (response === 0) {
                console.log('do hang up on ' + memberID)
            }
        })
    }

    function toggleMute(memberID) {
        if (participantInfo.muted) {
            let mutePromise = unmuteUser(memberID)
            mutePromise.then((response) => {
                if (response === 0) {
                    console.log('do unmute on ' + memberID)
                    //I know an if with nothing but a console is poor form, but it was expected that there would be a call back in here,
                    // unfortunately we haven't gotten this far
                }
            })
        } else if (!participantInfo.muted) {
            let mutePromise = muteUser(memberID)
            mutePromise.then((response) => {
                if (response === 0) {
                    console.log('do mute on ' + memberID)
                }
            })
        }
    }
    function toggleVideo(memberID) {
        if (participantInfo.bVideoOn) {
            let videoPromise = stopUserVideo(memberID)
            videoPromise.then((response) => {
                if (response === 0) {
                    console.log('turned camera off ' + memberID)
                }
            })
        } else if (!participantInfo.bVideoOn) {
            let videoPromise = startUserVideo(memberID)
            videoPromise.then((response) => {
                if (response === 0) {
                    console.log('turned camera off ' + memberID)
                }
            })
        }
    }
    async function toggleRecord() {
        if (isRec) {
            peerConnection?.close()
        } else {
            peerConnection = await wrtcClient.createConnection()
        }
        setIsRec(!isRec)
    }
}

export default React.memo(ThumbNail) //memoization prevented the video from triggering re-renders.
