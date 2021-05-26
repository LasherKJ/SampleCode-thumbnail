import React, { useState, useEffect } from 'react'
import spinner from '../LogInPage/91.gif'
import VisibilityOff from '../SVGLoader/visibility_off'
import VisibilityOn from '../SVGLoader/visibility-on'
import AddIcon from '../SVGLoader/AddIcon'
import CopyIcon from '../SVGLoader/CopyIcon'
import CloseIcon from '../SVGLoader/CloseIcon'

function AddThumbnail({ createGuest }) {
    const [name, setName] = useState('')
    const [pw, setPW] = useState('')
    const [link, setLink] = useState(null)
    const [stage, setStage] = useState(0)
    const [modal, setModal] = useState(false)
    const [show, setShow] = useState(false)
    const [copied, setCopied] = useState(false)

    useEffect(() => {
        window.addEventListener('keydown', escapePress)
    })
    return (
        <>
            {modal && (
                <>
                    <div
                        className={'thumbnailModal modalClickScreen'}
                        onClick={() => cancelModal()}
                    ></div>
                    <div className="popupstylePW popupstyleThumbnail popupstyle shadow">
                        <div className={'modalMessageBox'}>
                            <p
                                onClick={() => cancelModal()}
                                className={'closeIcon'}
                            >
                                <CloseIcon fill={'#eee'} />
                            </p>
                            <p>Guest Name</p>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => updateFields(e, 'name')}
                            />
                            <p>Set a Password (optional)</p>
                            <input
                                type={show ? 'text' : 'password'}
                                value={pw}
                                onChange={(e) => updateFields(e, 'pw')}
                            />
                            <button
                                className={'showHideBtn'}
                                onClick={() => setShow(!show)}
                            >
                                {show ? <VisibilityOff /> : <VisibilityOn />}
                            </button>
                            <br />
                            {stage === 0 ? (
                                <button
                                    onClick={() => addGuest()}
                                    className={'addBtn'}
                                >
                                    Generate Link
                                </button>
                            ) : (
                                <img
                                    src={spinner}
                                    className={'spinner'}
                                    alt=""
                                />
                            )}{' '}
                            <br />
                            {link && (
                                <>
                                    <p>Link:</p>
                                    <div id="textToCopy">
                                        {link}
                                        <button
                                            onClick={() => handleCopy()}
                                            className="copyBtn addBtn"
                                        >
                                            <CopyIcon
                                                height={'16px'}
                                                width={'16px'}
                                            />
                                        </button>
                                        {copied && (
                                            <p className={'copiedSplash'}>
                                                Copied
                                            </p>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </>
            )}

            <div className={'thumbnailCon addThumbnail'}>
                <div
                    className={'circleCon'}
                    onClick={() => showModal()}
                    alt="add participant"
                >
                    <p>Invite Guest</p>
                    <AddIcon
                        className="addParticipantIcon"
                        title="add participant"
                        fill="#1d1d1f"
                    />
                </div>
            </div>
        </>
    )

    function escapePress(e) {
        if (e.keyCode === 27) {
            cancelModal()
        }
    }
    function handleCopy() {
        var textPromise = navigator.clipboard.writeText(link)
        textPromise.then(() => {
            setCopied(true)
            setTimeout(function () {
                setCopied(false)
            }, 500)
        })
    }
    function showModal() {
        setModal(true)
    }
    function cancelModal() {
        setLink(null)
        setModal(false)
        setCopied(false)
    }
    function addGuest() {
        setStage(1)
        const guestPromise = createGuest(name, pw)
        guestPromise.then((response) => {
            let url = window.location.protocol + '//' + window.location.hostname
            const port = window.location.port
            if (port) {
                url = url + ':' + port
            }
            url = url + response
            setLink(url)
            setStage(0)
            setCopied(false)
        })
    }
    function updateFields(e, src) {
        if (src === 'name') {
            setName(e.target.value)
        } else if (src === 'pw') {
            setPW(e.target.value)
        }
    }
}

export default AddThumbnail
