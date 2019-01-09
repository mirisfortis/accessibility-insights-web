// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { autobind } from '@uifabric/utilities';

import { HTMLElementUtils } from './../../common/html-element-utils';
import { FrameCommunicator, IMessageRequest } from './frame-communicator';
import { FrameMessageResponseCallback } from './window-message-handler';
import { IErrorMessageContent } from './window-message-marshaller';

export interface ScrollingWindowMessage {
    focusedTarget: string[];
}

export class ScrollingController {
    public static readonly triggerScrollingCommand = 'insights.scroll';
    private _htmlElementUtils: HTMLElementUtils;
    private _frameCommunicator: FrameCommunicator;

    constructor(frameCommunicator: FrameCommunicator, HTMLElementUtils: HTMLElementUtils) {
        this._frameCommunicator = frameCommunicator;
        this._htmlElementUtils = HTMLElementUtils;
    }

    public initialize() {
        this._frameCommunicator.subscribe(ScrollingController.triggerScrollingCommand,
            this.onTriggerScrolling);
    }

    @autobind
    private onTriggerScrolling(message: ScrollingWindowMessage, error: IErrorMessageContent, sourceWin: Window, responder?: FrameMessageResponseCallback) {
        this.processRequest(message);
    }

    public processRequest(message: ScrollingWindowMessage) {
        const selector: string[] = message.focusedTarget;
        if (selector.length === 1) {
            this.scrollElementInCurrentFrame(selector[0]);
        } else {
            const frameSelector: string = selector.splice(0, 1)[0];
            const frame = this._htmlElementUtils.querySelector(frameSelector) as HTMLIFrameElement;

            this.scrollElementInIFrames(selector, frame);
        }
    }

    private scrollElementInCurrentFrame(selector: string): void {
        const targetElement: Element =  this._htmlElementUtils.querySelector(selector);
        this._htmlElementUtils.scrollInToView(targetElement);
    }

    private scrollElementInIFrames(focusedTarget: string[], frame: HTMLIFrameElement): void {
        const message: ScrollingWindowMessage = {
            focusedTarget: focusedTarget,
        };

        this._frameCommunicator.sendMessage(this.createFrameRequestMessage(frame, message));
    }

    private createFrameRequestMessage(frame: HTMLIFrameElement, message: ScrollingWindowMessage): IMessageRequest<ScrollingWindowMessage> {
        return {
            command: ScrollingController.triggerScrollingCommand,
            frame: frame,
            message: message,
        } as IMessageRequest<ScrollingWindowMessage>;
    }
}