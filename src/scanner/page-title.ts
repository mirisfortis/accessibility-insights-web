// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { RuleConfiguration } from './iruleresults';
import { DocumentUtils } from './document-utils';

const pageCheckId: string = 'page-title';

export const pageConfiguration: RuleConfiguration = {
    checks: [
        {
            id: pageCheckId,
            evaluate: evaluateTitle,
        },
    ],
    rule: {
        id: 'page-title',
        selector: 'html',
        any: [pageCheckId],
        matches: function matches(node, virtualNode) {
            return node.ownerDocument.defaultView.self === node.ownerDocument.defaultView.top;
        },
        enabled: false,
    },
};

function evaluateTitle(node: HTMLElement, options: any): boolean {
    const docUtil = new DocumentUtils(document);
    const title = docUtil.title();
    if (title) {
        this.data({ pageTitle: title });
    }
    return true;
}