import React from 'react'
import { shallow, mount } from 'enzyme'
import ThumbNail from './Thumbnail'

require('../../setupTests')
const { MockContext } = require('../../../mocks/CanvasContext')

describe('Thumbnail', () => {
    beforeEach(() => {
        HTMLCanvasElement.prototype.getContext = jest.fn(
            () => new MockContext()
        )
    })

    it('renders without crashing', () => {
        shallow(<ThumbNail thumbnail={[{ name: 'test' }]} />)
    })
    it('renders with props', () => {
        const toggleFB = jest.fn()
        const toggleFS = jest.fn()
        const clickMock = jest.fn()
        const renderMock = jest
            .fn()
            .mockImplementation(() => Promise.resolve('0'))
        mount(
            <ThumbNail
                key={0}
                thumbnail={{
                    name: 'test',
                    joinTime: '1615915550419',
                    role: 'controller',
                    memberID: '2',
                }}
                index={0}
                fs={false}
                fb={false}
                toggleFB={toggleFB}
                toggleFS={toggleFS}
                thumbnailClick={clickMock}
                w={100}
                h={100}
                renderVideo={renderMock}
            />
        )
    })
    it('fires functions', () => {
        const toggleFB = jest.fn()
        const toggleFS = jest.fn()
        const clickMock = jest.fn()
        const renderMock = jest
            .fn()
            .mockImplementation(() => Promise.resolve('0'))
        const wrapper = mount(
            <ThumbNail
                key={0}
                thumbnail={{
                    name: 'test',
                    joinTime: '1615915550419',
                    role: 'controller',
                    memberID: '2',
                }}
                index={0}
                fs={false}
                fb={false}
                toggleFB={toggleFB}
                toggleFS={toggleFS}
                thumbnailClick={clickMock}
                w={100}
                h={100}
                renderVideo={renderMock}
                muteUser={renderMock}
                unmuteUser={renderMock}
                startUserVideo={renderMock}
                stopUserVideo={renderMock}
            />
        )
        wrapper.find('.clickCatcher').first().simulate('click')
        wrapper.find('.thumbnailMute').first().simulate('click')
        wrapper.find('.thumbnailCamera').first().simulate('click')
        wrapper.find('.thumbnailRecord').first().simulate('click')

        expect(clickMock).toHaveBeenCalled()
        expect(renderMock).toHaveBeenCalledTimes(3)
    })
    it('shows popup', () => {
        const toggleFB = jest.fn()
        const toggleFS = jest.fn()
        const clickMock = jest.fn()
        const renderMock = jest
            .fn()
            .mockImplementation(() => Promise.resolve('0'))

        const wrapper = mount(
            <ThumbNail
                key={0}
                thumbnail={{
                    name: 'test',
                    joinTime: '1615915550419',
                    role: 'controller',
                    memberID: '2',
                }}
                index={0}
                fs={false}
                fb={false}
                toggleFB={toggleFB}
                toggleFS={toggleFS}
                thumbnailClick={clickMock}
                w={100}
                h={100}
                renderVideo={renderMock}
            />
        )
        wrapper.find('.phoneIconRotate').first().simulate('click')
        const popup = wrapper.find('div.popupstyle').exists()
        expect(popup).toBe(true)
    })
})
