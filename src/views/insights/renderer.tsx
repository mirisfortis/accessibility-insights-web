// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { DocumentManipulator } from '../../common/document-manipulator';
import { config } from '../../common/configuration';
import { rendererDependencies } from './dependencies';
import { Router, RouterDeps } from './router';

export type RendererDeps = {
    dom: Node & NodeSelector;
    render: ReactDOM.Renderer;
    initializeFabricIcons: () => void;
} & RouterDeps;

export function renderer(deps: RendererDeps = rendererDependencies) {
    const { dom, render, initializeFabricIcons } = deps;
    const iconPath = '../' + config.getOption('icon16');
    const documentElementSetter = new DocumentManipulator(dom);
    documentElementSetter.setShortcutIcon(iconPath);

    initializeFabricIcons();

    const insightsRoot = dom.querySelector('#insights-root');
    render(<Router deps={deps} />, insightsRoot);
}