// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
import { IColumn } from 'office-ui-fabric-react/lib/DetailsList';

import { UniquelyIdentifiableInstances } from '../../background/instance-identifier-generator';
import { ManualTestStatus } from '../../common/types/manual-test-status';
import { FeatureFlagStoreData } from '../../common/types/store-data/feature-flag-store-data';
import { AssessmentNavState, IGeneratedAssessmentInstance } from '../../common/types/store-data/iassessment-result-data';
import { DetailsViewActionMessageCreator } from '../../DetailsView/actions/details-view-action-message-creator';
import { AssessmentInstanceTable, IAssessmentInstanceRowData } from '../../DetailsView/components/assessment-instance-table';
import { TestStepLink } from '../../DetailsView/components/test-step-link';
import { IAnalyzer } from '../../injected/analyzers/ianalyzer';
import { DecoratedAxeNodeResult } from '../../injected/scanner-utils';
import { PropertyBags, VisualizationInstanceProcessorCallback } from '../../injected/visualization-instance-processor';
import { DrawerProvider } from '../../injected/visualization/drawer-provider';
import { IDrawer } from '../../injected/visualization/idrawer';
import { ContentPageComponent, HyperlinkDefinition } from '../../views/content/content-page';
import { IGetMessageGenerator } from '../assessment-default-message-generator';
import { AnalyzerProvider } from './../../injected/analyzers/analyzer-provider';
import { InstanceTableColumn } from './iinstance-table-column';
import { ReportInstanceFields } from './report-instance-field';

export interface TestStep {
    key: string;
    description: JSX.Element;
    order?: number;
    name: string;
    renderStaticContent?: () => JSX.Element;
    howToTest: JSX.Element;
    addFailureInstruction?: string;
    infoAndExamples?: ContentPageComponent;
    isManual: boolean;
    guidanceLinks: HyperlinkDefinition[];
    columnsConfig?: InstanceTableColumn[];
    getAnalyzer?: (provider: AnalyzerProvider) => IAnalyzer<any>;
    getVisualHelperToggle?: (props: VisualHelperToggleConfig) => JSX.Element;
    visualizationInstanceProcessor?: VisualizationInstanceProcessorCallback<PropertyBags, PropertyBags>;
    getDrawer?: (provider: DrawerProvider, featureFlagStoreData?: FeatureFlagStoreData) => IDrawer;
    updateVisibility?: boolean;
    getNotificationMessage?: (selectorMap: DictionaryStringTo<any>) => string;
    doNotScanByDefault?: boolean;
    switchToTargetTabOnScan?: boolean;
    generateInstanceIdentifier?: (instance: UniquelyIdentifiableInstances) => string;
    reportInstanceFields?: ReportInstanceFields;
    renderReportDescription?: () => JSX.Element;
    getInstanceStatus?: (result: DecoratedAxeNodeResult) => ManualTestStatus;
    getInstanceStatusColumns?: () => Readonly<IColumn>[];
    getDefaultMessage?: IGetMessageGenerator;
    renderInstanceTableHeader?: (table: AssessmentInstanceTable, items: IAssessmentInstanceRowData[]) => JSX.Element;
    renderRequirementDescription?: (testStepLink: TestStepLink) => JSX.Element;
}

export interface VisualHelperToggleConfig {
    assessmentNavState: AssessmentNavState;
    instancesMap: DictionaryStringTo<IGeneratedAssessmentInstance>;
    actionMessageCreator: DetailsViewActionMessageCreator;
    isStepEnabled: boolean;
    isStepScanned: boolean;
}
