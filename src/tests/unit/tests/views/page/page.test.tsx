// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import * as React from 'react';

import { configMutator } from '../../../../../common/configuration';
import { Page, PageDeps } from '../../../../../views/page/page';
import { shallowRender } from '../../../common/shallow-render';

configMutator.setOption('extensionFullName', 'EXTENSION_NAME');

describe('page view', () => {
    it('renders', () => {
        expect(shallowRender(<Page deps={{} as PageDeps}>INSIDE</Page>)).toMatchSnapshot();
    });
});
