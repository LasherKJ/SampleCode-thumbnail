import React, { useState, useEffect } from 'react'
import MicrophoneIcon from '../SVGLoader/MicrophoneIcon'
import VideoCameraIcon from '../SVGLoader/VideoCameraIcon'
import RecordIcon from '../SVGLoader/RecordIcon'
import './ThumbnailBar.css'
import PhoneHandset from '../SVGLoader/PhoneHandset'
import VideoCanvas from '../VideoCanvas/VideoCanvas'
import AreYouSurePopup from '../Popup/AreYouSurePopup'
import WrtcConnection from '../WRTC/WrtcConnection'

function ThumbNail({
    participantInfo = { muted: false },
    thumbnail,
    index,
    fs,
    fb,
    toggleFB,
    toggleFS,
    thumbnailClick,
    w,
    h,
    renderVideo,
    me,
    removeUser,
    muteUser,
    unmuteUser,
    startUserVideo,
    stopUserVideo,
    userRecordToggle,
    stopRender,
    meetingId,
}) {
    //editable title
    const [videoTitle, setVideoTitle] = useState(thumbnail.name)
    //show modal
    const [showHangupConfirmation, setShowHangupConfirmation] = useState(false)
    //is component mounted?
    const [canvasConnected, setCanvasConnected] = useState(false)
    //microphone icon
    const [isMic, setIsMic] = useState(false)
    //camera icon
    const [isCam, setIsCam] = useState(false)
    //record icon
    const [isRec, setIsRec] = useState(false)
    useEffect(() => {
        const elem = document.getElementById('thumbnail_' + thumbnail.memberID)
        if (!canvasConnected) {
            console.log('in useEffect')
            // let renderVideoPromise = renderVideo(thumbnail.memberID, elem)
            let renderVideoPromise = renderVideo(thumbnail.memberID, elem, 0)
            renderVideoPromise.then((response) => {
                setCanvasConnected(true)
            })
        }
    })
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
                            me ? thumbnail.name + '(me)' : thumbnail.name
                        )
                    }
                    onClick={(e) =>
                        thumbnailClick(
                            0,
                            thumbnail.memberID,
                            me ? thumbnail.name + '(me)' : thumbnail.name
                        )
                    }
                    style={{
                        width: w,
                    }}
                >
                    <VideoCanvas
                        className={'thumbnails ' + thumbnail.videoObject}
                        id={'thumbnail_' + thumbnail.memberID}
                        height={h + 'px'}
                        width={w}
                        toggleFB={(e) =>
                            toggleFB(
                                thumbnail.memberID,
                                me ? thumbnail.name + '(me)' : thumbnail.name
                            )
                        }
                        toggleFS={(e) =>
                            toggleFS(
                                thumbnail.memberID,
                                me ? thumbnail.name + '(me)' : thumbnail.name
                            )
                        }
                        fs={fs}
                        fb={fb}
                        title={me ? thumbnail.name + ' (me)' : thumbnail.name}
                        userID={thumbnail.memberID}
                        titleChange={(text) => setVideoTitle(text)}
                        stopRender={stopRender}
                    />
                </div>
            </div>
            {/* {!me && ( */}
            <div className={'thumbnailBtnCon'}>
                <div
                    className={'thumbnailBtn thumbnailMute'}
                    title={'Mute ' + videoTitle}
                    onClick={() => toggleMute(thumbnail.memberID)}
                >
                    <MicrophoneIcon
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
            {/* )} */}
            {showHangupConfirmation && (
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
        // let videoMutePromise = userVideoToggle(true, memberID)
        // videoMutePromise.then((response) => {
        //     if (response === 0) {
        //         console.log('toggle video on ' + memberID)
        //         setIsCam(!isCam)
        //     }
        // })
    }
    async function toggleRecord() {
        console.log('in here')
        if (isRec) {
            peerConnection?.close()
        } else {
            peerConnection = await wrtcClient.createConnection()
        }
        setIsRec(!isRec)
    }
}

// export default React.memo(ThumbNail)
export default ThumbNail
