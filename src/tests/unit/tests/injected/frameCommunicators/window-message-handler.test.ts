// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IMock, It, Mock, MockBehavior, Times } from 'typemoq';

import { WindowUtils } from '../../../../../common/window-utils';
import { FrameMessageResponseCallback, WindowMessageHandler } from '../../../../../injected/frameCommunicators/window-message-handler';
import {
    IErrorMessageContent,
    IWindowMessage,
    WindowMessageMarshaller,
} from '../../../../../injected/frameCommunicators/window-message-marshaller';

describe('WindowMessageHandlerTests', () => {
    let testSubject: WindowMessageHandler;
    let mockWindowUtils: IMock<WindowUtils>;
    let mockMessageMarshaller: IMock<WindowMessageMarshaller>;
    let messageCallback: (e: MessageEvent) => void;

    beforeEach(() => {
        mockWindowUtils = Mock.ofType(WindowUtils, MockBehavior.Strict);
        mockMessageMarshaller = Mock.ofType<WindowMessageMarshaller>(null, MockBehavior.Strict);

        mockWindowUtils
            .setup(x => x.addEventListener(window, 'message', It.is((cb: (e: MessageEvent) => void) => cb != null), false))
            .callback((window, command, callback) => {
                messageCallback = callback;
            })
            .verifiable(Times.once());

        testSubject = new WindowMessageHandler(mockWindowUtils.object, mockMessageMarshaller.object);
    });

    afterEach(() => {
        mockMessageMarshaller.verifyAll();
        mockWindowUtils.verifyAll();
    });

    test('shouldNotInitializeMoreThanOnce', () => {
        mockWindowUtils.setup(x => x.addEventListener(window, 'message', It.isAny(), false)).verifiable(Times.once());

        testSubject.initialize();
        testSubject.initialize();
    });

    test('shouldRenmoveListenerOnDispose', () => {
        testSubject.initialize();

        mockWindowUtils.verifyAll();
        mockWindowUtils.reset();

        mockWindowUtils.setup(x => x.removeEventListener(window, 'message', messageCallback, false)).verifiable(Times.once());

        testSubject.dispose();

        mockWindowUtils.verifyAll();
    });

    test('verifyResponderIsCreatedForTargetWindow', () => {
        testSubject.initialize();
        const targetWindow = {} as Window;
        const sampleMessage = getSampleMessageWithResponseId();

        const mockCreateFrameResponderCallback = Mock.ofInstance(testSubject.createFrameResponderCallback);
        (testSubject.createFrameResponderCallback as any) = mockCreateFrameResponderCallback.object;

        mockMessageMarshaller
            .setup(x => x.createMessage(sampleMessage.command, sampleMessage.message, sampleMessage.messageId))
            .returns(() => sampleMessage)
            .verifiable();

        mockWindowUtils.setup(x => x.postMessage(targetWindow, sampleMessage, '*')).verifiable(Times.once());

        mockCreateFrameResponderCallback
            .setup(x => x(targetWindow, sampleMessage.command, sampleMessage.messageId))
            .returns(() => () => {});

        // sending message to iframe
        testSubject.post(targetWindow, sampleMessage.command, sampleMessage.message, null, sampleMessage.messageId);

        mockWindowUtils.verifyAll();
        mockMessageMarshaller.verifyAll();
        mockCreateFrameResponderCallback.verifyAll();
    });

    test('shouldNotInvokeResponseCallBackForAnotherMessage', () => {
        testSubject.initialize();
        const targetWindow = {} as Window;
        const sampleMessage = getSampleMessageWithResponseId();
        let isResponseCallbackInvoked = false;

        const callback: FrameMessageResponseCallback = (
            result: any,
            error: IErrorMessageContent,
            source: Window,
            responder?: FrameMessageResponseCallback,
        ) => {
            isResponseCallbackInvoked = true;
        };

        mockMessageMarshaller
            .setup(x => x.createMessage(sampleMessage.command, sampleMessage.message, sampleMessage.messageId))
            .returns(() => sampleMessage)
            .verifiable();

        mockWindowUtils.setup(x => x.postMessage(targetWindow, sampleMessage, '*')).verifiable(Times.once());

        // sending message to iframe
        testSubject.post(targetWindow, sampleMessage.command, sampleMessage.message, callback, sampleMessage.messageId);

        mockWindowUtils.verifyAll();
        mockMessageMarshaller.verifyAll();

        // mocking response from iframe for some other request
        const responseEvent: MessageEvent = {
            data: 'responseMessage',
        } as MessageEvent;

        const responseMessage: IWindowMessage = { messageId: 'anotherid', message: '' } as IWindowMessage;
        mockMessageMarshaller.setup(x => x.parseMessage(responseEvent.data)).returns(() => responseMessage);
        messageCallback(responseEvent);

        expect(isResponseCallbackInvoked).toBe(false);
    });

    test('shouldInvokeResponseCallBackForTargetMessage', () => {
        testSubject.initialize();
        const targetWindow = {} as Window;
        const sampleMessage = getSampleMessageWithResponseId();
        const responseMessage: IWindowMessage = getSampleMessageWithResponseId();

        let isResponseCallbackInvoked = false;

        const callback: FrameMessageResponseCallback = (
            result: any,
            error: IErrorMessageContent,
            source: Window,
            responder?: FrameMessageResponseCallback,
        ) => {
            isResponseCallbackInvoked = true;
            expect(result).toEqual(responseMessage.message);
            expect(error).toEqual(responseMessage.error);
            expect(responder).toBeDefined();
        };

        mockMessageMarshaller
            .setup(x => x.createMessage(sampleMessage.command, sampleMessage.message, sampleMessage.messageId))
            .returns(() => sampleMessage);

        mockWindowUtils.setup(x => x.postMessage(targetWindow, sampleMessage, '*')).verifiable(Times.once());

        // sending message to iframe
        testSubject.post(targetWindow, sampleMessage.command, sampleMessage.message, callback, sampleMessage.messageId);

        mockWindowUtils.verifyAll();
        mockMessageMarshaller.verifyAll();

        // mocking response from iframe
        const responseEvent: MessageEvent = {
            data: 'responseMessage',
        } as MessageEvent;

        mockMessageMarshaller.setup(x => x.parseMessage(responseEvent.data)).returns(() => responseMessage);
        messageCallback(responseEvent);

        expect(isResponseCallbackInvoked).toBe(true);
    });

    test('shouldNotInvokeSubscriberIfCallbackExists', () => {
        testSubject.initialize();
        const targetWindow = {} as Window;
        const sampleMessage = getSampleMessageWithResponseId();
        const responseMessage: IWindowMessage = getSampleMessageWithResponseId();

        let isResponseCallbackInvoked = false;
        let isSubscriberResponseCallbackInvoked = false;

        const callback: FrameMessageResponseCallback = (
            result: any,
            error: IErrorMessageContent,
            source: Window,
            responder?: FrameMessageResponseCallback,
        ) => {
            isResponseCallbackInvoked = true;
        };

        const subscriberCallback: FrameMessageResponseCallback = (
            result: any,
            error: IErrorMessageContent,
            source: Window,
            responder?: FrameMessageResponseCallback,
        ) => {
            isSubscriberResponseCallbackInvoked = true;
        };

        mockMessageMarshaller
            .setup(x => x.createMessage(sampleMessage.command, sampleMessage.message, sampleMessage.messageId))
            .returns(() => sampleMessage);

        mockWindowUtils.setup(x => x.postMessage(targetWindow, sampleMessage, '*')).verifiable(Times.once());

        // sending message to iframe (to register callback)
        testSubject.post(targetWindow, sampleMessage.command, sampleMessage.message, callback, sampleMessage.messageId);

        mockWindowUtils.verifyAll();
        mockMessageMarshaller.verifyAll();

        // mocking response from iframe
        const responseEvent: MessageEvent = {
            data: 'responseMessage',
        } as MessageEvent;

        // adding subscriber after callback is registered
        testSubject.addSubscriber(sampleMessage.command, callback);

        mockMessageMarshaller.setup(x => x.parseMessage(responseEvent.data)).returns(() => responseMessage);
        messageCallback(responseEvent);

        expect(isResponseCallbackInvoked).toBe(true);
        expect(isSubscriberResponseCallbackInvoked).toBe(false);
    });

    test('shouldCallSubscribersOnMessage', () => {
        testSubject.initialize();
        const targetWindow = {} as Window;
        const responseMessage: IWindowMessage = getSampleMessageWithResponseId();

        let isResponseCallbackInvoked = false;

        const callback: FrameMessageResponseCallback = (
            result: any,
            error: IErrorMessageContent,
            source: Window,
            responder?: FrameMessageResponseCallback,
        ) => {
            isResponseCallbackInvoked = true;
            expect(result).toEqual(responseMessage.message);
            expect(error).toEqual(responseMessage.error);
            expect(responder).toBeDefined();
        };

        testSubject.addSubscriber(responseMessage.command, callback);
        testSubject.addSubscriber('someother command', () => {
            expect('should not call other command subscriber').toBeFalsy();
        });

        const responseEvent: MessageEvent = { data: 'responseMessage' } as MessageEvent;
        mockMessageMarshaller.setup(x => x.parseMessage(responseEvent.data)).returns(() => responseMessage);
        messageCallback(responseEvent);

        expect(isResponseCallbackInvoked).toBe(true);
        mockMessageMarshaller.verifyAll();
    });

    test('shouldNotifyTargetWindowOnException', () => {
        testSubject.initialize();
        const targetWindow = {} as Window;
        const responseMessage: IWindowMessage = getSampleMessageWithResponseId();

        let isResponseCallbackInvoked = false;
        const sampleError = new Error('sample error');
        const callback: FrameMessageResponseCallback = (
            result: any,
            error: IErrorMessageContent,
            source: Window,
            responder?: FrameMessageResponseCallback,
        ) => {
            isResponseCallbackInvoked = true;
            throw sampleError;
        };

        testSubject.addSubscriber(responseMessage.command, callback);
        testSubject.addSubscriber('someother command', () => {
            expect('should not call other command subscriber').toBeFalsy();
        });

        const responseEvent: MessageEvent = { data: 'responseMessage', source: {} } as MessageEvent;
        mockMessageMarshaller
            .setup(x => x.parseMessage(responseEvent.data))
            .returns(() => responseMessage)
            .verifiable();
        mockMessageMarshaller
            .setup(x => x.createMessage(responseMessage.command, sampleError, responseMessage.messageId))
            .returns(() => responseMessage)
            .verifiable();
        mockWindowUtils.setup(x => x.postMessage(responseEvent.source, responseMessage, '*')).verifiable(Times.once());

        messageCallback(responseEvent);

        expect(isResponseCallbackInvoked).toBe(true);
        mockMessageMarshaller.verifyAll();
        mockWindowUtils.verifyAll();
    });

    test('shouldNotCallSubscribersAfterRemove', () => {
        testSubject.initialize();
        const targetWindow = {} as Window;
        const responseMessage: IWindowMessage = getSampleMessageWithResponseId();

        let isResponseCallbackInvoked = false;

        const callback: FrameMessageResponseCallback = (
            result: any,
            error: IErrorMessageContent,
            source: Window,
            responder?: FrameMessageResponseCallback,
        ) => {
            isResponseCallbackInvoked = true;
        };

        testSubject.addSubscriber(responseMessage.command, callback);
        testSubject.removeSubscriber(responseMessage.command);

        const responseEvent: MessageEvent = {
            data: 'responseMessage',
        } as MessageEvent;
        mockMessageMarshaller.setup(x => x.parseMessage(responseEvent.data)).returns(() => responseMessage);

        messageCallback(responseEvent);

        expect(isResponseCallbackInvoked).toBe(false);
        mockMessageMarshaller.verifyAll();
    });

    test('verifyFrameResponseCallback', () => {
        testSubject.initialize();
        const sampleMessage = getSampleMessageWithResponseId();
        const targetWindow = {} as Window;

        const frameCallback = testSubject.createFrameResponderCallback(targetWindow, sampleMessage.command, sampleMessage.messageId);

        mockMessageMarshaller
            .setup(x => x.createMessage(sampleMessage.command, sampleMessage.message, sampleMessage.messageId))
            .returns(() => sampleMessage)
            .verifiable(Times.once());
        mockWindowUtils.setup(x => x.postMessage(targetWindow, sampleMessage, '*')).verifiable(Times.once());

        frameCallback(sampleMessage.message, sampleMessage.error, null);

        mockMessageMarshaller.verifyAll();
        mockWindowUtils.verifyAll();
    });

    test('shouldNotThrowIfInvalidMessage', () => {
        testSubject.initialize();
        const responseEvent: MessageEvent = {
            data: 'responseMessage',
        } as MessageEvent;

        mockMessageMarshaller.setup(x => x.parseMessage(responseEvent.data)).returns(() => null);

        messageCallback(responseEvent);

        mockMessageMarshaller.verifyAll();
        mockWindowUtils.verifyAll();
    });

    function getSampleMessageWithResponseId() {
        return {
            message: {},
            command: 'command1',
            messageId: 'id1',
            error: {},
        } as IWindowMessage;
    }
});
