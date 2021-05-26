import React, { useState, useEffect } from 'react'
import ResizeHandler from '../ResizeHandler/ResizeHandler'
import ArrowIcon from '../SVGLoader/ArrowIcon'
import AddThumbnail from './AddThumbnail'
import ThumbNail from './Thumbnail'

function ThumbnailBar({
    fs,
    fb,
    toggleFB,
    toggleFS,
    thumbnailClick,
    thumbnails = {},
    membersIndex = [],
    participants = {},
    memberID,
    meetingData,
    createGuest,
    renderVideo,
    removeUser,
    muteUser,
    unmuteUser,
    muteAudio,
    unmuteAudio,
    startUserVideo,
    stopUserVideo,
    userRecordToggle,
}) {
    const [display, setDisplay] = useState(0)
    const [max, setMax] = useState(0)
    let me
    let unitWidth = 0
    let result = membersIndex
        .map((item, index) => {
            //map through membersIndex so arr is in order of jointime
            const ID = item.memberId
            let arrEntry = thumbnails[ID] //array entry is object from thumbnails object
            arrEntry.memberID = ID //add memberID by inserting object key as array entry
            return arrEntry
        })
        .filter(function (el) {
            //remove ones that dont have stop time
            return !el.stopTime
        })
    const testResults = [
        {
            joinTime: 1617049882191,
            meetingId: '5689816050040832',
            memberID: '5689816050040832',
            name: 'test1',
            roll: 'controller',
        },
        {
            joinTime: 1617049882192,
            meetingId: '5689816050040832',
            memberID: '5071006624382976',
            name: 'test2',
            roll: 'controller',
        },
        {
            joinTime: 1617049882193,
            meetingId: '5689816050040832',
            memberID: '5071006624382977',
            name: 'test3',
            roll: 'controller',
        },
        {
            joinTime: 1617049882194,
            meetingId: '5689816050040832',
            memberID: '5071006624322976',
            name: 'test4',
            roll: 'controller',
        },
        {
            joinTime: 1617049882195,
            meetingId: '5689816050040832',
            memberID: '5071006624682976',
            name: 'test5',
            roll: 'controller',
        },
    ]
    // result = result.concat(testResults)
    //making a new, shortened array so I can use result.length after render
    let toDisplay = result.slice(display * 4, display * 4 + 4) // only show four at a time

    toDisplay = toDisplay.map((thumbnail, index) => {
        //create elements
        let h = 125
        let w = 275
        if (fs === '.thumbnailFSCon_' + thumbnail.memberID) {
            const dim = ResizeHandler('fs')
            h = dim.height
            w = dim.width
        }
        if (fb === '.thumbnailFSCon_' + thumbnail.memberID) {
            const dim = ResizeHandler('fs')
            w = dim.width
            h = dim.height
        }
        let nW = h * 1.777
        if (nW >= w) {
            //if new width is greater than window width, make original width master
            h = w * 0.5625
        } else {
            //else height is master
            w = nW
        }
        if (!thumbnail.stopTime && thumbnail.memberID !== memberID) {
            let participantInfo = participants[thumbnail.memberID]
            unitWidth++
            return (
                <ThumbNail
                    participantInfo={participantInfo}
                    key={thumbnail.memberID}
                    thumbnail={thumbnail}
                    index={thumbnail.memberID}
                    fs={fs}
                    fb={fb}
                    toggleFB={toggleFB}
                    toggleFS={toggleFS}
                    thumbnailClick={thumbnailClick}
                    w={w}
                    h={h}
                    renderVideo={renderVideo}
                    removeUser={removeUser}
                    muteUser={muteUser}
                    unmuteUser={unmuteUser}
                    startUserVideo={startUserVideo}
                    stopUserVideo={stopUserVideo}
                    userRecordToggle={userRecordToggle}
                    meetingId={meetingData?.id}
                />
            )
        } else if (thumbnail.memberID == memberID) {
            //I want this as a seperate variable so I can always have (me) at the front
            unitWidth++
            let participantInfo = participants[thumbnail.memberID]
            me = (
                <ThumbNail
                    participantInfo={participantInfo}
                    key={memberID}
                    thumbnail={thumbnail}
                    index={memberID}
                    fs={fs}
                    fb={fb}
                    toggleFB={toggleFB}
                    toggleFS={toggleFS}
                    thumbnailClick={thumbnailClick}
                    w={w}
                    h={h}
                    renderVideo={renderVideo}
                    me={true}
                    removeUser={removeUser}
                    muteUser={muteAudio}
                    unmuteUser={unmuteAudio}
                    startUserVideo={startUserVideo}
                    stopUserVideo={stopUserVideo}
                    userRecordToggle={userRecordToggle}
                    meetingId={meetingData?.id}
                />
            )
        }
    })
    return (
        <>
            <AddThumbnail createGuest={createGuest} />
            <div id="thumbNailBar" style={{ width: unitWidth * 225 + 60 }}>
                <div
                    className={'thumbnailIndexBtn leftIndexBtn'}
                    onClick={() => changeIndex(-1)}
                    style={{
                        cursor: result.length > 4 ? 'pointer' : 'default',
                    }}
                >
                    {result.length > 4 && <ArrowIcon />}
                </div>
                {me}
                {toDisplay}
                <div
                    className={'thumbnailIndexBtn rightIndexBtn'}
                    onClick={() => changeIndex(1)}
                    style={{
                        cursor: result.length > 4 ? 'pointer' : 'default',
                    }}
                >
                    {result.length > 4 && <ArrowIcon />}
                </div>
            </div>
        </>
    )

    function changeIndex(dir) {
        let nDisplay
        if (dir === -1) {
            nDisplay = display - 1
            if (nDisplay < 0) {
                nDisplay = 0
            }
        }
        if (dir === 1) {
            nDisplay = display + 1
            if (nDisplay > Math.floor(result.length / 4)) {
                nDisplay = Math.floor(result.length / 4)
            }
        }
        setDisplay(nDisplay)
    }
}

export default ThumbnailBar
