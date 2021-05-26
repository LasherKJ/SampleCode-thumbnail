import React from 'react'
import { shallow, mount } from 'enzyme'
import ThumbnailBar from './ThumbnailBar'

require('../../setupTests')

describe('ThumbnailBar', () => {
    it('renders without crashing', () => {
        shallow(<ThumbnailBar />)
    })
    it('renders with empty props object', () => {
        mount(<ThumbnailBar thumbnails={[]} />)
    })
    it('renders with full props object', () => {
        const fbMoc = jest.fn()
        const toggleMock = jest.fn()
        const clickMock = jest.fn()
        const addMock = jest.fn().mockImplementation(() => Promise.resolve('0'))
        const renderMock = jest
            .fn()
            .mockImplementation(() => Promise.resolve('0'))

        const wrapper = mount(
            <ThumbnailBar
                fs={false}
                fb={false}
                toggleFB={fbMoc}
                toggleFS={toggleMock}
                thumbnailClick={clickMock}
                thumbnails={{
                    5655910571573248: {
                        zoomStream: {
                            zoomUserName: '92020c457',
                            zoomTopic: '5745313738391552',
                            zoomUserId: 16778240,
                        },
                        role: 'controller',
                        name: 'd@d.com',
                        joinTime: 1617211418436,
                        meetingId: '5745313738391552',
                        memberID: '5655910571573248',
                    },
                }}
                membersIndex={[
                    {
                        5655910571573248: 1617211418436,
                        joinTime: 1617211418436,
                        memberId: '5655910571573248',
                    },
                ]}
                memberID={1}
                createGuest={addMock}
                renderVideo={renderMock}
            />
        )
    })
    it('fires functions', () => {
        const fbMoc = jest.fn()
        const toggleMock = jest.fn()
        const clickMock = jest.fn()
        const addMock = jest.fn().mockImplementation(() => Promise.resolve('0'))
        const renderMock = jest
            .fn()
            .mockImplementation(() => Promise.resolve('0'))

        const wrapper = mount(
            <ThumbnailBar
                fs={false}
                fb={false}
                toggleFB={fbMoc}
                toggleFS={toggleMock}
                thumbnailClick={clickMock}
                thumbnails={{
                    5655910571573248: {
                        zoomStream: {
                            zoomUserName: '92020c457',
                            zoomTopic: '5745313738391552',
                            zoomUserId: 16778240,
                        },
                        role: 'controller',
                        name: 'd@d.com',
                        joinTime: 1617211418436,
                        meetingId: '5745313738391552',
                        memberID: '5655910571573248',
                    },
                }}
                membersIndex={[
                    {
                        5655910571573248: 1617211418436,
                        joinTime: 1617211418436,
                        memberId: '5655910571573248',
                    },
                ]}
                memberID={1}
                createGuest={addMock}
                renderVideo={renderMock}
            />
        )
        //  REMOVED BY JULIANA wrapper.find('.fbwrapper').first().simulate('click')
        //  REMOVED BY JULIANA wrapper.find('.fswrapper').first().simulate('click')
        wrapper.find('.clickCatcher').first().simulate('click')
        //  REMOVED PER KEVIN expect(fbMoc).toHaveBeenCalled()
        //  REMOVED BY JULIANA expect(toggleMock).toHaveBeenCalled()
        expect(clickMock).toHaveBeenCalled()
    })
})
